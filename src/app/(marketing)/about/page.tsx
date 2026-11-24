import type { Metadata } from "next";
import {
  CalendarClock,
  ClipboardCheck,
  Compass,
  FolderLock,
  ShieldCheck,
  Sparkles,
  Target,
  Quote,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { DeveloperCard } from "@/components/site/developer-card";
import { Button } from "@/components/ui/button";
import {
  BRAND,
  DEVELOPERS,
  DEVELOPED_BY,
  OPPORTUNITY_CATEGORIES,
  WHAT_WE_DO,
} from "@/lib/brand";

export const metadata: Metadata = {
  title: "About",
  description: BRAND.subtitle,
};

const FEATURE_TONES = [
  "bg-terracotta-50 text-terracotta-600 dark:bg-terracotta-500/15 dark:text-terracotta-300",
  "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  "bg-sand-100 text-sand-800 dark:bg-sand-300/15 dark:text-sand-200",
];

const ICONS = {
  Compass,
  CalendarClock,
  ShieldCheck,
  ClipboardCheck,
  FolderLock,
  Sparkles,
} as const;

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-brand-radial" />
        <div className="pointer-events-none absolute inset-0 bg-dotted opacity-30" />
        <div className="container relative py-24 sm:py-32">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <span className="eyebrow border-white/15 bg-white/10 text-white/80 before:bg-sand-300">
              About the platform
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
              About {BRAND.name}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
              &ldquo;{BRAND.subtitle}&rdquo;
            </p>
          </Reveal>

          <Reveal
            delay={0.15}
            className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-2"
          >
            {OPPORTUNITY_CATEGORIES.map((c) => (
              <span
                key={c}
                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur"
              >
                {c}
              </span>
            ))}
          </Reveal>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* ── Our Mission ──────────────────────────────────── */}
      <section id="mission" className="scroll-mt-24 py-20 sm:py-28">
        <div className="container grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal className="flex flex-col gap-6">
            <span className="eyebrow">Our Mission</span>
            <blockquote className="border-l-2 border-brand-500 pl-5">
              <p className="font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                &ldquo;{BRAND.mission}&rdquo;
              </p>
            </blockquote>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            <p>
              {BRAND.name} is designed to simplify the fragmented world of academic
              and career opportunities.
            </p>
            <p>
              Students often struggle to find relevant exams, certifications,
              scholarships, internships, hackathons, fellowships, and other career
              opportunities.
            </p>
            <p>
              {BRAND.name} uses intelligent recommendations, eligibility analysis,
              deadline tracking, document organization, and AI-powered guidance to
              help students stay informed and prepared.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── What We Do ───────────────────────────────────── */}
      <section className="border-y border-border bg-secondary/40 py-20 sm:py-28">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">What We Do</span>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              A complete operating system for opportunities
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Every feature is built around a single promise — that you never miss
              what matters.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_WE_DO.map((f, i) => {
              const Icon = ICONS[f.icon as keyof typeof ICONS] ?? Sparkles;
              return (
                <Reveal key={f.title} delay={i * 0.06}>
                  <article className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-gradient opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-[0.14]" />
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ${FEATURE_TONES[i % 3]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Our Vision ───────────────────────────────────── */}
      <section id="vision" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-brand-radial" />
        <div className="pointer-events-none absolute inset-0 bg-dotted opacity-25" />
        <div className="container relative">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white">
              <Target className="h-6 w-6" />
            </span>
            <span className="eyebrow border-white/15 bg-white/10 text-white/80 before:bg-sand-300">
              Our Vision
            </span>
            <p className="font-display text-2xl font-semibold leading-snug tracking-tight text-white sm:text-4xl">
              &ldquo;{BRAND.vision[0]}&rdquo;
            </p>
            <p className="max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              &ldquo;{BRAND.vision[1]}&rdquo;
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Meet the Developers ──────────────────────────── */}
      <section id="developers" className="scroll-mt-24 py-20 sm:py-28">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Meet the Developers</span>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Built by two people who cared about the problem
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {BRAND.name} is designed, engineered and maintained by{" "}
              <span className="font-medium text-foreground">{DEVELOPED_BY}</span>.
            </p>
          </Reveal>

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
            {DEVELOPERS.map((dev, i) => (
              <Reveal key={dev.name} delay={i * 0.1}>
                <DeveloperCard dev={dev} index={i} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="mx-auto mt-14 max-w-3xl">
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center shadow-card">
              <Quote className="h-6 w-6 text-brand-500" />
              <p className="font-display text-lg font-medium leading-relaxed tracking-tight sm:text-xl">
                &ldquo;{BRAND.missionLong}&rdquo;
              </p>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row">
                <Button href="/sign-up" size="lg">
                  Start with {BRAND.name}
                </Button>
                <Button href="/explore" variant="secondary" size="lg">
                  Explore opportunities
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
