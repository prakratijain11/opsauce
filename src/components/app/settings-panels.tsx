"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  Info,
  SlidersHorizontal,
  UserCog,
  ArrowUpRight,
  Github,
  Loader2,
  Cpu,
  CircleCheck,
  CircleAlert,
  Check,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/app/sign-out-button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BRAND, DEVELOPERS, DEVELOPED_BY, COPYRIGHT } from "@/lib/brand";
import { updatePreferencesAction } from "@/lib/actions/profile";

const TABS = [
  { id: "account", label: "Account", icon: UserCog },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "about", label: "About", icon: Info },
] as const;

type TabId = (typeof TABS)[number]["id"];

export interface AiStatus {
  enabled: boolean;
  provider: string;
  baseUrl: string;
  model: string;
  displayName: string;
  reachable: boolean;
  modelAvailable: boolean;
}

interface Props {
  account: { name: string; email: string; institution: string };
  notificationPrefs: Record<string, boolean>;
  preferences: Record<string, boolean>;
  aiStatus: AiStatus;
}

const NOTIFICATION_FIELDS = [
  { key: "deadlines", label: "Deadline alerts", hint: "Reminders before registration and application deadlines." },
  { key: "recommendations", label: "New recommendations", hint: "When AI finds opportunities that match your profile." },
  { key: "documents", label: "Document status", hint: "When a document is verified or needs review." },
  { key: "digest", label: "Weekly digest", hint: "A Monday summary of what's coming up." },
];

const PREFERENCE_FIELDS = [
  { key: "prioritiseExams", label: "Prioritise exams & certifications", hint: "Weight competitive exams and certifications higher." },
  { key: "international", label: "Include international opportunities", hint: "Show fellowships and programs outside your country." },
  { key: "eligibleOnly", label: "Only likely-eligible opportunities", hint: "Hide matches below a 45% eligibility score." },
  { key: "reducedMotion", label: "Reduced motion", hint: "Minimise animations across the app." },
];

export function SettingsPanels({
  account,
  notificationPrefs,
  preferences,
  aiStatus,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("tab");
  const active: TabId = TABS.some((t) => t.id === raw) ? (raw as TabId) : "account";

  const setTab = (id: TabId) => router.replace(`/settings?tab=${id}`, { scroll: false });

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active === t.id
                ? "bg-primary/10 font-semibold text-primary shadow-[inset_3px_0_0_0_hsl(var(--primary))]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-w-0">
        {active === "account" && <AccountPanel account={account} />}
        {active === "notifications" && (
          <PrefPanel
            title="Notifications"
            description="Choose when OpSauce should reach out."
            kind="notificationPrefs"
            fields={NOTIFICATION_FIELDS}
            values={notificationPrefs}
          />
        )}
        {active === "preferences" && (
          <div className="space-y-6">
            <AppearancePanel />
            <PrefPanel
              title="Preferences"
              description="Tune discovery to your goals."
              kind="preferences"
              fields={PREFERENCE_FIELDS}
              values={preferences}
            />
          </div>
        )}
        {active === "about" && <AboutPanel aiStatus={aiStatus} />}
      </div>
    </div>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function AccountPanel({ account }: { account: Props["account"] }) {
  return (
    <Panel title="Account" description="Your identity across OpSauce.">
      <div className="divide-y divide-border">
        <Row label="Name" value={account.name} />
        <Row label="Email" value={account.email} />
        <Row label="Institution" value={account.institution || "—"} />
        <Row label="Plan" value="Student · Free" />
      </div>
      <div className="mt-6 flex items-center gap-2">
        <Button variant="secondary" size="sm" href="/profile">
          Edit profile
        </Button>
        <div className="[&_button]:rounded-full [&_button]:border [&_button]:border-border [&_button]:px-4 [&_button]:py-2">
          <SignOutButton variant="menuitem" />
        </div>
      </div>
    </Panel>
  );
}

const THEME_OPTIONS = [
  { id: "light", label: "Light", hint: "Warm paper, sunlit and calm", icon: Sun },
  { id: "dark", label: "Dark", hint: "Deep teal ink, easy on the eyes", icon: Moon },
  { id: "system", label: "System", hint: "Follow your device setting", icon: Monitor },
] as const;

function AppearancePanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <Panel title="Appearance" description="A considered palette for every hour of the day.">
      <div className="grid gap-3 sm:grid-cols-3">
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = mounted && theme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={cn(
                "relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all focus-ring",
                active
                  ? "border-primary/40 bg-primary/5 shadow-card"
                  : "border-border bg-card hover:border-teal-300 hover:bg-secondary/60 dark:hover:border-teal-700",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-lg transition-colors",
                  active
                    ? "bg-brand-gradient text-white"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {option.hint}
                </span>
              </span>
              {active ? (
                <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />
              ) : null}
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function PrefPanel({
  title,
  description,
  kind,
  fields,
  values,
}: {
  title: string;
  description: string;
  kind: "preferences" | "notificationPrefs";
  fields: { key: string; label: string; hint: string }[];
  values: Record<string, boolean>;
}) {
  const router = useRouter();
  const [state, setState] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const f of fields) initial[f.key] = values[f.key] ?? false;
    return initial;
  });
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  async function toggle(key: string) {
    const nextState = { ...state, [key]: !state[key] };
    setState(nextState);
    setSaving(true);
    const res = await updatePreferencesAction(kind, nextState);
    setSaving(false);
    if (res && "error" in res) {
      toast.error(res.error);
    } else {
      setSavedAt(Date.now());
      toast.success(`Updated ${kind === "preferences" ? "preference" : "notification"}`);
    }
    router.refresh();
  }

  return (
    <Panel title={title} description={description}>
      {fields.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => toggle(f.key)}
          className="flex w-full items-center justify-between border-b border-border py-4 text-left last:border-0"
        >
          <span>
            <span className="block text-sm font-medium">{f.label}</span>
            <span className="block text-xs text-muted-foreground">{f.hint}</span>
          </span>
          <span
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors",
              state[f.key] ? "bg-brand-600" : "bg-secondary",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                state[f.key] ? "translate-x-[22px]" : "translate-x-0.5",
              )}
            />
          </span>
        </button>
      ))}
      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        {saving ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </>
        ) : savedAt ? (
          "Preferences saved"
        ) : (
          "Changes save automatically"
        )}
      </p>
    </Panel>
  );
}

