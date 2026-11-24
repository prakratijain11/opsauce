import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-gradient text-white shadow-glow hover:brightness-[1.06] hover:shadow-[0_18px_46px_-10px_rgba(201,75,60,0.55)]",
        secondary:
          "border border-border bg-card text-foreground shadow-soft hover:border-teal-300/70 hover:bg-teal-50 dark:hover:border-teal-700/50 dark:hover:bg-teal-900/30",
        ghost: "text-foreground hover:bg-secondary hover:text-primary",
        outline:
          "border border-brand-300 text-brand-700 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-300 dark:hover:bg-brand-500/10",
        subtle: "bg-secondary text-secondary-foreground hover:bg-muted",
        danger: "bg-danger text-danger-foreground hover:brightness-110",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-6",
        lg: "h-12 px-8 text-[15px]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, href, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }));
    if (href) {
      const isExternal = /^https?:\/\//.test(href);
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className={classes}
            {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          />
        );
      }
      return (
        <Link href={href} className={classes}>
          {props.children}
        </Link>
      );
    }
    return <button ref={ref} className={classes} {...props} />;
  },
);
Button.displayName = "Button";

export { buttonVariants };
