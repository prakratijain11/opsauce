import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/app/auth-form";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (e) {
    console.error("Error fetching current user in SignInPage:", e);
  }
  if (user) redirect(user.onboarded ? "/dashboard" : "/onboarding");

  const next =
    searchParams.next && searchParams.next.startsWith("/")
      ? searchParams.next
      : undefined;

  return <AuthForm mode="sign-in" next={next} />;
}
