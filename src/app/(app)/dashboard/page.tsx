import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { AppTopbar } from "@/components/app/app-topbar";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/session";
import {
  getUserApplications,
  getUnreadCount,
} from "@/lib/user-data";
import { DeadlinesSection } from "@/components/app/dashboard/deadlines";
import { RecommendationsSection } from "@/components/app/dashboard/recommendations";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const [applications, unread] = await Promise.all([
    getUserApplications(),
    getUnreadCount(),
  ]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const active = applications.filter((a) => a.stage !== "RESULT");

  return (
    <>
      <AppTopbar title="Dashboard" user={user} unread={unread} />
      <div className="flex-1 space-y-8 px-5 py-8 sm:px-8">
        <section className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {user.name.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-muted-foreground">
            {user.profile.headline}
            {user.profile.institution ? ` · ${user.profile.institution}` : ""}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Profile completeness"
            value={`${user.profile.completeness}%`}
            hint={
              user.profile.completeness < 100
                ? "Complete it for sharper matches"
                : "Your profile is fully set up"
            }
            progress={user.profile.completeness}
            href="/profile"
          />
          <StatCard
            icon={<ClipboardList className="h-4 w-4" />}
            label="Active applications"
            value={String(active.length)}
            hint="In preparation or submitted"
            href="/applications"
          />
          <StatCard
            icon={<CalendarClock className="h-4 w-4" />}
            label="Upcoming deadlines"
            value="..."
            hint="Across all opportunities"
          />
        </section>

        <DeadlinesSection />

        <RecommendationsSection />

        <section className="rounded-2xl border border-border bg-brand-radial p-6 sm:p-8">
          <div className="flex flex-col items-start gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Run an AI Readiness Check</h3>
              <p className="text-sm text-white/70">
                See what&apos;s missing before you start an application.
              </p>
            </div>
            <Button href="/profile" variant="secondary">
              Check readiness <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  progress,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  progress?: number;
  href?: string;
}) {
  const inner = (
    <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-card transition-colors hover:border-brand-300 dark:hover:border-brand-500/40">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      {typeof progress === "number" ? (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-brand-gradient"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
