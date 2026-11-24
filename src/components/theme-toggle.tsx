"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full",
        "border border-border bg-card text-muted-foreground shadow-soft transition-all duration-300",
        "hover:border-primary/30 hover:bg-accent/40 hover:text-primary hover:shadow-card",
        "focus-ring",
        className,
      )}
    >
      {/* hover wash */}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-sand-300/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mounted ? (isDark ? "sun" : "moon") : "placeholder"}
          initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center"
        >
          {mounted && isDark ? (
            <Sun className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.8} />
          ) : mounted ? (
            <Moon className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.8} />
          ) : (
            <span className="h-4 w-4" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
