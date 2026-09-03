import type { Metadata } from "next";
import { AppTopbar } from "@/components/app/app-topbar";
import { ExploreBrowserWrapper } from "@/components/app/explore/browser-wrapper";
import { requireUser } from "@/lib/session";
import { getUnreadCount } from "@/lib/user-data";

export const metadata: Metadata = {
  title: "Explore Opportunities",
  description: "Discover exams, certifications, scholarships, internships and more.",
};
export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const user = await requireUser("/explore");
  const unread = await getUnreadCount();

  return (
    <>
      <AppTopbar title="Explore Opportunities" user={user} unread={unread} />
      <div className="flex-1 px-5 py-8 sm:px-8">
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Find what&apos;s meant for you
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse every opportunity type in one place — save the ones you like.
          </p>
        </div>
        <ExploreBrowserWrapper />
      </div>
    </>
  );
}
