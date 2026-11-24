"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  FolderClosed,
  User,
  Settings,
  ClipboardList,
  Bookmark,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/app/sign-out-button";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  primary?: boolean;
}

const ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, primary: true },
  { label: "Explore", href: "/explore", icon: Compass, primary: true },
  { label: "Applications", href: "/applications", icon: ClipboardList, primary: true },
  { label: "Documents", href: "/documents", icon: FolderClosed, primary: true },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: User, primary: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar() {
  const isActive = useActive();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
      <Link href="/" className="focus-ring mb-8 rounded-lg px-2">
        <Logo />
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-primary/10 font-semibold text-primary shadow-[inset_3px_0_0_0_hsl(var(--primary))]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-4 flex flex-col gap-2">
        <SignOutButton />
        <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
          <span className="text-xs text-muted-foreground">v{BRAND.version}</span>
          <ThemeToggle className="h-8 w-8 border-0 bg-transparent" />
        </div>
      </div>
    </aside>
  );
}

export function AppBottomNav() {
  const isActive = useActive();
  const primary = ITEMS.filter((i) => i.primary);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {primary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[0.65rem] font-medium transition-colors",
              isActive(item.href)
                ? "text-brand-600 dark:text-brand-300"
                : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
