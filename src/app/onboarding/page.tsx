import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/app/onboarding-flow";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Set up your profile" };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.onboarded) redirect("/dashboard");
  return <OnboardingFlow name={user.name} />;
}
