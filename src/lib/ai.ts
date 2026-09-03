import type { DocumentItem, Opportunity, StudentProfile } from "@/lib/types";

/**
 * AI services layer.
 *
 * These functions currently run a transparent, rule-based heuristic so the
 * product is fully functional offline. Each is a clean seam: swap the body for a
 * call to your model provider (see AI_MODEL / ANTHROPIC_API_KEY in .env) without
 * touching any callers.
 */

export interface EligibilitySignal {
  label: string;
  verdict: "likely" | "check" | "unlikely";
  reason: string;
}

export interface EligibilityResult {
  score: number; // 0-100 confidence that the student can apply
  summary: string;
  signals: EligibilitySignal[];
}

export function analyzeEligibility(
  opportunity: Opportunity,
  profile: StudentProfile,
): EligibilityResult {
  const signals: EligibilitySignal[] = [];

  const typeMatch = profile.preferredTypes.includes(opportunity.type);
  signals.push({
    label: "Profile interest match",
    verdict: typeMatch ? "likely" : "check",
    reason: typeMatch
      ? `${opportunity.type} is one of your preferred opportunity types.`
      : `${opportunity.type} is outside your stated preferences — still worth a look.`,
  });

  const text = opportunity.eligibility.join(" ").toLowerCase();
  const isPg = /master|m\.?tech|m\.?sc|post ?graduat|phd/.test(text);
  const wantsFinalYear = /final year|final-year/.test(text);
  const undergrad = /undergrad/i.test(profile.educationLevel);

  signals.push({
    label: "Academic level",
    verdict: isPg && undergrad && !wantsFinalYear ? "unlikely" : "likely",
    reason:
      isPg && undergrad && !wantsFinalYear
        ? "This opportunity targets postgraduate students; you are currently an undergraduate."
        : `Your level (${profile.educationLevel}) fits the stated academic criteria.`,
  });

  const cgpaOk = profile.cgpa >= 6.5;
  signals.push({
    label: "Academic standing",
    verdict: cgpaOk ? "likely" : "check",
    reason: cgpaOk
      ? `A CGPA of ${profile.cgpa.toFixed(1)} clears typical merit thresholds.`
      : `A CGPA of ${profile.cgpa.toFixed(1)} may fall below some merit cut-offs.`,
  });

  const needsIncome = /income|means|lower-income|financial/.test(text);
  if (needsIncome) {
    signals.push({
      label: "Means criteria",
      verdict: "check",
      reason: "A family income / means certificate is required — confirm your household meets the threshold.",
    });
  }

  const weight = { likely: 1, check: 0.55, unlikely: 0.05 } as const;
  const score = Math.round(
    (signals.reduce((sum, s) => sum + weight[s.verdict], 0) / signals.length) * 100,
  );

  const summary =
    score >= 75
      ? "You appear eligible for this opportunity. Review the official criteria before applying."
      : score >= 45
        ? "You may be eligible. A few criteria need your confirmation before you apply."
        : "This opportunity looks like a stretch for your current profile — check the details carefully.";

  return { score, summary, signals };
}

export interface ReadinessResult {
  score: number; // 0-100
  completedSections: string[];
  missing: { section: string; detail: string; severity: "missing" | "review" }[];
  message: string;
}

const CORE_SECTIONS = [
  "Personal Details",
  "Educational Information",
  "Photograph",
  "Signature",
  "Identity Proof",
  "Category / Income Certificate",
];

export function checkReadiness(
  profile: StudentProfile,
  documents: DocumentItem[],
): ReadinessResult {
  const have = new Set(
    documents.map((d) => d.name.toLowerCase() + "|" + d.category.toLowerCase()),
  );
  const hasCategory = documents.some(
    (d) => /category|income/i.test(d.name) && d.status === "VERIFIED",
  );
  const categoryPendingReview = documents.some(
    (d) => /category|income/i.test(d.name) && d.status !== "VERIFIED",
  );
  const hasSignature = documents.some((d) => /signature/i.test(d.name));
  const hasPhoto = profile.completeness >= 80;

  const completed: string[] = [];
  const missing: ReadinessResult["missing"] = [];

  completed.push("Personal Details", "Educational Information");
  if (hasPhoto) completed.push("Photograph");
  else missing.push({ section: "Photograph", detail: "Upload a recent passport-size photo.", severity: "missing" });

  if (hasSignature) completed.push("Signature");
  else missing.push({ section: "Signature", detail: "Add a scanned signature image.", severity: "missing" });

  if (documents.some((d) => /aadhaar|id/i.test(d.name))) completed.push("Identity Proof");
  else missing.push({ section: "Identity Proof", detail: "Upload a government ID.", severity: "missing" });

  if (hasCategory) completed.push("Category / Income Certificate");
  else if (categoryPendingReview)
    missing.push({
      section: "Category / Income Certificate",
      detail: "Uploaded but not yet verified — needs your review.",
      severity: "review",
    });
  else
    missing.push({
      section: "Category / Income Certificate",
      detail: "Required only if you are claiming a reservation / means benefit.",
      severity: "review",
    });

  const score = Math.round((completed.length / CORE_SECTIONS.length) * 100);
  const message =
    score >= 90
      ? "You are almost ready — resolve the last item and you can start applying with confidence."
      : score >= 60
        ? "Good progress. A few documents still need attention before you apply."
        : "Let's get your core documents in place before starting an application.";

  return { score, completedSections: completed, missing, message };
}

export interface ReviewFinding {
  field: string;
  issue: string;
  suggestion: string;
  severity: "critical" | "minor";
}

export interface ReviewResult {
  score: number;
  overallFeedback: string;
  findings: ReviewFinding[];
}

export function reviewApplication(
  opportunity: Opportunity,
  profile: StudentProfile,
  fields: { label: string; value: string }[],
): ReviewResult {
  const findings: ReviewFinding[] = [];
  let score = 80;

  const sop = fields.find((f) => /statement|purpose|essay/i.test(f.label));
  if (!sop || !sop.value.trim()) {
    findings.push({
      field: "Statement of Purpose",
      issue: "SOP is missing or empty.",
      suggestion: "Draft a strong SOP using the AI Assistant to explain your motivation.",
      severity: "critical",
    });
    score -= 30;
  } else if (sop.value.length < 100) {
    findings.push({
      field: "Statement of Purpose",
      issue: "SOP is very short.",
      suggestion: "Expand on your achievements and how this opportunity aligns with your goals.",
      severity: "minor",
    });
    score -= 10;
  }

  const cgpa = fields.find((f) => /cgpa|percentage/i.test(f.label));
  if (cgpa && cgpa.value.trim() === "") {
    findings.push({
      field: "CGPA",
      issue: "CGPA is missing.",
      suggestion: "Ensure your academic standing is clearly stated.",
      severity: "critical",
    });
    score -= 20;
  }

  return {
    score: Math.max(0, score),
    overallFeedback: score >= 70
      ? "Your application looks strong. A few minor tweaks could make it stand out."
      : "Your application needs significant work before submission.",
    findings,
  };
}
