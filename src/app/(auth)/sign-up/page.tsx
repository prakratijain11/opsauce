import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/app/auth-form";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.onboarded ? "/dashboard" : "/onboarding");
  return <AuthForm mode="sign-up" />;
}
