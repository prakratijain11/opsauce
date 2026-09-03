import { NextResponse } from "next/server";
import { listOpportunities } from "@/lib/queries";
import { recommendationsFor } from "@/lib/ai-model";
import { getCurrentUser } from "@/lib/session";
import { DEMO_STUDENT } from "@/lib/data/student";

export const dynamic = "force-dynamic";

/**
 * Personalised ranking for the signed-in student (falls back to the demo profile
 * for anonymous callers). Uses the on-device model when available, otherwise a
 * transparent scoring heuristic.
 */
export async function GET(request: Request) {
  const limit = Math.min(
    20,
    Math.max(1, Number(new URL(request.url).searchParams.get("limit") ?? 6)),
  );

  const [user, opportunities] = await Promise.all([
    getCurrentUser(),
    listOpportunities(),
  ]);
  const profile = user?.profile ?? DEMO_STUDENT;

  const { items, source, model } = await recommendationsFor(
    opportunities,
    profile,
    limit,
  );

  return NextResponse.json({
    student: profile.name,
    source,
    model: model ?? null,
    count: items.length,
    data: items,
  });
}
