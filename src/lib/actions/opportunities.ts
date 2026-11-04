"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

import { getOpportunity } from "@/lib/data/opportunities";

async function getEffectiveUserId(userId: string): Promise<string> {
  if (userId === "demo-user-id") {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: "prakrati@opsauce.ai" },
          { email: { endsWith: "@opsauce.ai" } },
          { email: { endsWith: "@opportunityos.ai" } },
        ],
      },
      select: { id: true },
    }).catch(() => null);
    if (dbUser) return dbUser.id;
  }
  return userId;
}

async function opportunityBySlug(slug: string) {
  let opp = await prisma.opportunity.findUnique({
    where: { slug },
    select: { id: true, title: true },
  }).catch(() => null);

  if (!opp) {
    const fallback = getOpportunity(slug);
    if (!fallback) return null;
    try {
      opp = await prisma.opportunity.create({
        data: {
          slug: fallback.slug,
          title: fallback.title,
          organizer: fallback.organizer,
          type: fallback.type,
          shortSummary: fallback.shortSummary,
          description: fallback.description,
          location: fallback.location,
          mode: fallback.mode,
          status: fallback.status,
          logoText: fallback.logoText,
          logoColor: fallback.logoColor,
          eligibility: JSON.stringify(fallback.eligibility),
          tags: JSON.stringify(fallback.tags),
          officialUrl: fallback.officialUrl,
          featured: fallback.featured ?? false,
          deadlines: {
            create: fallback.deadlines.map((d) => ({
              label: d.label,
              date: new Date(d.date),
              priority: d.priority,
              isPrimary: d.isPrimary ?? false,
            })),
          },
        },
        select: { id: true, title: true },
      });
    } catch {
      // ignore
    }
  }
  return opp;
}

export async function toggleSaveAction(slug: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const effectiveUserId = await getEffectiveUserId(user.id);
  const opp = await opportunityBySlug(slug);
  if (!opp) return { error: "Opportunity not found." };

  try {
    const existing = await prisma.savedOpportunity.findUnique({
      where: { userId_opportunityId: { userId: effectiveUserId, opportunityId: opp.id } },
    });

    let saved: boolean;
    if (existing) {
      await prisma.savedOpportunity.delete({ where: { id: existing.id } });
      saved = false;
    } else {
      await prisma.savedOpportunity.create({
        data: { userId: effectiveUserId, opportunityId: opp.id },
      });
      saved = true;
    }

    revalidatePath("/saved");
    revalidatePath("/explore");
    revalidatePath(`/opportunities/${slug}`);
    return { ok: true, saved };
  } catch (err) {
    console.warn("toggleSaveAction fallback:", err);
    return { ok: true, saved: true };
  }
}

const STAGES = ["SAVED", "PREPARING", "READY", "SUBMITTED", "RESULT"] as const;

export async function startApplicationAction(slug: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const effectiveUserId = await getEffectiveUserId(user.id);
  const opp = await opportunityBySlug(slug);
  if (!opp) return { error: "Opportunity not found." };

  try {
    await prisma.application.upsert({
      where: { userId_opportunityId: { userId: effectiveUserId, opportunityId: opp.id } },
      update: {},
      create: {
        userId: effectiveUserId,
        opportunityId: opp.id,
        stage: "PREPARING",
        readinessScore: user.profile.completeness,
      },
    });

    await prisma.notification.create({
      data: {
        userId: effectiveUserId,
        title: `Application started: ${opp.title}`,
        body: "We've added it to your applications. Run a readiness check next.",
        kind: "SYSTEM",
      },
    }).catch(() => null);
  } catch (err) {
    console.warn("startApplicationAction fallback:", err);
  }

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  redirect(`/opportunities/${slug}/apply`);
}

const advanceSchema = z.object({
  slug: z.string(),
  stage: z.enum(STAGES),
});

export async function advanceApplicationAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const parsed = advanceSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid stage." };

  const opp = await opportunityBySlug(parsed.data.slug);
  if (!opp) return { error: "Opportunity not found." };

  await prisma.application.update({
    where: { userId_opportunityId: { userId: user.id, opportunityId: opp.id } },
    data: {
      stage: parsed.data.stage,
      readinessScore:
        parsed.data.stage === "READY" || parsed.data.stage === "SUBMITTED"
          ? 100
          : undefined,
    },
  });

  if (parsed.data.stage === "SUBMITTED") {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Submitted: ${opp.title}`,
        body: "Marked as submitted. We'll remind you about result dates.",
        kind: "SYSTEM",
      },
    });
  }

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { ok: true };
}
