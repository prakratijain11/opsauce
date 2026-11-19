import { z } from "zod";
import type { DocumentItem, Opportunity, StudentProfile } from "@/lib/types";
import {
  analyzeEligibility,
  checkReadiness,
  reviewApplication,
  type EligibilityResult,
  type ReadinessResult,
  type ReviewResult,
} from "@/lib/ai";
import { fingerprint, withCache } from "@/lib/ai-cache";

/**
 * Hybrid AI integration: a hosted Google Gemini model first, with a locally
 * running Ollama model as a fallback. Every function here *always* falls back
 * to the rule-based heuristic in `src/lib/ai.ts` when no provider is reachable,
 * slow, or returns something unparseable. Callers get the same shape either
 * way, plus `source: "ai" | "heuristic"`.
 *
 * Configure in .env:
 *   AI_ENABLED=true
 *   AI_PROVIDER=auto                 # auto | gemini | ollama
 *   GEMINI_API_KEY=...               # enables the hosted provider
 *   GEMINI_MODEL=gemini-3.5-flash-lite
 *   OLLAMA_BASE_URL=http://localhost:11434
 *   AI_MODEL=llama3.1               # any model you've `ollama pull`ed
 */

const AI_PROVIDER = (process.env.AI_PROVIDER ?? "auto").toLowerCase();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(/\/$/, "");
const OLLAMA_MODEL = process.env.AI_MODEL ?? "llama3.1";
/** Friendly name shown to users in place of the raw model id. */
export const AI_DISPLAY_NAME = process.env.AI_DISPLAY_NAME ?? "NovaMind5.8";
const ENABLED = (process.env.AI_ENABLED ?? "true").toLowerCase() !== "false";

type ProviderId = "gemini" | "ollama";
type Provider = {
  id: ProviderId;
  url: string;
  apiKey: string;
  model: string;
  jsonMode: boolean;
};

const CACHE_MODEL = activeProviders().map((p) => `${p.id}:${p.model}`).join("|") || "none";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function activeProviders(): Provider[] {
  const list: Provider[] = [];
  if (GEMINI_API_KEY && AI_PROVIDER !== "ollama") {
    list.push({
      id: "gemini",
      url: `${GEMINI_BASE_URL}/chat/completions`,
      apiKey: GEMINI_API_KEY,
      model: GEMINI_MODEL,
      jsonMode: false,
    });
  }
  if (AI_PROVIDER !== "gemini") {
    list.push({
      id: "ollama",
      url: `${OLLAMA_BASE_URL}/v1/chat/completions`,
      apiKey: process.env.AI_API_KEY ?? "",
      model: OLLAMA_MODEL,
      jsonMode: true,
    });
  }
  return list;
}