function AiStatusCard({ status }: { status: AiStatus }) {
  const hosted = status.provider === "gemini";
  const live = status.enabled && status.reachable && status.modelAvailable;
  const state = !status.enabled
    ? { label: "Disabled", tone: "muted", detail: `${status.displayName} is turned off — the app uses rule-based estimates.` }
    : !status.reachable
      ? { label: "Not connected", tone: "warning", detail: hosted
          ? `Can't reach the Gemini API. Check the GEMINI_API_KEY setting.`
          : `Can't reach the on-device runtime at ${status.baseUrl}. Start Ollama to enable ${status.displayName}.` }
      : !status.modelAvailable
        ? { label: "Model missing", tone: "warning", detail: hosted
            ? `${status.model} isn't available for this API key.`
            : `Runtime is up but the model isn't installed. Run: ollama pull ${status.model}` }
        : { label: hosted ? "Hosted" : "On-device", tone: "success", detail: hosted
            ? `${status.displayName} runs on Gemini (${status.model}) — powering eligibility, readiness, recommendations and the application assistant.`
            : `${status.displayName} runs locally — powering eligibility, readiness, recommendations and the application assistant.` };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Cpu className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-sm font-semibold">
              AI engine · {status.displayName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {hosted ? "Hosted" : "On-device"}{live ? " · active" : " · standby"}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            state.tone === "success" && "bg-success/12 text-success",
            state.tone === "warning" && "bg-warning/15 text-warning",
            state.tone === "muted" && "bg-secondary text-muted-foreground",
          )}
        >
          {live ? (
            <CircleCheck className="h-3.5 w-3.5" />
          ) : (
            <CircleAlert className="h-3.5 w-3.5" />
          )}
          {state.label}
        </span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{state.detail}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Endpoint <code className="rounded bg-secondary px-1 py-0.5">{status.baseUrl}</code>{" "}
        · configurable in <code className="rounded bg-secondary px-1 py-0.5">.env</code>
      </p>
    </section>
  );
}

function AboutPanel({ aiStatus }: { aiStatus: AiStatus }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-4">
          <LogoMark className="h-14 w-14" />
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">
              About {BRAND.name}
            </h2>
            <p className="text-sm text-muted-foreground">Version {BRAND.version}</p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          &ldquo;{BRAND.tagline}&rdquo;
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {BRAND.mission}
        </p>

        <div className="mt-6 divide-y divide-border">
          <Row label="Version" value={BRAND.version} />
          <Row label="Release" value={`${BRAND.year}`} />
          <Row
            label="Developed By"
            value={<span className="text-foreground">{DEVELOPED_BY}</span>}
          />
        </div>
      </section>

      <AiStatusCard status={aiStatus} />

      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          The developers
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {DEVELOPERS.map((d) => (
            <div key={d.name} className="rounded-xl border border-border bg-secondary/40 p-4">
              <p className="text-sm font-semibold">{d.name}</p>
              <p className="text-xs font-medium text-brand-600 dark:text-brand-300">
                {d.role}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {d.description}
              </p>
              <a
                href={d.socials.github}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Read the full story</p>
          <p className="text-xs text-muted-foreground">
            Mission, vision and how {BRAND.name} came together.
          </p>
        </div>
        <Button href="/about" variant="secondary" size="sm">
          Open About page <ArrowUpRight className="h-4 w-4" />
        </Button>
      </section>

      <p className="px-1 text-xs text-muted-foreground">{COPYRIGHT}</p>
    </div>
  );
}
