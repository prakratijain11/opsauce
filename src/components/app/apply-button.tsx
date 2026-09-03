"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startApplicationAction } from "@/lib/actions/opportunities";

export function ApplyButton({
  slug,
  hasApplication,
}: {
  slug: string;
  hasApplication: boolean;
}) {
  const [pending, startTransition] = React.useTransition();

  if (hasApplication) {
    return (
      <Button href={`/opportunities/${slug}/apply`} className="w-full">
        <Sparkles className="h-4 w-4" /> Continue application
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await startApplicationAction(slug);
        })
      }
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
      Apply with AI Assistant
    </Button>
  );
}
