import type { Metadata } from "next";
import {
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { AppTopbar } from "@/components/app/app-topbar";
import { AiSourceBadge } from "@/components/app/ai-source-badge";
import { ProfileEditor } from "@/components/app/profile-editor";
import { readinessFor } from "@/lib/ai-model";
import { requireUser } from "@/lib/session";
import { getUnreadCount, getUserDocuments } from "@/lib/user-data";
import { initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const [documents, unread] = await Promise.all([
    getUserDocuments(),
    getUnreadCount(),
  ]);
  const readiness = await readinessFor(user.profile, documents);

  return (
    <>
      <AppTopbar title="Profile" user={user} unread={unread} />
      <div className="flex-1 space-y-8 px-5 py-8 sm:px-8">
        <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-gradient text-2xl font-bold text-white">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              initials(user.name)
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold tracking-tight">{user.name}</h2>
            <p className="text-sm text-muted-foreground">
              {user.profile.headline || "Student"}
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {user.profile.institution ? (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" /> {user.profile.institution}
                </span>
              ) : null}
              {user.profile.city ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {user.profile.city},{" "}
                  {user.profile.country}
                </span>
              ) : null}
            </div>
          </div>
          <div className="w-full sm:w-44">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Profile completeness</span>
              <span>{user.profile.completeness}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-brand-gradient"
                style={{ width: `${user.profile.completeness}%` }}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <ProfileEditor profile={user.profile} />

          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-semibold tracking-tight">
                  AI Readiness Check
                </h3>
                <AiSourceBadge source={readiness.source} model={readiness.model} />
              </div>
              <span className="font-display text-2xl font-bold text-brand-600 dark:text-brand-300">
                {readiness.score}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-brand-gradient"
                style={{ width: `${readiness.score}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{readiness.message}</p>

            <ul className="mt-5 space-y-2.5">
              {readiness.completedSections.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  <span>{s}</span>
                  <span className="ml-auto text-xs text-success">Completed</span>
                </li>
              ))}
              {readiness.missing.map((m) => (
                <li key={m.section} className="flex items-start gap-2 text-sm">
                  <CircleAlert
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      m.severity === "missing" ? "text-danger" : "text-warning"
                    }`}
                  />
                  <div>
                    <span>{m.section}</span>
                    <p className="text-xs text-muted-foreground">{m.detail}</p>
                  </div>
                  <span
                    className={`ml-auto shrink-0 text-xs ${
                      m.severity === "missing" ? "text-danger" : "text-warning"
                    }`}
                  >
                    {m.severity === "missing" ? "Missing" : "Review"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
