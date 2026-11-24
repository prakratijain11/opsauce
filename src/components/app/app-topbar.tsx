import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { initials } from "@/lib/utils";

export function AppTopbar({
  title,
  user,
  unread = 0,
}: {
  title: string;
  user?: { name: string; avatarUrl?: string | null };
  unread?: number;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-5 backdrop-blur-xl sm:px-8">
      <h1 className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight">
        <span aria-hidden className="h-4 w-1 rounded-full bg-brand-gradient" />
        {title}
      </h1>

      <Link
        href="/explore"
        className="ml-auto hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-soft transition-colors hover:border-teal-300 hover:text-foreground dark:hover:border-teal-700 sm:flex sm:w-72"
      >
        <Search className="h-4 w-4" />
        <span className="truncate">Search opportunities…</span>
      </Link>

      <Link
        href="/notifications"
        aria-label="Notifications"
        className="focus-ring relative ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground sm:ml-0"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[0.6rem] font-bold text-danger-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Link>

      <Link
        href="/profile"
        className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-brand-gradient text-sm font-bold text-white"
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-full w-full object-cover"
          />
        ) : (
          initials(user?.name ?? "Student")
        )}
      </Link>
    </header>
  );
}
