"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { findOpportunity } from "@/lib/queries";
import { draftFieldSmart, reviewApplicationSmart } from "@/lib/ai-model";

const schema = z.object({
  slug: z.string().min(1),
  fieldLabel: z.string().min(1).max(120),
});

const reviewSchema = z.object({
  slug: z.string().min(1),
  fields: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })),
});

export async function draftFieldAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Invalid request." };

  const opportunity = await findOpportunity(parsed.data.slug);
  if (!opportunity) return { error: "Opportunity not found." };

  const result = await draftFieldSmart({
    fieldLabel: parsed.data.fieldLabel,
    opportunityTitle: opportunity.title,
    opportunityType: opportunity.type,
    organizer: opportunity.organizer,
    profile: user.profile,
  });

  return { ok: true, ...result };
}

export async function reviewApplicationAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid request." };

  const opportunity = await findOpportunity(parsed.data.slug);
  if (!opportunity) return { error: "Opportunity not found." };

  const result = await reviewApplicationSmart(
    opportunity,
    user.profile,
    parsed.data.fields,
  );

  return { ok: true, ...result };
}
