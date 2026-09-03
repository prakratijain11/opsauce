"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleSaveAction } from "@/lib/actions/opportunities";

export function SaveButton({
  slug,
  saved: initialSaved,
  variant = "icon",
}: {
  slug: string;
  saved: boolean;
  variant?: "icon" | "full";
}) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(initialSaved);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => setSaved(initialSaved), [initialSaved]);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const optimistic = !saved;
    setSaved(optimistic);
    startTransition(async () => {
      const res = await toggleSaveAction(slug);
      if (res && "saved" in res && typeof res.saved === "boolean") {
        setSaved(res.saved);
      }
      router.refresh();
    });
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={cn(
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border text-sm font-semibold transition-colors",
          saved
            ? "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-200"
            : "border-border bg-card text-foreground hover:bg-secondary",
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        )}
        {saved ? "Saved" : "Save opportunity"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={saved ? "Remove from saved" : "Save opportunity"}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full border transition-colors",
        saved
          ? "border-brand-300 bg-brand-50 text-brand-600 dark:border-brand-500/40 dark:bg-brand-500/15 dark:text-brand-200"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
      )}
    </button>
  );
}
