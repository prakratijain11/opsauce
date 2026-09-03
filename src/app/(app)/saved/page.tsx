import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { AppTopbar } from "@/components/app/app-topbar";
import { OpportunityCard } from "@/components/app/opportunity-card";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/session";
import { getSavedOpportunities, getUnreadCount } from "@/lib/user-data";

export const metadata: Metadata = { title: "Saved" };
export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const user = await requireUser("/saved");
  const [saved, unread] = await Promise.all([
    getSavedOpportunities(),
    getUnreadCount(),
  ]);

  return (
    <>
      <AppTopbar title="Saved" user={user} unread={unread} />
      <div className="flex-1 space-y-6 px-5 py-8 sm:px-8">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Saved opportunities
          </h2>
          <p className="text-sm text-muted-foreground">
            {saved.length} saved for later.
          </p>
        </div>

        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="rounded-full bg-secondary p-3">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-base font-semibold">Nothing saved yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap the bookmark on any opportunity to keep it here for later.
              </p>
            </div>
            <Button href="/explore" className="mt-2">
              Explore opportunities
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {saved.map((o) => (
              <OpportunityCard key={o.slug} opportunity={o} saved />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
