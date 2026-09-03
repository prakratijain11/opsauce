"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const addSchema = z.object({
  name: z.string().min(2, "Give the document a name."),
  category: z.string().min(1),
  fileType: z.enum(["pdf", "jpg", "png"]),
  sizeKb: z.coerce.number().int().min(1).max(10240),
});

export async function addDocumentAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const parsed = addSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid document." };
  }

  await prisma.document.create({
    data: {
      userId: user.id,
      name: parsed.data.name.trim(),
      category: parsed.data.category,
      fileType: parsed.data.fileType,
      sizeKb: parsed.data.sizeKb,
      status: "PENDING",
    },
  });

  revalidatePath("/documents");
  return { ok: true };
}

export async function deleteDocumentAction(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  await prisma.document.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/documents");
  return { ok: true };
}

export async function verifyDocumentAction(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  await prisma.document.updateMany({
    where: { id, userId: user.id },
    data: { status: "VERIFIED" },
  });
  revalidatePath("/documents");
  return { ok: true };
}
