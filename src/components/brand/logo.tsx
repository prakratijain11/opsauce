import * as React from "react";
import { cn } from "@/lib/utils";

/** The OpSauce glyph — an open doorway / aperture inside a rounded tile. */
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
        <linearGradient id="opsauce-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="0.5" stopColor="#6366F1" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#opsauce-grad)" />
      <rect width="48" height="48" rx="13" fill="white" fillOpacity="0.04" />
      <path
        d="M17 33V19a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M24 33V24" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="24" cy="21" r="1.9" fill="white" />
      <path
        d="M13 33h22"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />
    </svg>
  );
}

export function Logo({
  className,
  showAiChip = true,
  invert = false,
}: {
  className?: string;
  showAiChip?: boolean;
  invert?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="inline-flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-display text-[1.35rem] font-bold leading-none tracking-tight",
            invert ? "text-white" : "text-foreground",
          )}
        >
          Op<span className="text-brand-500">Sauce</span>
        </span>
        {showAiChip ? (
          <span className="rounded-md bg-brand-gradient px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-white">
            AI
          </span>
        ) : null}
      </span>
    </span>
  );
}
