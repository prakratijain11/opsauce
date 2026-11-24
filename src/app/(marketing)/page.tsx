import {
  ArrowRight,
  CalendarClock,
  ClipboardCheck,
  Compass,
  FolderLock,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { AppPreview } from "@/components/site/app-preview";
import { BRAND, OPPORTUNITY_CATEGORIES, WHAT_WE_DO } from "@/lib/brand";

const ICONS = {
  Compass,
  CalendarClock,
  ShieldCheck,
  ClipboardCheck,
  FolderLock,
  Sparkles,
} as const;

const STEPS = [
  {
    icon: UserPlus,
    title: "Build your academic profile",
    body: "Tell us your course, year, interests and goals. It takes two minutes and powers everything else.",
  },
  {
    icon: Sparkles,
    title: "Get personalised matches",
    body: "AI ranks exams, scholarships, internships and more against your eligibility and ambitions.",
  },
  {
    icon: CalendarClock,
    title: "Track every deadline",
    body: "Registration windows, admit cards, results — organised on one timeline with timely alerts.",
  },
  {
    icon: ClipboardCheck,
    title: "Apply prepared",
    body: "Readiness checks and the AI Application Assistant help you submit with confidence — you stay in control.",
  },
];

const FEATURE_TONES = [
  "bg-terracotta-50 text-terracotta-600 dark:bg-terracotta-500/15 dark:text-terracotta-300",
  "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  "bg-sand-100 text-sand-800 dark:bg-sand-300/15 dark:text-sand-200",
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero — an editorial cover, dark in both themes ── */}
      <section className="relative overflow-hidden bg-ink-radial text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-dotted opacity-[0.13]" />
        <div aria-hidden className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-terracotta-500/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="container relative grid gap-16 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <Reveal className="flex flex-col items-start gap-6">
            <span className="eyebrow border-white/15 bg-white/10 text-white/80 before:bg-sand-300">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered opportunity discovery
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-6xl">
              Never miss the opportunity{" "}
              <span className="text-gradient-sand">meant for you.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-white/70">
              {BRAND.description}
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                href="/sign-up"
                size="lg"
                className="group relative overflow-hidden transition-transform hover:scale-[1.02]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-linear group-hover:translate-x-full" />
              </Button>
              <Button
                href="/explore"
                size="lg"
                variant="secondary"
                className="border-white/20 bg-white/10 text-white backdrop-blur-md hover:border-white/30 hover:bg-white/20"
              >
                I already have an account
              </Button>
            </div>
            <dl className="mt-4 grid w-full grid-cols-3 gap-4 border-t border-white/15 pt-6 sm:gap-8">
              <Stat value="11" label="Opportunity types" />
              <Stat value="1 timeline" label="Every deadline" />
              <Stat value="You decide" label="AI assists, never submits" />
            </dl>
          </Reveal>

          <Reveal delay={0.15}>
            <AppPreview />
          </Reveal>
        </div>
      </section>

      {/* ── Categories marquee ───────────────────────────── */}
      <section className="border-b border-border bg-secondary/40 py-10">
        <div className="container flex flex-wrap justify-center gap-2.5">
          {OPPORTUNITY_CATEGORIES.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-soft transition-colors hover:border-teal-300 hover:text-teal-700 dark:hover:border-teal-700 dark:hover:text-teal-300"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-24 py-20 sm:py-28">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
              From lost in tabs to fully prepared
            </h2>
            <p className="mt-4 text-muted-foreground">
              Four deliberate steps between finding an opportunity and being ready for it.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.07}>
                <div className="card-lift relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-terracotta-400 via-sand-300 to-teal-400 opacity-80" />
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                      <s.icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <span className="font-display text-2xl font-bold text-foreground/25 dark:text-border">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-semibold tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature grid ─────────────────────────────────── */}
      <section className="border-y border-border bg-secondary/40 py-20 sm:py-28">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">The platform</span>
            <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
              Everything you need in one place
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_WE_DO.map((f, i) => {
              const Icon = ICONS[f.icon as keyof typeof ICONS] ?? Sparkles;
              return (
                <Reveal key={f.title} delay={i * 0.06}>
                  <div className="card-lift flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ${FEATURE_TONES[i % 3]}`}>
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA — a confident terracotta closer ──────────── */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <Reveal className="relative overflow-hidden rounded-3xl border border-white/15 bg-brand-gradient p-10 text-center text-white shadow-elevated sm:p-16">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sand-300/25 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-dotted opacity-[0.12]" />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
              <span className="eyebrow border-white/20 bg-white/10 text-white/85 before:bg-sand-300">
                Your move
              </span>
              <h2 className="font-display text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Your next opportunity is already out there.
              </h2>
              <p className="text-white/80">
                Join {BRAND.name} and let intelligent discovery, deadline tracking
                and AI guidance keep you a step ahead.
              </p>
              <Button href="/sign-up" size="lg" variant="secondary" className="border-transparent bg-white text-terracotta-700 shadow-elevated hover:bg-sand-50 hover:text-terracotta-800">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-display text-lg font-bold text-white">{value}</dt>
      <dd className="text-[0.68rem] uppercase leading-snug tracking-[0.12em] text-white/50">
        {label}
      </dd>
    </div>
  );
}
