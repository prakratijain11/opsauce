import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The OpSauce glyph — an open aperture (the opportunity) holding a single
 * butter-coloured drop (the sauce that makes it yours). A lagoon spark sits
 * in the opening, so the mark reads as forward motion even at favicon size.
 */
export function LogoMark({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("h-9 w-9", className)}
      {...props}
    >
      <defs>
        <linearGradient
          id="opsauce-mark"
          x1="7"
          y1="4"
          x2="41"
          y2="45"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d9604b" />
          <stop offset="0.55" stopColor="#c94b3c" />
          <stop offset="1" stopColor="#9e362c" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#opsauce-mark)" />
      <rect
        x="0.75"
        y="0.75"
        width="46.5"
        height="46.5"
        rx="13.25"
        stroke="#fefbf0"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />
      {/* warm halo behind the aperture */}
      <path
        d="M13.5 30.5C15.8 21.4 22.6 16.4 32.8 17.2"
        stroke="#f0d98d"
        strokeOpacity="0.24"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* open ring — an aperture, never fully closed */}
      <path
        d="M34.34 27.76A11 11 0 1 1 28.65 14.03"
        stroke="#fefbf0"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* the sauce drop */}
      <path
        d="M24 17.1c3.35 4.75 5.02 7.1 5.02 9.42a5.02 5.02 0 1 1-10.04 0c0-2.32 1.67-4.67 5.02-9.42Z"
        fill="#f0d98d"
      />
      {/* lagoon spark in the opening */}
      <circle cx="35.1" cy="13.6" r="2.5" fill="#76afc0" />
    </svg>
  );
}

export function Logo({
  className,
  showAiChip = true,
  invert = false,
  onDark = false,
}: {
  className?: string;
  showAiChip?: boolean;
  invert?: boolean;
  /** Light theme over a dark surface: lift the wordmark without changing dark theme. */
  onDark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="inline-flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-display text-[1.35rem] font-bold leading-none tracking-[-0.045em]",
            invert ? "text-white" : "text-foreground",
            onDark && "text-white dark:text-foreground",
          )}
        >
          Op
          <span className={cn("text-primary", onDark && "text-sand-300 dark:text-primary")}>
            Sauce
          </span>
        </span>
        {showAiChip ? (
          <span className="rounded-md border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-teal-700 dark:border-teal-700/50 dark:bg-teal-900/40 dark:text-teal-200">
            AI
          </span>
        ) : null}
      </span>
    </span>
  );
}
