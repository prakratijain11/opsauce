"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { DEMO_DOCUMENTS, DEMO_STUDENT } from "@/lib/data/student";

export type AuthState = { error?: string } | undefined;

const credentials = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const signUpSchema = credentials.extend({
  name: z.string().min(2, "Tell us your name."),
});

function safeNext(value: FormDataEntryValue | null): string {
  const s = typeof value === "string" ? value : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/dashboard";
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!(formData instanceof FormData)) return { error: "Something went wrong. Please try again." };
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid details." };
  }

  const email = parsed.data.email.toLowerCase().trim();
  let userId = `user_${Date.now()}`;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "An account with this email already exists." };
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name.trim(),
        passwordHash: await hashPassword(parsed.data.password),
        profile: { create: {} },
      },
    });
    userId = user.id;
  } catch (err: any) {
    console.error("signUpAction db error:", err);
  }

  await createSession({ userId, email });
  redirect("/onboarding");
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!(formData instanceof FormData)) return { error: "Something went wrong. Please try again." };
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid details." };
  }

  const next = safeNext(formData.get("next"));
  const email = parsed.data.email.toLowerCase().trim();
  const password = parsed.data.password;

  // Handle Demo Account Login
  const isDemoEmail =
    email === "prakrati@opsauce.ai" ||
    email.endsWith("@opsauce.ai") ||
    email.endsWith("@opportunityos.ai");

  if (isDemoEmail && password === "demo1234") {
    let demoUserId = "demo-user-id";
    try {
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: "prakrati@opsauce.ai" },
            { email: { endsWith: "@opsauce.ai" } },
            { email: { endsWith: "@opportunityos.ai" } },
          ],
        },
        include: { profile: true },
      });

      const passwordHash = await hashPassword("demo1234");

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: "prakrati@opsauce.ai",
            name: DEMO_STUDENT.name,
            passwordHash,
            avatarUrl: DEMO_STUDENT.avatarUrl,
            profile: {
              create: {
                headline: DEMO_STUDENT.headline,
                educationLevel: DEMO_STUDENT.educationLevel,
                fieldOfStudy: DEMO_STUDENT.fieldOfStudy,
                institution: DEMO_STUDENT.institution,
                graduationYear: DEMO_STUDENT.graduationYear,
                cgpa: DEMO_STUDENT.cgpa,
                city: DEMO_STUDENT.city,
                country: DEMO_STUDENT.country,
                interests: JSON.stringify(DEMO_STUDENT.interests),
                careerGoals: JSON.stringify(DEMO_STUDENT.careerGoals),
                preferredTypes: JSON.stringify(DEMO_STUDENT.preferredTypes),
                completeness: DEMO_STUDENT.completeness,
                onboarded: true,
              },
            },
          },
          include: { profile: true },
        });

        // Add demo documents
        for (const doc of DEMO_DOCUMENTS) {
          await prisma.document.create({
            data: {
              userId: user.id,
              name: doc.name,
              category: doc.category,
              fileType: doc.fileType,
              sizeKb: doc.sizeKb,
              status: doc.status,
              uploadedAt: new Date(doc.uploadedAt),
            },
          }).catch(() => null);
        }
      } else {
        // Ensure demo password matches demo1234
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            email: "prakrati@opsauce.ai",
            name: DEMO_STUDENT.name,
            passwordHash,
          },
          include: { profile: true },
        });
      }
      if (user) demoUserId = user.id;
    } catch (e) {
      console.warn("DB demo sync error:", e);
    }

    await createSession({ userId: demoUserId, email: "prakrati@opsauce.ai" });
    redirect(next);
  }

  // Regular user login
  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  } catch (err) {
    console.error("DB error during sign-in:", err);
  }

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }

  await createSession({ userId: user.id, email: user.email });
  redirect(user.profile?.onboarded ? next : "/onboarding");
}

export async function signOutAction() {
  destroySession();
  redirect("/");
}
