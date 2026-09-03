import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { AppTopbar } from "@/components/app/app-topbar";
import { AiSourceBadge } from "@/components/app/ai-source-badge";
import { Countdown } from "@/components/app/countdown";
import { SaveButton } from "@/components/app/save-button";
import { ApplyButton } from "@/components/app/apply-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findOpportunity } from "@/lib/queries";
import { eligibilityFor } from "@/lib/ai-model";
import { requireUser } from "@/lib/session";
import {
  getApplicationForSlug,
  getSavedSlugs,
  getUnreadCount,
} from "@/lib/user-data";
import { formatDate, relativeDeadline } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const o = await findOpportunity(params.slug);
  return o
    ? { title: o.title, description: o.shortSummary }
    : { title: "Opportunity not found" };
}

const VERDICT = {
  likely: { icon: CheckCircle2, className: "text-success" },
  check: { icon: CircleHelp, className: "text-warning" },
  unlikely: { icon: CircleAlert, className: "text-danger" },
} as const;

const STAGE_LABEL: Record<string, string> = {
  SAVED: "Saved",
  PREPARING: "In preparation",
  READY: "Ready to submit",
  SUBMITTED: "Submitted",
  RESULT: "Awaiting result",
};

export default async function OpportunityDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await requireUser(`/opportunities/${params.slug}`);
  const opportunity = await findOpportunity(params.slug);
  if (!opportunity) notFound();

  const [savedSlugs, application, unread] = await Promise.all([
    getSavedSlugs(),
    getApplicationForSlug(params.slug),
    getUnreadCount(),
  ]);

  const primary =
    opportunity.deadlines.find((d) => d.isPrimary) ??
    opportunity.deadlines.find((d) => new Date(d.date).getTime() > Date.now()) ??
    opportunity.deadlines[0];

  const eligibility = await eligibilityFor(opportunity, user.profile);

  return (
    <>
      <AppTopbar title="Opportunity Details" user={user} unread={unread} />
      <div className="flex-1 px-5 py-8 sm:px-8">
        <Link
          href="/explore"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-8">
            <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-start">
              <div
                className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white"
                style={{ backgroundColor: opportunity.logoColor }}
              >
                {opportunity.logoText}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand">{opportunity.type}</Badge>
                  <Badge variant={opportunity.status === "Open" ? "success" : "warning"}>
                    {opportunity.status}
                  </Badge>
                  {application ? (
                    <Badge variant="outline">{STAGE_LABEL[application.stage]}</Badge>
                  ) : null}
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
                  {opportunity.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {opportunity.organizer}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {opportunity.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> {opportunity.mode}
                  </span>
                </div>
              </div>
            </header>

            <Section title="Overview">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {opportunity.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {opportunity.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Section>

            <Section title="Important Dates">
              <ol className="space-y-4">
                {opportunity.deadlines.map((d) => {
                  const past = new Date(d.date).getTime() < Date.now();
                  return (
                    <li key={d.label} className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          past
                            ? "bg-border"
                            : d.priority === "HIGH"
                              ? "bg-danger"
                              : "bg-brand-500"
                        }`}
                      />
                      <div className="flex flex-1 flex-wrap items-baseline justify-between gap-2">
                        <span
                          className={`text-sm font-medium ${
                            past ? "text-muted-foreground line-through" : ""
                          }`}
                        >
                          {d.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(d.date)}
                          {!past ? ` · ${relativeDeadline(d.date)}` : ""}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Section>

            <Section title="Eligibility">
              <ul className="space-y-2">
                {opportunity.eligibility.map((e) => (
                  <li key={e} className="flex items-start gap-2 text-sm">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    <span className="text-muted-foreground">{e}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {primary ? <Countdown target={primary.date} label={`${primary.label} in`} /> : null}

            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold">AI Eligibility Analysis</h3>
                  <AiSourceBadge source={eligibility.source} model={eligibility.model} />
                </div>
                <span className="font-display text-lg font-bold text-brand-600 dark:text-brand-300">
                  {eligibility.score}%
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-brand-gradient"
                  style={{ width: `${eligibility.score}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {eligibility.summary}
              </p>
              <ul className="mt-4 space-y-3">
                {eligibility.signals.map((s) => {
                  const V = VERDICT[s.verdict];
                  return (
                    <li key={s.label} className="flex items-start gap-2">
                      <V.icon className={`mt-0.5 h-4 w-4 shrink-0 ${V.className}`} />
                      <div>
                        <p className="text-xs font-semibold">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.reason}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 rounded-lg bg-secondary/60 p-2 text-[0.7rem] text-muted-foreground">
                Guidance only. Always confirm against the official eligibility criteria.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <ApplyButton slug={opportunity.slug} hasApplication={!!application} />
              <SaveButton
                slug={opportunity.slug}
                saved={savedSlugs.has(opportunity.slug)}
                variant="full"
              />
              {opportunity.officialUrl ? (
                <Button
                  href={opportunity.officialUrl}
                  variant="ghost"
                  className="w-full"
                >
                  Official site <ExternalLink className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h3 className="mb-4 font-display text-base font-semibold tracking-tight">{title}</h3>
      {children}
    </section>
  );
}
