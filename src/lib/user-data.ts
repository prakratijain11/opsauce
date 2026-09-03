import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { findOpportunity, listOpportunities } from "@/lib/queries";
import type { DocumentItem, Opportunity } from "@/lib/types";

export type ApplicationStage =
  | "SAVED"
  | "PREPARING"
  | "READY"
  | "SUBMITTED"
  | "RESULT";

export interface ApplicationView {
  id: string;
  stage: ApplicationStage;
  readinessScore: number;
  updatedAt: string;
  opportunity: Opportunity;
}

export interface NotificationView {
  id: string;
  title: string;
  body: string;
  kind: string;
  read: boolean;
  createdAt: string;
}

/** Documents for the signed-in user, newest first. Empty array when signed out. */
export async function getUserDocuments(): Promise<DocumentItem[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const rows = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { uploadedAt: "desc" },
  });
  return rows.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    fileType: d.fileType as DocumentItem["fileType"],
    sizeKb: d.sizeKb,
    status: d.status as DocumentItem["status"],
    uploadedAt: d.uploadedAt.toISOString(),
  }));
}

export async function getSavedSlugs(): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) return new Set();
  const rows = await prisma.savedOpportunity.findMany({
    where: { userId: user.id },
    include: { opportunity: { select: { slug: true } } },
  });
  return new Set(rows.map((r) => r.opportunity.slug));
}

export async function getSavedOpportunities(): Promise<Opportunity[]> {
  const slugs = await getSavedSlugs();
  const all = await listOpportunities();
  return all.filter((o) => slugs.has(o.slug));
}

export async function getUserApplications(): Promise<ApplicationView[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const rows = await prisma.application.findMany({
    where: { userId: user.id },
    include: { opportunity: { select: { slug: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const views: ApplicationView[] = [];
  for (const r of rows) {
    const opportunity = await findOpportunity(r.opportunity.slug);
    if (!opportunity) continue;
    views.push({
      id: r.id,
      stage: r.stage as ApplicationStage,
      readinessScore: r.readinessScore,
      updatedAt: r.updatedAt.toISOString(),
      opportunity,
    });
  }
  return views;
}

export async function getApplicationForSlug(slug: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  const opp = await prisma.opportunity.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!opp) return null;
  const row = await prisma.application.findUnique({
    where: { userId_opportunityId: { userId: user.id, opportunityId: opp.id } },
  });
  return row
    ? { stage: row.stage as ApplicationStage, readinessScore: row.readinessScore }
    : null;
}

export async function getUserNotifications(): Promise<NotificationView[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return rows.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    kind: n.kind,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function getUnreadCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;
  return prisma.notification.count({ where: { userId: user.id, read: false } });
}
