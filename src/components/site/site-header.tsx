"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Discover", href: "/explore" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
];

export function SiteHeader({ authed = false }: { authed?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => setOpen(false), [pathname]);

  // These two marketing pages open with a dark editorial hero. In light theme
  // the transparent header must use light ink until the surface scrolls in.
  const overDarkHero = !scrolled && (pathname === "/" || pathname === "/about");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/85 text-foreground shadow-soft backdrop-blur-xl dark:bg-background/80 dark:shadow-none"
          : overDarkHero
            ? "border-b border-white/10 bg-transparent text-white"
            : "border-b border-transparent bg-transparent text-foreground",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="focus-ring rounded-lg">
          <Logo onDark={overDarkHero} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                overDarkHero
                  ? "text-white/80 hover:bg-white/10 hover:text-white dark:text-muted-foreground dark:hover:bg-secondary dark:hover:text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle className={cn(overDarkHero && "border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/20 hover:text-white dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:border-primary/30 dark:hover:bg-accent/40 dark:hover:text-primary")} />
          {authed ? (
            <Button href="/dashboard" size="sm">
              Open dashboard
            </Button>
          ) : (
            <>
              <Button
                href="/sign-in"
                variant="ghost"
                size="sm"
                className={cn(overDarkHero && "text-white/85 hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-secondary")}
              >
                Sign in
              </Button>
              <Button href="/sign-up" size="sm">
                Get Started
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className={cn(
            "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border md:hidden",
            overDarkHero
              ? "border-white/20 text-white dark:border-border dark:text-foreground"
              : "border-border",
          )}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background text-foreground md:hidden">
          <div className="container flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              {authed ? (
                <Button href="/dashboard" size="sm" className="flex-1">
                  Open dashboard
                </Button>
              ) : (
                <>
                  <Button href="/sign-in" variant="secondary" size="sm" className="flex-1">
                    Sign in
                  </Button>
                  <Button href="/sign-up" size="sm" className="flex-1">
                    Get Started
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
