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

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-brand-radial" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dotted opacity-[0.15]" />
        <div className="container grid gap-16 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <Reveal className="flex flex-col items-start gap-6">
            <span className="eyebrow border-white/15 bg-white/10 text-white/80">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered opportunity discovery
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Never miss the opportunity{" "}
              <span className="text-gradient">meant for you.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-white/70">
              {BRAND.description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/sign-up" size="lg" className="shadow-glow hover:scale-105 transition-transform relative overflow-hidden group">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-linear pointer-events-none" />
              </Button>
              <Button
                href="/explore"
                size="lg"
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md transition-colors"
              >
                I already have an account
              </Button>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-6 border-t border-white/10 pt-6 text-white">
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
      <section className="border-y border-border bg-secondary/40 py-10">
        <div className="container flex flex-wrap justify-center gap-2.5">
          {OPPORTUNITY_CATEGORIES.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground"
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
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              From lost in tabs to fully prepared
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.07}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="font-display text-2xl font-bold text-border">
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
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Everything you need in one place
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_WE_DO.map((f, i) => {
              const Icon = ICONS[f.icon as keyof typeof ICONS] ?? Sparkles;
              return (
                <Reveal key={f.title} delay={i * 0.06}>
                  <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground">
                      <Icon className="h-5 w-5" />
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

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <Reveal className="relative overflow-hidden rounded-3xl border border-border bg-brand-radial p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute inset-0 bg-dotted opacity-20" />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Your next opportunity is already out there.
              </h2>
              <p className="text-white/70">
                Join {BRAND.name} and let intelligent discovery, deadline tracking
                and AI guidance keep you a step ahead.
              </p>
              <Button href="/sign-up" size="lg">
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
      <dt className="font-display text-lg font-bold">{value}</dt>
      <dd className="text-xs text-white/55">{label}</dd>
    </div>
  );
}
