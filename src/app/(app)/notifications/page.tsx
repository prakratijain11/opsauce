import type { Metadata } from "next";
import {
  Bell,
  CalendarClock,
  CheckCheck,
  Info,
  Sparkles,
} from "lucide-react";
import { AppTopbar } from "@/components/app/app-topbar";
import { MarkAllRead, MarkOneRead } from "@/components/app/notification-actions";
import { requireUser } from "@/lib/session";
import { getUnreadCount, getUserNotifications } from "@/lib/user-data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

const ICONS: Record<string, typeof Bell> = {
  DEADLINE: CalendarClock,
  RECOMMENDATION: Sparkles,
  SYSTEM: Info,
  INFO: Info,
};

export default async function NotificationsPage() {
  const user = await requireUser("/notifications");
  const [items, unread] = await Promise.all([
    getUserNotifications(),
    getUnreadCount(),
  ]);

  return (
    <>
      <AppTopbar title="Notifications" user={user} unread={unread} />
      <div className="flex-1 space-y-5 px-5 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Notifications
            </h2>
            <p className="text-sm text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "You're all caught up"}
            </p>
          </div>
          {unread > 0 ? <MarkAllRead /> : null}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground">
              Deadline reminders and new recommendations will show up here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {items.map((n, i) => {
              const Icon = ICONS[n.kind] ?? Info;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-5 py-4 ${
                    i > 0 ? "border-t border-border" : ""
                  } ${n.read ? "" : "bg-brand-50/40 dark:bg-brand-500/[0.06]"}`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!n.read ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(n.createdAt, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.read ? <MarkOneRead id={n.id} /> : (
                    <CheckCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
