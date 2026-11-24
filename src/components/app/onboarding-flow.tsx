"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { completeOnboardingAction } from "@/lib/actions/profile";

const EDUCATION_LEVELS = [
  "School Student (Class 11-12)",
  "Undergraduate — 1st Year",
  "Undergraduate — 2nd Year",
  "Undergraduate — 3rd Year",
  "Undergraduate — Final Year",
  "Postgraduate",
  "Recent Graduate",
];

const INTERESTS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Web Development",
  "Data Science",
  "Cybersecurity",
  "Product Design",
  "Open Source",
  "Robotics",
  "Finance",
  "Biotechnology",
  "Public Policy",
  "Entrepreneurship",
];

const GOALS = [
  "Higher Studies",
  "AI & ML",
  "Placements",
  "Research",
  "Government Services",
  "Study Abroad",
  "Startup",
];

const TYPES = [
  "Competitive Exam",
  "Certification",
  "Scholarship",
  "Internship",
  "Hackathon",
  "Fellowship",
  "Research",
  "Workshop",
  "Higher Education",
  "Government",
  "Career Program",
];

interface FormValues {
  educationLevel: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
  cgpa: string;
  city: string;
  country: string;
  interests: string[];
  careerGoals: string[];
  preferredTypes: string[];
}

const STEPS = ["Academics", "Interests", "Goals", "Discovery", "Your AI Assistant"] as const;

export function OnboardingFlow({ name }: { name: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [values, setValues] = React.useState<FormValues>({
    educationLevel: "",
    fieldOfStudy: "",
    institution: "",
    graduationYear: String(new Date().getFullYear() + 2),
    cgpa: "",
    city: "",
    country: "India",
    interests: [],
    careerGoals: [],
    preferredTypes: [],
  });

  const set = <K extends keyof FormValues>(key: K, v: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const toggle = (key: "interests" | "careerGoals" | "preferredTypes", v: string) =>
    setValues((prev) => ({
      ...prev,
      [key]: prev[key].includes(v)
        ? prev[key].filter((x) => x !== v)
        : [...prev[key], v],
    }));

  const canNext = () => {
    if (step === 0)
      return (
        values.educationLevel &&
        values.fieldOfStudy.trim() &&
        values.institution.trim() &&
        values.city.trim() &&
        values.cgpa.trim()
      );
    if (step === 1) return values.interests.length >= 2;
    if (step === 2) return values.careerGoals.length >= 1;
    if (step === 3) return values.preferredTypes.length >= 1;
    return false;
  };

  async function finish() {
    setPending(true);
    setError(null);
    const res = await completeOnboardingAction({
      ...values,
      graduationYear: Number(values.graduationYear),
      cgpa: Number(values.cgpa),
    });
    if (res && "error" in res && res.error) {
      setError(res.error);
      setPending(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Logo showAiChip={false} />
        <ThemeToggle />
      </div>

      <div className="mb-8">
        <p className="text-sm text-muted-foreground">
          Welcome, {name.split(" ")[0]} 👋
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
          Let&apos;s personalise your opportunities
        </h1>
      </div>

      {/* progress */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col gap-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors",
                i <= step ? "bg-brand-gradient" : "bg-secondary",
              )}
            />
            <span
              className={cn(
                "text-[0.7rem] font-medium",
                i === step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-danger/30 bg-danger/[0.07] px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex-1">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <Select
              label="Education level"
              value={values.educationLevel}
              onChange={(v) => set("educationLevel", v)}
              options={EDUCATION_LEVELS}
            />
            <TextInput
              label="Field of study"
              placeholder="Computer Science & Engineering"
              value={values.fieldOfStudy}
              onChange={(v) => set("fieldOfStudy", v)}
            />
            <TextInput
              label="Institution"
              placeholder="Your college or university"
              value={values.institution}
              onChange={(v) => set("institution", v)}
            />
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="Graduation year"
                type="number"
                value={values.graduationYear}
                onChange={(v) => set("graduationYear", v)}
              />
              <TextInput
                label="CGPA / GPA"
                placeholder="8.6"
                value={values.cgpa}
                onChange={(v) => set("cgpa", v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="City"
                placeholder="Nagpur"
                value={values.city}
                onChange={(v) => set("city", v)}
              />
              <TextInput
                label="Country"
                value={values.country}
                onChange={(v) => set("country", v)}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <ChipGroup
            hint="Pick at least 2 — we use these to rank opportunities."
            options={INTERESTS}
            selected={values.interests}
            onToggle={(v) => toggle("interests", v)}
          />
        )}

        {step === 2 && (
          <ChipGroup
            hint="What are you working towards?"
            options={GOALS}
            selected={values.careerGoals}
            onToggle={(v) => toggle("careerGoals", v)}
          />
        )}

        {step === 3 && (
          <ChipGroup
            hint="Which kinds of opportunities should we surface first?"
            options={TYPES}
            selected={values.preferredTypes}
            onToggle={(v) => toggle("preferredTypes", v)}
          />
        )}
        {step === 4 && (
          <div className="flex flex-col gap-6 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-gradient text-white shadow-glow">
              <Sparkles className="h-10 w-10" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight">
                Meet NovaMind 5.8
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Your personal AI assistant is now ready. NovaMind runs 100% on your device,
                keeping your data private while powering your discovery experience.
              </p>
            </div>
            <div className="grid gap-3 text-left">
              {[
                { icon: <Check className="h-4 w-4 text-success" />, text: "Smart Eligibility Analysis" },
                { icon: <Check className="h-4 w-4 text-success" />, text: "Personalised Recommendations" },
                { icon: <Check className="h-4 w-4 text-success" />, text: "AI-Powered Application Drafting" },
                { icon: <Check className="h-4 w-4 text-success" />, text: "Readiness & Quality Reviews" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              NovaMind uses a local LLM via Ollama. If not connected, the app
              seamlessly falls back to rule-based estimates.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || pending}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            size="sm"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" onClick={finish} disabled={!canNext() || pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Finish setup
          </Button>
        )}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring h-11 rounded-xl border border-input bg-card px-3.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-brand-400"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring h-11 rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-brand-400"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChipGroup({
  hint,
  options,
  selected,
  onToggle,
}: {
  hint: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">{hint}</p>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                active
                  ? "border-transparent bg-brand-gradient text-white shadow-glow"
                  : "border-border bg-card text-muted-foreground hover:border-brand-300 hover:text-foreground",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
