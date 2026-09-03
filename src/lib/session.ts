import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { safeJsonArray } from "@/lib/utils";
import type { StudentProfile } from "@/lib/types";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  onboarded: boolean;
  profile: StudentProfile;
  notificationPrefs: Record<string, boolean>;
  preferences: Record<string, boolean>;
};

function parseObject(value: string | null | undefined): Record<string, boolean> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Cached per-request. Returns null when signed out or the user no longer exists. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSession();
  if (!session) return null;

  const user = await prisma.user
    .findUnique({ where: { id: session.userId }, include: { profile: true } })
    .catch(() => null);
  if (!user) return null;

  const p = user.profile;
  const profile: StudentProfile = {
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
    headline: p?.headline ?? "Student",
    educationLevel: p?.educationLevel ?? "",
    fieldOfStudy: p?.fieldOfStudy ?? "",
    institution: p?.institution ?? "",
    graduationYear: p?.graduationYear ?? new Date().getFullYear() + 2,
    cgpa: p?.cgpa ?? 0,
    city: p?.city ?? "",
    country: p?.country ?? "",
    interests: safeJsonArray(p?.interests),
    careerGoals: safeJsonArray(p?.careerGoals),
    preferredTypes: safeJsonArray(p?.preferredTypes) as StudentProfile["preferredTypes"],
    completeness: p?.completeness ?? 0,
  };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    onboarded: p?.onboarded ?? false,
    profile,
    notificationPrefs: parseObject(p?.notificationPrefs),
    preferences: parseObject(p?.preferences),
  };
});

/** Use in server components / pages that require a session. */
export async function requireUser(nextPath?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(nextPath ? `/sign-in?next=${encodeURIComponent(nextPath)}` : "/sign-in");
  }
  if (!user.onboarded) redirect("/onboarding");
  return user;
}
