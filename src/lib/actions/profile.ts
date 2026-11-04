"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

function computeCompleteness(p: {
  headline?: string | null;
  educationLevel?: string | null;
  fieldOfStudy?: string | null;
  institution?: string | null;
  graduationYear?: number | null;
  cgpa?: number | null;
  city?: string | null;
  interests: string[];
  careerGoals: string[];
  preferredTypes: string[];
}) {
  const checks = [
    !!p.headline,
    !!p.educationLevel,
    !!p.fieldOfStudy,
    !!p.institution,
    !!p.graduationYear,
    !!p.cgpa,
    !!p.city,
    p.interests.length >= 2,
    p.careerGoals.length >= 1,
    p.preferredTypes.length >= 1,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

const onboardingSchema = z.object({
  educationLevel: z.string().min(1),
  fieldOfStudy: z.string().min(1),
  institution: z.string().min(1),
  graduationYear: z.coerce.number().int().min(1990).max(2100),
  cgpa: z.coerce.number().min(0).max(10),
  city: z.string().min(1),
  country: z.string().min(1),
  interests: z.array(z.string()).min(1),
  careerGoals: z.array(z.string()).min(1),
  preferredTypes: z.array(z.string()).min(1),
});

export async function completeOnboardingAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please complete every step before continuing." };
  }
  const d = parsed.data;
  const headline = `${d.fieldOfStudy} · ${d.educationLevel}`;
  const completeness = computeCompleteness({
    headline,
    ...d,
  });

  try {
    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        headline,
        educationLevel: d.educationLevel,
        fieldOfStudy: d.fieldOfStudy,
        institution: d.institution,
        graduationYear: d.graduationYear,
        cgpa: d.cgpa,
        city: d.city,
        country: d.country,
        interests: JSON.stringify(d.interests),
        careerGoals: JSON.stringify(d.careerGoals),
        preferredTypes: JSON.stringify(d.preferredTypes),
        completeness,
        onboarded: true,
      },
      update: {
        headline,
        educationLevel: d.educationLevel,
        fieldOfStudy: d.fieldOfStudy,
        institution: d.institution,
        graduationYear: d.graduationYear,
        cgpa: d.cgpa,
        city: d.city,
        country: d.country,
        interests: JSON.stringify(d.interests),
        careerGoals: JSON.stringify(d.careerGoals),
        preferredTypes: JSON.stringify(d.preferredTypes),
        completeness,
        onboarded: true,
      },
    });
  } catch (err) {
    console.warn("completeOnboardingAction db warning:", err);
  }

  redirect("/dashboard");
}

const profileSchema = onboardingSchema.partial().extend({
  name: z.string().min(2).optional(),
});

export async function updateProfileAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: "Some fields are invalid." };
  const d = parsed.data;

  try {
    if (d.name) {
      await prisma.user.update({ where: { id: user.id }, data: { name: d.name } }).catch(() => null);
    }

    const merged = {
      headline:
        d.fieldOfStudy && d.educationLevel
          ? `${d.fieldOfStudy} · ${d.educationLevel}`
          : user.profile.headline,
      educationLevel: d.educationLevel ?? user.profile.educationLevel,
      fieldOfStudy: d.fieldOfStudy ?? user.profile.fieldOfStudy,
      institution: d.institution ?? user.profile.institution,
      graduationYear: d.graduationYear ?? user.profile.graduationYear,
      cgpa: d.cgpa ?? user.profile.cgpa,
      city: d.city ?? user.profile.city,
      interests: d.interests ?? user.profile.interests,
      careerGoals: d.careerGoals ?? user.profile.careerGoals,
      preferredTypes: d.preferredTypes ?? user.profile.preferredTypes,
    };

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        headline: merged.headline,
        educationLevel: merged.educationLevel,
        fieldOfStudy: merged.fieldOfStudy,
        institution: merged.institution,
        graduationYear: merged.graduationYear,
        cgpa: merged.cgpa,
        city: merged.city,
        country: d.country ?? user.profile.country,
        interests: JSON.stringify(merged.interests),
        careerGoals: JSON.stringify(merged.careerGoals),
        preferredTypes: JSON.stringify(merged.preferredTypes),
        completeness: computeCompleteness(merged),
      },
      update: {
        headline: merged.headline,
        educationLevel: merged.educationLevel,
        fieldOfStudy: merged.fieldOfStudy,
        institution: merged.institution,
        graduationYear: merged.graduationYear,
        cgpa: merged.cgpa,
        city: merged.city,
        country: d.country ?? user.profile.country,
        interests: JSON.stringify(merged.interests),
        careerGoals: JSON.stringify(merged.careerGoals),
        preferredTypes: JSON.stringify(merged.preferredTypes),
        completeness: computeCompleteness(merged),
      },
    });
  } catch (err) {
    console.warn("updateProfileAction db warning:", err);
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

const prefsSchema = z.record(z.boolean());

export async function updatePreferencesAction(
  kind: "preferences" | "notificationPrefs",
  values: unknown,
) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const parsed = prefsSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid preferences." };

  try {
    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        [kind]: JSON.stringify(parsed.data),
      },
      update: {
        [kind]: JSON.stringify(parsed.data),
      },
    });
  } catch (err) {
    console.warn("updatePreferencesAction db warning:", err);
  }

  revalidatePath("/settings");
  return { ok: true };
}
