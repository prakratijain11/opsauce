import { NextResponse } from "next/server";
import { findOpportunity } from "@/lib/queries";
import { eligibilityFor } from "@/lib/ai-model";
import { getCurrentUser } from "@/lib/session";
import { DEMO_STUDENT } from "@/lib/data/student";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const opportunity = await findOpportunity(params.slug);
  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const user = await getCurrentUser();
  const eligibility = await eligibilityFor(opportunity, user?.profile ?? DEMO_STUDENT);
  return NextResponse.json({ data: opportunity, eligibility });
}
