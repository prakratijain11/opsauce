"use client";

import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";

export function SignOutButton({ variant = "sidebar" }: { variant?: "sidebar" | "menuitem" }) {
  return (
    <form action={signOutAction} className={variant === "sidebar" ? "" : "contents"}>
      <button
        type="submit"
        className={
          variant === "sidebar"
            ? "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            : "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-muted-foreground hover:text-foreground"
        }
      >
        <LogOut className="h-[18px] w-[18px]" />
        Sign out
      </button>
    </form>
  );
}
