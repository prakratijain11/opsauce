import { NextResponse } from "next/server";
import { listOpportunities } from "@/lib/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const q = searchParams.get("q")?.toLowerCase().trim();
  const featured = searchParams.get("featured");

  let data = await listOpportunities();

  if (type) data = data.filter((o) => o.type === type);
  if (featured === "true") data = data.filter((o) => o.featured);
  if (q) {
    data = data.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.organizer.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  return NextResponse.json({ count: data.length, data });
}
