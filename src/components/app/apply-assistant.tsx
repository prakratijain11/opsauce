"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Loader2,
  Pencil,
  ShieldCheck,
  Sparkles,
  Wand2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { advanceApplicationAction } from "@/lib/actions/opportunities";
import { draftFieldAction, reviewApplicationAction } from "@/lib/actions/ai";

export interface AssistantField {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0-100; 0 = needs input
  source: string;
}

const STEPS = ["Connect", "AI fills details", "Review & Submit"] as const;

export function ApplyAssistant({
  slug,
  opportunityTitle,
  officialUrl,
  fields: initialFields,
}: {
  slug: string;
  opportunityTitle: string;
  officialUrl?: string;
  fields: AssistantField[];
}) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [fields, setFields] = React.useState(initialFields);
  const [log, setLog] = React.useState<string[]>([]);
  const [filling, setFilling] = React.useState(false);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);
  const [reviewResult, setReviewResult] = React.useState<any>(null);
  const [reviewing, setReviewing] = React.useState(false);

  const detected = fields.length;
  const autoFilled = fields.filter((f) => f.confidence >= 80).length;
  const needReview = fields.filter((f) => f.confidence > 0 && f.confidence < 80).length;
  const remaining = fields.filter((f) => f.confidence === 0 || !f.value.trim()).length;

  function runAutofill() {
    setFilling(true);
    setLog([`Detected ${detected} form fields on the application`]);
    let i = 0;
    const ordered = [...initialFields];
    const tick = () => {
      if (i >= ordered.length) {
        setFilling(false);
        setLog((l) => [...l, "Autofill complete — please review every field before submitting"]);
        return;
      }
      const f = ordered[i];
      setLog((l) => [
        ...l,
        f.confidence === 0
          ? `Needs your input: ${f.label}`
          : `Filled ${f.label} — ${f.confidence}% confidence (${f.source})`,
      ]);
      i += 1;
      setTimeout(tick, 320);
    };
    setTimeout(tick, 300);
  }

  function updateField(key: string, value: string) {
    setFields((prev) =>
      prev.map((f) =>
        f.key === key
          ? { ...f, value, confidence: value.trim() ? Math.max(f.confidence, 100) : 0, source: "You" }
          : f,
      ),
    );
  }

  async function submit() {
    setSubmitting(true);
    const res = await advanceApplicationAction({ slug, stage: "SUBMITTED" });
    setSubmitting(false);
    if (res && "error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Application marked as submitted!");
      setDone(true);
    }
  }

  async function runReview() {
    setReviewing(true);
    setLog(["Running AI Application Review..."]);
    const res = await reviewApplicationAction({
      slug,
      fields: fields.map((f) => ({ label: f.label, value: f.value })),
    });
    setReviewing(false);
    if (res && !("error" in res)) {
      setReviewResult(res);
      setLog((l) => [...l, `AI Review complete: Score ${res.score}/100. ${res.overallFeedback}`]);
      toast.success(`AI Review Complete: Score ${res.score}/100`);
    } else {
      setLog((l) => [...l, "AI Review failed — please review manually."]);
      toast.error("AI Review failed. Please review manually.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
                    i < step || done
                      ? "bg-success text-success-foreground"
                      : i === step
                        ? "bg-brand-gradient text-white"
                        : "bg-secondary text-muted-foreground",
                  )}
                >
                  {i < step || done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    i === step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 ? (
                <span className="h-px flex-1 bg-border" />
              ) : null}
            </React.Fragment>
          ))}
        </div>
        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-success/30 bg-success/[0.06] p-10 text-center"
          >
            <CircleCheck className="h-12 w-12 text-success" />
            <h3 className="font-display text-lg font-semibold">Marked as submitted</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Your prepared information for <strong>{opportunityTitle}</strong> is saved.
              Complete the final submission on the official site — you stay in control of
              what is sent.
            </p>
            <div className="flex gap-2">
              {officialUrl ? (
                <Button href={officialUrl}>Open official site</Button>
              ) : null}
              <Button variant="secondary" onClick={() => router.push("/applications")}>
                View applications
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand-500" />
                    <h3 className="font-display text-base font-semibold">
                      Connect to the application
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The AI Application Assistant will prepare your information for{" "}
                    <strong>{opportunityTitle}</strong> using your profile and verified
                    documents. Nothing is submitted automatically — you review every field
                    and complete the final step yourself.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-success" /> Your data never leaves
                      your vault without your action
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-success" /> Every field is editable
                      before submission
                    </li>
                  </ul>
                  <Button
                    className="mt-2 self-start"
                    onClick={() => {
                      setStep(1);
                      runAutofill();
                    }}
                  >
                    Start with AI <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold">
                      AI is filling the form
                    </h3>
                    {filling ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Working…
                      </span>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Stat label="Auto-filled" value={autoFilled} tone="success" />
                    <Stat label="Need review" value={needReview} tone="warning" />
                    <Stat label="Your input" value={remaining} tone="muted" />
                  </div>
                  <div className="divide-y divide-border">
                    {fields.map((f) => (
                      <FieldRow
                        key={f.key}
                        field={f}
                        slug={slug}
                        editing={editing === f.key}
                        onEdit={() => setEditing(f.key)}
                        onSave={(v) => {
                          updateField(f.key, v);
                          setEditing(null);
                        }}
                        onCancel={() => setEditing(null)}
                        onLog={(m) => setLog((l) => [...l, m])}
                      />
                    ))}
                  </div>
                  <Button
                    className="mt-2 self-start"
                    disabled={filling || remaining > 0}
                    onClick={() => setStep(2)}
                  >
                    {remaining > 0
                      ? `${remaining} field${remaining > 1 ? "s" : ""} need your input`
                      : "Review & confirm"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold">
                      Review &amp; confirm
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviewing}
                      onClick={runReview}
                      className="gap-1.5"
                    >
                      {reviewing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                      )}
                      {reviewResult ? "Re-review" : "Review with AI"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Check every value. When you confirm, this application is marked as
                    submitted in OpSauce and you&apos;ll be directed to the official
                    site to finish.
                  </p>
                  {reviewResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-500/20 dark:bg-brand-500/5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-brand-600" />
                          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                            AI Application Score: {reviewResult.score}/100
                          </span>
                        </div>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          reviewResult.score >= 80 ? "bg-success/20 text-success" :
                          reviewResult.score >= 60 ? "bg-warning/20 text-sand-800 dark:text-warning" : "bg-danger/15 text-danger"
                        )}>
                          {reviewResult.score >= 80 ? "Strong" : reviewResult.score >= 60 ? "Good" : "Needs Work"}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-3">{reviewResult.overallFeedback}</p>
                      <div className="space-y-2">
                        {reviewResult.findings.map((f: any, i: number) => (
                          <div key={i} className="flex gap-2 text-xs p-2 rounded-lg bg-white/50 dark:bg-card/50 border border-border">
                            {f.severity === "critical" ? (
                              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-danger" />
                            ) : (
                              <Lightbulb className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                            )}
                            <div>
                              <span className="font-semibold">{f.field}:</span> {f.issue}
                              <p className="text-muted-foreground italic mt-0.5">Tip: {f.suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  <dl className="divide-y divide-border rounded-xl border border-border">
                    {fields.map((f) => (
                      <div
                        key={f.key}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {f.label}
                        </dt>
                        <dd className="truncate text-sm font-medium">{f.value || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                  <label className="flex items-start gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-input accent-brand-600"
                    />
                    <span className="text-muted-foreground">
                      I have reviewed all the information above and confirm it is correct.
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button disabled={!confirmed || submitting} onClick={submit}>
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Confirm &amp; mark submitted
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display text-sm font-semibold">AI Activity Log</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            A transparent record of what the assistant did.
          </p>
          <ol className="mt-4 space-y-2.5">
            {log.length === 0 ? (
              <li className="text-xs text-muted-foreground">
                No activity yet — start with AI to begin.
              </li>
            ) : (
              log.map((entry, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  <span className="text-muted-foreground">{entry}</span>
                </li>
              ))
            )}
          </ol>
        </div>
      </aside>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "muted";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-secondary/40 py-3">
      <p className={cn("font-display text-xl font-bold", toneClass)}>{value}</p>
      <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

const LONG_FIELDS = /statement|purpose|essay|motivation|why|cover|about you/i;

function FieldRow({
  field,
  slug,
  editing,
  onEdit,
  onSave,
  onCancel,
  onLog,
}: {
  field: AssistantField;
  slug: string;
  editing: boolean;
  onEdit: () => void;
  onSave: (v: string) => void;
  onCancel: () => void;
  onLog: (message: string) => void;
}) {
  const [draft, setDraft] = React.useState(field.value);
  const [drafting, setDrafting] = React.useState(false);
  React.useEffect(() => setDraft(field.value), [field.value, editing]);

  const needsInput = field.confidence === 0 || !field.value.trim();
  const canDraft = needsInput || LONG_FIELDS.test(field.label);
  const isLong = LONG_FIELDS.test(field.label);

  async function draftWithAI() {
    setDrafting(true);
    onLog(`Drafting "${field.label}" with the on-device model…`);
    const res = await draftFieldAction({ slug, fieldLabel: field.label });
    setDrafting(false);
    if (res && "value" in res && res.value) {
      onSave(res.value);
      onLog(
        `Drafted "${field.label}" — ${res.confidence}% confidence ` +
          `(${res.source === "ai" ? res.model ?? "NovaMind5.8" : "template"}). ${res.rationale}`,
      );
    } else {
      onLog(`Could not draft "${field.label}" — please fill it in yourself.`);
    }
  }

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {field.label}
        </p>
        {editing ? (
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            {isLong ? (
              <textarea
                value={draft}
                autoFocus
                rows={4}
                onChange={(e) => setDraft(e.target.value)}
                className="focus-ring flex-1 rounded-lg border border-input bg-card px-2.5 py-2 text-sm outline-none"
              />
            ) : (
              <input
                value={draft}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                className="focus-ring h-9 flex-1 rounded-lg border border-input bg-card px-2.5 text-sm outline-none"
              />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSave(draft)}
                className="h-9 rounded-lg bg-brand-600 px-2.5 text-xs font-semibold text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="h-9 rounded-lg border border-border px-2.5 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            className={cn(
              "mt-0.5 text-sm",
              isLong ? "line-clamp-2" : "truncate",
              needsInput && "text-muted-foreground",
            )}
          >
            {field.value || "Awaiting your input"}
          </p>
        )}
      </div>
      {!editing ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[0.6rem] font-bold",
              needsInput
                ? "bg-secondary text-muted-foreground"
                : field.confidence < 80
                  ? "bg-warning/15 text-warning"
                  : "bg-success/15 text-success",
            )}
          >
            {needsInput ? "INPUT" : `${field.confidence}%`}
          </span>
          {canDraft ? (
            <button
              type="button"
              onClick={draftWithAI}
              disabled={drafting}
              title="Draft with the on-device model"
              className="grid h-7 w-7 place-items-center rounded-md border border-brand-300 text-brand-600 hover:bg-brand-50 disabled:opacity-50 dark:border-brand-500/40 dark:text-brand-200 dark:hover:bg-brand-500/10"
            >
              {drafting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Wand2 className="h-3 w-3" />
              )}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${field.label}`}
            className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
