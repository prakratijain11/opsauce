"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { advanceApplicationAction } from "@/lib/actions/opportunities";

const ORDER = ["PREPARING", "READY", "SUBMITTED", "RESULT"] as const;
type Stage = (typeof ORDER)[number];

const NEXT_LABEL: Record<Stage, string | null> = {
  PREPARING: "Mark ready",
  READY: "Mark submitted",
  SUBMITTED: "Log result",
  RESULT: null,
};

export function AdvanceStage({ slug, stage }: { slug: string; stage: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const current = stage as Stage;
  const label = NEXT_LABEL[current];
  const nextStage = ORDER[ORDER.indexOf(current) + 1];

  if (!label || !nextStage) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
        <Check className="h-3.5 w-3.5" /> Complete
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await advanceApplicationAction({ slug, stage: nextStage });
          router.refresh();
        })
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary",
        pending && "opacity-60",
      )}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {label}
    </button>
  );
}
