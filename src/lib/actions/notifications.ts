"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function markNotificationReadAction(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  try {
    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { read: true },
    });
  } catch (err) {
    console.warn("markNotificationReadAction fallback:", err);
  }
  revalidatePath("/notifications");
  return { ok: true };
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  try {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  } catch (err) {
    console.warn("markAllNotificationsReadAction fallback:", err);
  }
  revalidatePath("/notifications");
  return { ok: true };
}
