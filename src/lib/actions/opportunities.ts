"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

async function opportunityBySlug(slug: string) {
  return prisma.opportunity.findUnique({
    where: { slug },
    select: { id: true, title: true },
  });
}

export async function toggleSaveAction(slug: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const opp = await opportunityBySlug(slug);
  if (!opp) return { error: "Opportunity not found." };

  const existing = await prisma.savedOpportunity.findUnique({
    where: { userId_opportunityId: { userId: user.id, opportunityId: opp.id } },
  });

  let saved: boolean;
  if (existing) {
    await prisma.savedOpportunity.delete({ where: { id: existing.id } });
    saved = false;
  } else {
    await prisma.savedOpportunity.create({
      data: { userId: user.id, opportunityId: opp.id },
    });
    saved = true;
  }

  revalidatePath("/saved");
  revalidatePath("/explore");
  revalidatePath(`/opportunities/${slug}`);
  return { ok: true, saved };
}

const STAGES = ["SAVED", "PREPARING", "READY", "SUBMITTED", "RESULT"] as const;

export async function startApplicationAction(slug: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const opp = await opportunityBySlug(slug);
  if (!opp) return { error: "Opportunity not found." };

  await prisma.application.upsert({
    where: { userId_opportunityId: { userId: user.id, opportunityId: opp.id } },
    update: {},
    create: {
      userId: user.id,
      opportunityId: opp.id,
      stage: "PREPARING",
      readinessScore: user.profile.completeness,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: `Application started: ${opp.title}`,
      body: "We've added it to your applications. Run a readiness check next.",
      kind: "SYSTEM",
    },
  });

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
