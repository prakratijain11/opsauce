import { Suspense } from "react";
import { ExploreBrowser } from "@/components/app/explore-browser";
import { listOpportunities } from "@/lib/queries";
import { getSavedSlugs } from "@/lib/user-data";
import { Skeleton } from "@/components/ui/skeleton";

async function BrowserData() {
  const opportunities = await listOpportunities();
  const savedSlugs = await getSavedSlugs();

  return (
    <ExploreBrowser
      opportunities={opportunities}
      savedSlugs={[...savedSlugs]}
    />
  );
}

export function ExploreBrowserWrapper() {
  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <BrowserData />
    </Suspense>
  );
}

function ExploreSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />
        ))}
      </div>
      <Skeleton className="h-4 w-32" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
