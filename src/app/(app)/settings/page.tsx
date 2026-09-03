import type { Metadata } from "next";
import { Suspense } from "react";
import { AppTopbar } from "@/components/app/app-topbar";
import { SettingsPanels } from "@/components/app/settings-panels";
import { requireUser } from "@/lib/session";
import { getUnreadCount } from "@/lib/user-data";
import { getAiStatus } from "@/lib/ai-model";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  const [unread, aiStatus] = await Promise.all([getUnreadCount(), getAiStatus()]);

  return (
    <>
      <AppTopbar title="Settings" user={user} unread={unread} />
      <div className="flex-1 px-5 py-8 sm:px-8">
        <Suspense fallback={null}>
          <SettingsPanels
            account={{
              name: user.name,
              email: user.email,
              institution: user.profile.institution,
            }}
            notificationPrefs={user.notificationPrefs}
            preferences={user.preferences}
            aiStatus={aiStatus}
          />
        </Suspense>
      </div>
    </>
  );
}
