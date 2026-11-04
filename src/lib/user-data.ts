import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { findOpportunity, listOpportunities } from "@/lib/queries";
import { DEMO_DOCUMENTS } from "@/lib/data/student";
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

/** Documents for the signed-in user, newest first. Falls back to DEMO_DOCUMENTS if empty. */
export async function getUserDocuments(): Promise<DocumentItem[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  try {
    const rows = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { uploadedAt: "desc" },
    });
    if (rows && rows.length > 0) {
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
  } catch (err) {
    console.warn("getUserDocuments fallback:", err);
  }
  return DEMO_DOCUMENTS;
}

export async function getSavedSlugs(): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) return new Set();
  try {
    const rows = await prisma.savedOpportunity.findMany({
      where: { userId: user.id },
      include: { opportunity: { select: { slug: true } } },
    });
    if (rows && rows.length > 0) {
      return new Set(rows.map((r) => r.opportunity.slug));
    }
  } catch (err) {
    console.warn("getSavedSlugs fallback:", err);
  }
  return new Set(["google-ai-essentials", "smart-india-hackathon-2027"]);
}

export async function getSavedOpportunities(): Promise<Opportunity[]> {
  const slugs = await getSavedSlugs();
  const all = await listOpportunities();
  return all.filter((o) => slugs.has(o.slug));
}

export async function getUserApplications(): Promise<ApplicationView[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  try {
    const rows = await prisma.application.findMany({
      where: { userId: user.id },
      include: { opportunity: { select: { slug: true } } },
      orderBy: { updatedAt: "desc" },
    });

    if (rows && rows.length > 0) {
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
  } catch (err) {
    console.warn("getUserApplications fallback:", err);
  }

  // Sensible demo applications
  const opp1 = await findOpportunity("gate-2027");
  const opp2 = await findOpportunity("aws-certified-cloud-practitioner");
  const fallbackViews: ApplicationView[] = [];
  if (opp1) {
    fallbackViews.push({
      id: "app-demo-1",
      stage: "PREPARING",
      readinessScore: 72,
      updatedAt: new Date().toISOString(),
      opportunity: opp1,
    });
  }
  if (opp2) {
    fallbackViews.push({
      id: "app-demo-2",
      stage: "READY",
      readinessScore: 100,
      updatedAt: new Date().toISOString(),
      opportunity: opp2,
    });
  }
  return fallbackViews;
}

export async function getApplicationForSlug(slug: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    const opp = await prisma.opportunity.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!opp) return null;
    const row = await prisma.application.findUnique({
      where: { userId_opportunityId: { userId: user.id, opportunityId: opp.id } },
    });
    if (row) {
      return { stage: row.stage as ApplicationStage, readinessScore: row.readinessScore };
    }
  } catch (err) {
    console.warn("getApplicationForSlug fallback:", err);
  }

  if (slug === "gate-2027") {
    return { stage: "PREPARING" as ApplicationStage, readinessScore: 72 };
  }
  if (slug === "aws-certified-cloud-practitioner") {
    return { stage: "READY" as ApplicationStage, readinessScore: 100 };
  }
  return null;
}

export async function getUserNotifications(): Promise<NotificationView[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  try {
    const rows = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    if (rows && rows.length > 0) {
      return rows.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        kind: n.kind,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    console.warn("getUserNotifications fallback:", err);
  }

  return [
    {
      id: "notif-1",
      title: "GATE 2027 registration closes soon",
      body: "Only 3 days left to complete your GATE 2027 registration.",
      kind: "DEADLINE",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "notif-2",
      title: "New recommendation",
      body: "Google AI Essentials matches your interest in AI/ML.",
      kind: "RECOMMENDATION",
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export async function getUnreadCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;
  try {
    return await prisma.notification.count({ where: { userId: user.id, read: false } });
  } catch {
    return 1;
  }
}
