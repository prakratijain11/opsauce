import { prisma } from "@/lib/db";
import { OPPORTUNITIES, getOpportunity } from "@/lib/data/opportunities";
import { safeJsonArray } from "@/lib/utils";
import type { Opportunity } from "@/lib/types";

/**
 * Data access layer. Every reader tries the database first and transparently
 * falls back to the bundled seed data, so the product renders correctly whether
 * or not a database has been provisioned yet.
 */

function rowToOpportunity(row: any): Opportunity {
  return {
    slug: row.slug,
    title: row.title,
    organizer: row.organizer,
    type: row.type,
    shortSummary: row.shortSummary,
    description: row.description,
    location: row.location,
    mode: row.mode,
    status: row.status,
    logoText: row.logoText ?? row.title.slice(0, 4).toUpperCase(),
    logoColor: row.logoColor ?? "#c94b3c",
    eligibility: safeJsonArray(row.eligibility),
    tags: safeJsonArray(row.tags),
    officialUrl: row.officialUrl ?? undefined,
    featured: row.featured,
    deadlines: (row.deadlines ?? [])
      .map((d: any) => ({
        label: d.label,
        date: new Date(d.date).toISOString(),
        priority: d.priority,
        isPrimary: d.isPrimary,
      }))
      .sort((a: any, b: any) => +new Date(a.date) - +new Date(b.date)),
  };
}

export async function listOpportunities(): Promise<Opportunity[]> {
  try {
    const rows = await prisma.opportunity.findMany({
      include: { deadlines: true },
      orderBy: { createdAt: "asc" },
    });
    if (rows.length) return rows.map(rowToOpportunity);
  } catch {
    /* fall through to seed data */
  }
  return OPPORTUNITIES;
}

export async function findOpportunity(slug: string): Promise<Opportunity | null> {
  try {
    const row = await prisma.opportunity.findUnique({
      where: { slug },
      include: { deadlines: true },
    });
    if (row) return rowToOpportunity(row);
  } catch {
    /* fall through */
  }
  return getOpportunity(slug);
}

export async function listFeatured(): Promise<Opportunity[]> {
  const all = await listOpportunities();
  return all.filter((o) => o.featured);
}

export interface UpcomingDeadline {
  opportunity: Opportunity;
  label: string;
  date: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export async function listUpcomingDeadlines(limit = 6): Promise<UpcomingDeadline[]> {
  const all = await listOpportunities();
  const now = Date.now();
  const flat: UpcomingDeadline[] = [];
  for (const o of all) {
    for (const d of o.deadlines) {
      if (+new Date(d.date) >= now) {
        flat.push({ opportunity: o, label: d.label, date: d.date, priority: d.priority });
      }
    }
  }
  return flat.sort((a, b) => +new Date(a.date) - +new Date(b.date)).slice(0, limit);
}
