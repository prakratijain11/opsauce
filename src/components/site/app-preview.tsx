import { CalendarClock, Flame, Search, Sparkles } from "lucide-react";

/** Stylised in-product preview used on the marketing hero. */
export function AppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-brand-gradient opacity-20 blur-3xl" />
      <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-elevated">
        {/* top bar */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs text-muted-foreground">Good evening,</p>
            <p className="font-display text-base font-semibold">Prakrati 👋</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">
            PJ
          </div>
        </div>

        {/* search */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            Search exams, courses, scholarships…
          </div>
        </div>

        {/* deadlines */}
        <div className="px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Next 3 Deadlines</p>
            <span className="text-xs font-medium text-brand-600">View All</span>
          </div>
          <div className="flex flex-col gap-2">
            <DeadlineRow
              title="GATE 2027 Registration"
              meta="Closes in 3 days"
              tone="danger"
              tag="HIGH"
            />
            <DeadlineRow
              title="AWS Cloud Practitioner"
              meta="Booking in 7 days"
              tone="warning"
              tag="MEDIUM"
            />
            <DeadlineRow
              title="Reliance Foundation Scholarship"
              meta="Closes in 5 days"
              tone="danger"
              tag="HIGH"
            />
          </div>
        </div>

        {/* recommendation */}
        <div className="border-t border-border bg-secondary/50 px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
            <Sparkles className="h-3.5 w-3.5" />
            Recommended for you
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-card px-3 py-3">
            <div>
              <p className="text-sm font-semibold">Google AI Essentials</p>
              <p className="text-xs text-muted-foreground">Great for AI/ML aspirants</p>
            </div>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[0.65rem] font-bold text-success">
              NEW
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineRow({
  title,
  meta,
  tone,
  tag,
}: {
  title: string;
  meta: string;
  tone: "danger" | "warning";
  tag: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <div
        className={
          tone === "danger"
            ? "grid h-8 w-8 place-items-center rounded-lg bg-danger/12 text-danger"
            : "grid h-8 w-8 place-items-center rounded-lg bg-warning/15 text-warning"
        }
      >
        {tone === "danger" ? (
          <Flame className="h-4 w-4" />
        ) : (
          <CalendarClock className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      <span
        className={
          tone === "danger"
            ? "rounded-md bg-danger/12 px-1.5 py-0.5 text-[0.6rem] font-bold text-danger"
            : "rounded-md bg-warning/15 px-1.5 py-0.5 text-[0.6rem] font-bold text-warning"
        }
      >
        {tag}
      </span>
    </div>
  );
}