async function chatJSON<T>(
  messages: ChatMessage[],
  schema: z.ZodType<T>,
  { timeoutMs = 22_000, temperature = 0.2 }: { timeoutMs?: number; temperature?: number } = {},
): Promise<{ value: T; provider: ProviderId } | null> {
  if (!ENABLED) return null;

  for (const provider of activeProviders()) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(provider.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(provider.apiKey ? { Authorization: `Bearer ${provider.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          stream: false,
          temperature,
          ...(provider.jsonMode ? { response_format: { type: "json_object" } } : {}),
        }),
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) continue;

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = data.choices?.[0]?.message?.content;
      if (!raw) continue;

      const jsonText = extractJson(raw);
      if (!jsonText) continue;

      const parsed = schema.safeParse(JSON.parse(jsonText));
      if (parsed.success) return { value: parsed.data, provider: provider.id };
    } catch {
      // Try the next provider.
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

async function aiValue<T>(
  messages: ChatMessage[],
  schema: z.ZodType<T>,
  options?: { timeoutMs?: number; temperature?: number },
): Promise<{ value: T | null; provider?: ProviderId }> {
  const result = await chatJSON(messages, schema, options);
  return { value: result?.value ?? null, provider: result?.provider };
}

/** Models sometimes wrap JSON in prose or ```json fences. Pull out the object. */
function extractJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  return candidate.slice(start, end + 1);
}

function profileBlock(p: StudentProfile) {
  return [
    `Name: ${p.name}`,
    `Education level: ${p.educationLevel || "unknown"}`,
    `Field of study: ${p.fieldOfStudy || "unknown"}`,
    `Institution: ${p.institution || "unknown"}`,
    `Graduation year: ${p.graduationYear || "unknown"}`,
    `CGPA (0-10 scale): ${p.cgpa || "unknown"}`,
    `Location: ${[p.city, p.country].filter(Boolean).join(", ") || "unknown"}`,
    `Interests: ${p.interests.join(", ") || "none listed"}`,
    `Career goals: ${p.careerGoals.join(", ") || "none listed"}`,
    `Preferred opportunity types: ${p.preferredTypes.join(", ") || "none listed"}`,
  ].join("\n");
}

/* ────────────────────────────────────────────────────────────
   1. Eligibility analysis
   ──────────────────────────────────────────────────────────── */

const eligibilitySchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string().min(1).max(400),
  signals: z
    .array(
      z.object({
        label: z.string().min(1).max(60),
        verdict: z.enum(["likely", "check", "unlikely"]),
        reason: z.string().min(1).max(300),
      }),
    )
    .min(1)
    .max(6),
});

export async function analyzeEligibilitySmart(
  opportunity: Opportunity,
  profile: StudentProfile,
): Promise<EligibilityResult & { source: "ai" | "heuristic"; model?: string; provider?: ProviderId }> {
  const { value: ai, provider } = await aiValue(
    [
      {
        role: "system",
        content:
          "You are an academic opportunities advisor for students in India. " +
          "Assess how likely a student is to be ELIGIBLE to apply for an opportunity, " +
          "based only on the facts given. Be honest and specific; never invent criteria. " +
          'Reply with ONLY a JSON object: {"score": number 0-100, "summary": string, ' +
          '"signals": [{"label": string, "verdict": "likely"|"check"|"unlikely", "reason": string}]}. ' +
          "score = your confidence the student meets the stated eligibility. " +
          "Use 3-5 signals covering academic level, academic standing, profile/interest fit, " +
          "and any special criteria (means/income, nationality, team rules).",
      },
      {
        role: "user",
        content:
          `OPPORTUNITY\n` +
          `Title: ${opportunity.title}\n` +
          `Type: ${opportunity.type}\n` +
          `Organizer: ${opportunity.organizer}\n` +
          `Summary: ${opportunity.shortSummary}\n` +
          `Stated eligibility:\n- ${opportunity.eligibility.join("\n- ") || "not specified"}\n\n` +
          `STUDENT\n${profileBlock(profile)}`,
      },
    ],
    eligibilitySchema,
  );

  if (ai) {
    return {
      score: Math.round(ai.score),
      summary: ai.summary,
      signals: ai.signals,
      source: "ai",
      model: AI_DISPLAY_NAME,
      provider,
    };
  }
  return { ...analyzeEligibility(opportunity, profile), source: "heuristic" };
}

/* ────────────────────────────────────────────────────────────
   2. Readiness check
   ──────────────────────────────────────────────────────────── */

const readinessSchema = z.object({
  score: z.number().min(0).max(100),
  message: z.string().min(1).max(400),
  completedSections: z.array(z.string().min(1).max(60)).max(10),
  missing: z
    .array(
      z.object({
        section: z.string().min(1).max(60),
        detail: z.string().min(1).max(240),
        severity: z.enum(["missing", "review"]),
      }),
    )
    .max(10),
});

export async function checkReadinessSmart(
  profile: StudentProfile,
  documents: DocumentItem[],
): Promise<ReadinessResult & { source: "ai" | "heuristic"; model?: string; provider?: ProviderId }> {
  const docLines = documents.length
    ? documents
        .map((d) => `- ${d.name} (${d.category}, ${d.status.toLowerCase()})`)
        .join("\n")
    : "- none uploaded";

  const { value: ai, provider } = await aiValue(
    [
      {
        role: "system",
        content:
          "You help students get application-ready. Given a profile and a list of " +
          "documents in their vault, judge how ready they are to start a typical " +
          "scholarship/exam/internship application. Consider: personal details, educational " +
          "information, photograph, signature, identity proof, and category/income certificate " +
          "(only if claiming a benefit). " +
          'Reply with ONLY JSON: {"score": 0-100, "message": string, ' +
          '"completedSections": string[], "missing": [{"section": string, "detail": string, ' +
          '"severity": "missing"|"review"}]}. A document with status other than "verified" is "review".',
      },
      {
        role: "user",
        content:
          `STUDENT\n${profileBlock(profile)}\n` +
          `Profile completeness: ${profile.completeness}%\n\n` +
          `DOCUMENT VAULT\n${docLines}`,
      },
    ],
    readinessSchema,
  );

  if (ai) {
    return {
      score: Math.round(ai.score),
      message: ai.message,
      completedSections: ai.completedSections,
      missing: ai.missing,
      source: "ai",
      model: AI_DISPLAY_NAME,
      provider,
    };
  }
  return { ...checkReadiness(profile, documents), source: "heuristic" };
}

/* ────────────────────────────────────────────────────────────
   3. Recommendations ranking
   ──────────────────────────────────────────────────────────── */

export interface RankedOpportunity {
  slug: string;
  score: number;
  reason: string;
}

const rankSchema = z.object({
  ranked: z
    .array(
      z.object({
        slug: z.string().min(1),
        score: z.number().min(0).max(100),
        reason: z.string().min(1).max(240),
      }),
    )
    .max(20),
});

export async function rankRecommendationsSmart(
  opportunities: Opportunity[],
  profile: StudentProfile,
  limit = 6,
): Promise<{ items: RankedOpportunity[]; source: "ai" | "heuristic"; model?: string; provider?: ProviderId }> {
  const catalogue = opportunities
    .map(
      (o) =>
        `- slug: ${o.slug} | ${o.title} | type: ${o.type} | ${o.shortSummary} | tags: ${o.tags.join(", ")}`,
    )
    .join("\n");

  const { value: ai, provider } = await aiValue(
    [
      {
        role: "system",
        content:
          "You are a personalisation engine for a student opportunities platform. " +
          "Rank the opportunities by fit for THIS student, using their field, interests, " +
          "goals, level and preferred types. " +
          'Reply with ONLY JSON: {"ranked": [{"slug": string, "score": 0-100, "reason": string}]}. ' +
          "Use only slugs from the catalogue. reason is one short sentence addressed to the student. " +
          `Return at most ${limit} items, best first.`,
      },
      {
        role: "user",
        content: `STUDENT\n${profileBlock(profile)}\n\nCATALOGUE\n${catalogue}`,
      },
    ],
    rankSchema,
    { timeoutMs: 26_000 },
  );

  const valid = new Set(opportunities.map((o) => o.slug));
  if (ai) {
    const items = ai.ranked
      .filter((r) => valid.has(r.slug))
      .slice(0, limit)
      .map((r) => ({ slug: r.slug, score: Math.round(r.score), reason: r.reason }));
    if (items.length) return { items, source: "ai", model: AI_DISPLAY_NAME, provider };
  }

  // Heuristic fallback: interest + type match + deadline urgency.
  const items = opportunities
    .map((o) => {
      const typeBoost = profile.preferredTypes.includes(o.type) ? 30 : 0;
      const interestBoost = profile.interests.some((i) =>
        (o.title + o.shortSummary + o.tags.join(" ")).toLowerCase().includes(i.toLowerCase().split(" ")[0]),
      )
        ? 25
        : 0;
      const next = o.deadlines.find((d) => new Date(d.date).getTime() > Date.now());
      const urgency = next
        ? Math.max(0, 20 - Math.floor((new Date(next.date).getTime() - Date.now()) / 86_400_000 / 5))
        : 0;
      return {
        slug: o.slug,
        score: Math.min(100, 25 + typeBoost + interestBoost + urgency),
        reason: profile.preferredTypes.includes(o.type)
          ? `Matches your interest in ${o.type.toLowerCase()}s.`
          : `Relevant to your profile and goals.`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { items, source: "heuristic" };
}

/* ────────────────────────────────────────────────────────────
   4. Application Assistant — draft a field
   ──────────────────────────────────────────────────────────── */

const draftSchema = z.object({
  value: z.string().min(1).max(2000),
  confidence: z.number().min(0).max(100),
  rationale: z.string().min(1).max(300),
});

export async function draftFieldSmart(input: {
  fieldLabel: string;
  opportunityTitle: string;
  opportunityType: string;
  organizer: string;
  profile: StudentProfile;
}): Promise<{
  value: string;
  confidence: number;
  rationale: string;
  source: "ai" | "heuristic";
  model?: string;
  provider?: ProviderId;
}> {
  const { value: ai, provider } = await aiValue(
    [
      {
        role: "system",
        content:
          "You assist a student preparing an application. Draft ONE field's content, " +
          "grounded only in the student's real profile — never fabricate achievements, " +
          "marks, or experiences. Keep it concise, first-person, and honest. " +
          'Reply with ONLY JSON: {"value": string, "confidence": 0-100, "rationale": string}. ' +
          "confidence reflects how well the profile supports a strong answer. " +
          "rationale is one sentence on what you used and what the student should add.",
      },
      {
        role: "user",
        content:
          `FIELD TO DRAFT: ${input.fieldLabel}\n\n` +
          `OPPORTUNITY: ${input.opportunityTitle} (${input.opportunityType}) by ${input.organizer}\n\n` +
          `STUDENT PROFILE\n${profileBlock(input.profile)}`,
      },
    ],
    draftSchema,
    { timeoutMs: 45_000, temperature: 0.4 },
  );

  if (ai) {
    return {
      ...ai,
      confidence: Math.round(ai.confidence),
      source: "ai",
      model: AI_DISPLAY_NAME,
      provider,
    };
  }

  // Heuristic fallback: a safe, editable template.
  const p = input.profile;
  const value =
    `I am ${p.name}, ${p.educationLevel || "a student"} in ${p.fieldOfStudy || "my field"} at ` +
    `${p.institution || "my institution"}. My interests include ${p.interests.slice(0, 3).join(", ") || "my subject"}, ` +
    `and I am working towards ${p.careerGoals.slice(0, 2).join(" and ") || "my goals"}. ` +
    `I am applying to ${input.opportunityTitle} because it aligns closely with these interests and goals. ` +
    `[Add a specific project, achievement, or motivation here.]`;
  return {
    value,
    confidence: 40,
    rationale: "Drafted from your profile only. Add a concrete example before submitting.",
    source: "heuristic",
  };
}

/* ────────────────────────────────────────────────────────────
   5. Application Reviewer — analyze a completed draft
   ──────────────────────────────────────────────────────────── */

const reviewSchema = z.object({
  score: z.number().min(0).max(100),
  overallFeedback: z.string().min(1).max(400),
  findings: z.array(
    z.object({
      field: z.string().min(1).max(60),
      issue: z.string().min(1).max(300),
      suggestion: z.string().min(1).max(400),
      severity: z.enum(["critical", "minor"]),
    })
  ).max(10),
});

export async function reviewApplicationSmart(
  opportunity: Opportunity,
  profile: StudentProfile,
  fields: { label: string; value: string }[],
): Promise<ReviewResult & { source: "ai" | "heuristic"; model?: string; provider?: ProviderId }> {
  const { value: ai, provider } = await aiValue(
    [
      {
        role: "system",
        content:
          "You are a high-stakes application reviewer. Your goal is to help the student " +
          "maximize their chances of success. Be critical but constructive. " +
          "Analyze the provided application fields against the opportunity requirements. " +
          "Check for missing info, generic answers, or contradictions with the profile. " +
          'Reply with ONLY JSON: {"score": 0-100, "overallFeedback": string, ' +
          '"findings": [{"field": string, "issue": string, "suggestion": string, "severity": "critical"|"minor"}]}.',
      },
      {
        role: "user",
        content:
          `OPPORTUNITY\n` +
          `Title: ${opportunity.title}\n` +
          `Type: ${opportunity.type}\n` +
          `Summary: ${opportunity.shortSummary}\n\n` +
          `STUDENT PROFILE\n${profileBlock(profile)}\n\n` +
          `APPLICATION DRAFT\n${fields.map((f) => `- ${f.label}: ${f.value}`).join("\n")}`,
      },
    ],
    reviewSchema,
    { timeoutMs: 35_000, temperature: 0.3 },
  );

  if (ai) {
    return {
      ...ai,
      source: "ai",
      model: AI_DISPLAY_NAME,
      provider,
    };
  }
  return { ...reviewApplication(opportunity, profile, fields), source: "heuristic" };
}

/* ────────────────────────────────────────────────────────────
   Status
   ──────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────
   Cached wrappers — what pages should call
   ──────────────────────────────────────────────────────────── */

function profileFp(p: StudentProfile) {
  return fingerprint({
    e: p.educationLevel,
    f: p.fieldOfStudy,
    i: p.institution,
    g: p.graduationYear,
    c: p.cgpa,
    loc: [p.city, p.country],
    int: p.interests,
    goals: p.careerGoals,
    types: p.preferredTypes,
    comp: p.completeness,
  });
}

export function eligibilityFor(opportunity: Opportunity, profile: StudentProfile) {
  return withCache(
    `elig:${CACHE_MODEL}:${opportunity.slug}:${profileFp(profile)}`,
    10 * 60 * 1000,
    () => analyzeEligibilitySmart(opportunity, profile),
  );
}

export function readinessFor(profile: StudentProfile, documents: DocumentItem[]) {
  const docFp = fingerprint(
    documents.map((d) => `${d.name}|${d.category}|${d.status}`).sort(),
  );
  return withCache(
    `ready:${CACHE_MODEL}:${profileFp(profile)}:${docFp}`,
    10 * 60 * 1000,
    () => checkReadinessSmart(profile, documents),
  );
}

export function recommendationsFor(
  opportunities: Opportunity[],
  profile: StudentProfile,
  limit = 6,
) {
  return withCache(
    `recs:${CACHE_MODEL}:${profileFp(profile)}:${limit}:${fingerprint(
      opportunities.map((o) => o.slug).sort(),
    )}`,
    15 * 60 * 1000,
    () => rankRecommendationsSmart(opportunities, profile, limit),
  );
}

export async function getAiStatus(): Promise<{
  enabled: boolean;
  provider: ProviderId | "none";
  baseUrl: string;
  model: string;
  displayName: string;
  reachable: boolean;
  modelAvailable: boolean;
}> {
  const providers = activeProviders();
  const primary = providers[0];
  const base = {
    enabled: ENABLED && providers.length > 0,
    provider: primary?.id ?? ("none" as const),
    baseUrl: primary?.url ?? OLLAMA_BASE_URL,
    model: primary?.model ?? OLLAMA_MODEL,
    displayName: AI_DISPLAY_NAME,
    reachable: false,
    modelAvailable: false,
  };
  if (!base.enabled || !primary) return base;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    if (primary.id === "gemini") {
      const res = await fetch(`${GEMINI_BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${primary.apiKey}` },
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) return base;
      const data = (await res.json()) as { data?: { id?: string }[] };
      const ids = (data.data ?? []).map((m) => (m.id ?? "").replace(/^models\//, ""));
      return { ...base, reachable: true, modelAvailable: ids.includes(primary.model) };
    }

    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return base;
    const data = (await res.json()) as { models?: { name?: string; model?: string }[] };
    const names = (data.models ?? []).map((m) => m.name ?? m.model ?? "");
    return {
      ...base,
      reachable: true,
      modelAvailable: names.some(
        (n) => n === primary.model || n.startsWith(`${primary.model}:`),
      ),
    };
  } catch {
    return base;
  } finally {
    clearTimeout(timer);
  }
}
