import { Cpu, FunctionSquare } from "lucide-react";

/**
 * Tiny provenance badge shown next to AI-generated results so the student always
 * knows whether output came from the on-device model or the offline heuristic.
 */
export function AiSourceBadge({
  source,
  model,
}: {
  source: "ai" | "heuristic";
  model?: string;
}) {
  if (source === "ai") {
    return (
      <span
        title={`On-device model: ${model ?? "NovaMind5.8"}`}
        className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
      >
        <Cpu className="h-2.5 w-2.5" />
        {model ?? "NovaMind5.8"}
      </span>
    );
  }
  return (
    <span
      title="On-device model unavailable — showing rule-based estimate"
      className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-muted-foreground"
    >
      <FunctionSquare className="h-2.5 w-2.5" />
      Estimate
    </span>
  );
}
