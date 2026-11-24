import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        brand: "border-transparent bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200",
        outline: "border-border text-muted-foreground",
        success:
          "border-transparent bg-success/12 text-success dark:bg-success/15",
        warning:
          "border-transparent bg-warning/15 text-sand-800 dark:text-warning",
        danger: "border-transparent bg-danger/12 text-danger dark:bg-danger/15",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
