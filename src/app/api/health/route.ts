import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BRAND } from "@/lib/brand";
import { getAiStatus } from "@/lib/ai-model";

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "connected" | "unavailable" = "unavailable";
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "connected";
  } catch {
    database = "unavailable";
  }

  const ai = await getAiStatus();

  return NextResponse.json({
    name: BRAND.name,
    version: BRAND.version,
    status: "ok",
    database,
    ai: {
      enabled: ai.enabled,
      name: ai.displayName,
      provider: ai.provider,
      model: ai.model,
      reachable: ai.reachable,
      modelAvailable: ai.modelAvailable,
      mode: ai.reachable && ai.modelAvailable ? "on-device" : "heuristic-fallback",
    },
    timestamp: new Date().toISOString(),
  });
}
