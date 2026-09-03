import { ArrowRight, Flame } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { listUpcomingDeadlines } from "@/lib/queries";
import { formatDate, relativeDeadline } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const PRIORITY_BADGE = { HIGH: "danger", MEDIUM: "warning", LOW: "outline" } as const;

async function DeadlinesData() {
  const deadlines = await listUpcomingDeadlines(5);
  if (!deadlines || deadlines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">No upcoming deadlines found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      {deadlines.map((d, i) => (
        <Link
          key={`${d.opportunity.slug}-${d.label}`}
          href={`/opportunities/${d.opportunity.slug}`}
          className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/60 ${
            i > 0 ? "border-t border-border" : ""
          }`}
        >
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[0.7rem] font-bold text-white"
            style={{ backgroundColor: d.opportunity.logoColor }}
          >
            {d.opportunity.logoText}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{d.opportunity.title}</p>
            <p className="text-xs text-muted-foreground">
              {d.label} · {formatDate(d.date)}
            </p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-foreground">
              {relativeDeadline(d.date)}
            </p>
          </div>
          <Badge variant={PRIORITY_BADGE[d.priority]}>
            {d.priority === "HIGH" ? <Flame className="h-3 w-3" /> : null}
            {d.priority}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export function DeadlinesSection() {
  return (
    <section id="deadlines" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          Next deadlines
        </h3>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <Suspense fallback={<DeadlinesSkeleton />}>
        <DeadlinesData />
      </Suspense>
    </section>
  );
}

function DeadlinesSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
