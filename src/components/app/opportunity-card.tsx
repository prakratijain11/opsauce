import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SaveButton } from "@/components/app/save-button";
import { relativeDeadline } from "@/lib/utils";
import type { Opportunity } from "@/lib/types";

const STATUS_VARIANT = {
  Open: "success",
  Upcoming: "warning",
  Closed: "outline",
} as const;

export function OpportunityCard({
  opportunity,
  saved,
}: {
  opportunity: Opportunity;
  saved?: boolean;
}) {
  const primary =
    opportunity.deadlines.find((d) => d.isPrimary) ?? opportunity.deadlines[0];

  return (
    <div className="group relative flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-elevated dark:hover:border-brand-500/40">
      <Link
        href={`/opportunities/${opportunity.slug}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={opportunity.title}
      />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xs font-bold text-white"
          style={{ backgroundColor: opportunity.logoColor }}
        >
          {opportunity.logoText}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[opportunity.status]}>
            {opportunity.status}
          </Badge>
          {typeof saved === "boolean" ? (
            <SaveButton slug={opportunity.slug} saved={saved} />
          ) : null}
        </div>
      </div>

      <div className="relative z-10 flex-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
          {opportunity.type}
        </p>
        <h3 className="mt-1 font-display text-base font-semibold leading-tight tracking-tight">
          {opportunity.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {opportunity.shortSummary}
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {opportunity.mode}
        </span>
        {primary ? (
          <span className="font-medium text-foreground">
            {relativeDeadline(primary.date)}
          </span>
        ) : null}
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </div>
  );
}
