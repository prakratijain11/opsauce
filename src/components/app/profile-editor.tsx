"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Sparkles, Target, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateProfileAction } from "@/lib/actions/profile";
import type { StudentProfile } from "@/lib/types";

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

export function ProfileEditor({ profile }: { profile: StudentProfile }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: profile.name,
    educationLevel: profile.educationLevel,
    fieldOfStudy: profile.fieldOfStudy,
    institution: profile.institution,
    graduationYear: String(profile.graduationYear),
    cgpa: String(profile.cgpa),
    city: profile.city,
    country: profile.country,
    interests: profile.interests,
    careerGoals: profile.careerGoals,
    preferredTypes: profile.preferredTypes as string[],
  });

  const toggle = (key: "interests" | "careerGoals" | "preferredTypes", v: string) =>
    setForm((p) => ({
      ...p,
      [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v],
    }));

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateProfileAction({
        ...form,
        graduationYear: Number(form.graduationYear),
        cgpa: Number(form.cgpa),
      });
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  if (!editing) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold tracking-tight">
            Academic profile
          </h3>
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Education level" value={profile.educationLevel || "—"} />
          <Field label="Field of study" value={profile.fieldOfStudy || "—"} />
          <Field label="Institution" value={profile.institution || "—"} />
          <Field
            label="Graduation year"
            value={profile.graduationYear ? String(profile.graduationYear) : "—"}
          />
          <Field label="CGPA" value={profile.cgpa ? profile.cgpa.toFixed(1) : "—"} />
          <Field
            label="Location"
            value={[profile.city, profile.country].filter(Boolean).join(", ") || "—"}
          />
        </dl>
        <TagBlock label="Interests" icon={Sparkles} items={profile.interests} variant="brand" />
        <TagBlock label="Career goals" icon={Target} items={profile.careerGoals} />
        <TagBlock label="Preferred types" items={profile.preferredTypes} />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold tracking-tight">Edit profile</h3>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger/[0.07] px-3 py-2 text-xs text-danger">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input
          label="Education level"
          value={form.educationLevel}
          onChange={(v) => setForm({ ...form, educationLevel: v })}
        />
        <Input
          label="Field of study"
          value={form.fieldOfStudy}
          onChange={(v) => setForm({ ...form, fieldOfStudy: v })}
        />
        <Input
          label="Institution"
          value={form.institution}
          onChange={(v) => setForm({ ...form, institution: v })}
        />
        <Input
          label="Graduation year"
          type="number"
          value={form.graduationYear}
          onChange={(v) => setForm({ ...form, graduationYear: v })}
        />
        <Input
          label="CGPA"
          value={form.cgpa}
          onChange={(v) => setForm({ ...form, cgpa: v })}
        />
        <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <Input
          label="Country"
          value={form.country}
          onChange={(v) => setForm({ ...form, country: v })}
        />
      </div>

      <EditTags label="Interests" options={INTERESTS} selected={form.interests} onToggle={(v) => toggle("interests", v)} />
      <EditTags label="Career goals" options={GOALS} selected={form.careerGoals} onToggle={(v) => toggle("careerGoals", v)} />
      <EditTags label="Preferred types" options={TYPES} selected={form.preferredTypes} onToggle={(v) => toggle("preferredTypes", v)} />

      <div className="mt-5 flex gap-2">
        <Button size="sm" onClick={save} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save changes
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none"
      />
    </label>
  );
}

function TagBlock({
  label,
  icon: Icon,
  items,
  variant,
}: {
  label: string;
  icon?: typeof Sparkles;
  items: string[];
  variant?: "brand";
}) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <Badge key={i} variant={variant ?? "default"}>
            {Icon ? <Icon className="h-3 w-3" /> : null} {i}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function EditTags({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                active
                  ? "border-transparent bg-brand-gradient text-white"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
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
