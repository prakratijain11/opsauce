import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { AppTopbar } from "@/components/app/app-topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdvanceStage } from "@/components/app/advance-stage";
import { requireUser } from "@/lib/session";
import { getUnreadCount, getUserApplications } from "@/lib/user-data";
import { formatDate, relativeDeadline } from "@/lib/utils";

export const metadata: Metadata = { title: "Applications" };
export const dynamic = "force-dynamic";

const STAGES = [
  { id: "PREPARING", label: "Preparing", variant: "warning" as const },
  { id: "READY", label: "Ready", variant: "brand" as const },
  { id: "SUBMITTED", label: "Submitted", variant: "success" as const },
  { id: "RESULT", label: "Result", variant: "outline" as const },
];

export default async function ApplicationsPage() {
  const user = await requireUser("/applications");
  const [applications, unread] = await Promise.all([
    getUserApplications(),
    getUnreadCount(),
  ]);

  return (
    <>
      <AppTopbar title="Applications" user={user} unread={unread} />
      <div className="flex-1 space-y-6 px-5 py-8 sm:px-8">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Your application pipeline
          </h2>
          <p className="text-sm text-muted-foreground">
            Track every opportunity from preparation to result.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="rounded-full bg-secondary p-3">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-base font-semibold">No applications yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Find an opportunity and choose{" "}
                <span className="font-medium text-foreground">Apply with AI Assistant</span>{" "}
                to start your pipeline.
              </p>
            </div>
            <Button href="/explore" className="mt-2">
              Explore opportunities <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {STAGES.map((stage) => {
              const items = applications.filter((a) => a.stage === stage.id);
              if (items.length === 0) return null;
              return (
                <section key={stage.id}>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={stage.variant}>{stage.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                    {items.map((a, i) => {
                      const next = a.opportunity.deadlines.find(
                        (d) => new Date(d.date).getTime() > Date.now(),
                      );
                      return (
                        <div
                          key={a.id}
                          className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center ${
                            i > 0 ? "border-t border-border" : ""
                          }`}
                        >
                          <div
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[0.7rem] font-bold text-white"
                            style={{ backgroundColor: a.opportunity.logoColor }}
                          >
                            {a.opportunity.logoText}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/opportunities/${a.opportunity.slug}`}
                              className="text-sm font-semibold hover:text-brand-600"
                            >
                              {a.opportunity.title}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {a.opportunity.type}
                              {next
                                ? ` · ${next.label}: ${relativeDeadline(next.date)}`
                                : ""}{" "}
                              · updated {formatDate(a.updatedAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="hidden w-24 sm:block">
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                  className="h-full rounded-full bg-brand-gradient"
                                  style={{ width: `${a.readinessScore}%` }}
                                />
                              </div>
                              <p className="mt-1 text-[0.65rem] text-muted-foreground">
                                {a.readinessScore}% ready
                              </p>
                            </div>
                            <AdvanceStage slug={a.opportunity.slug} stage={a.stage} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
