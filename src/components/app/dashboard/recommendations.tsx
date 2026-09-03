import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { OpportunityCard } from "@/components/app/opportunity-card";
import { AiSourceBadge } from "@/components/app/ai-source-badge";
import { listOpportunities } from "@/lib/queries";
import { recommendationsFor } from "@/lib/ai-model";
import { requireUser } from "@/lib/session";
import { getSavedSlugs } from "@/lib/user-data";
import { Skeleton } from "@/components/ui/skeleton";

async function RecommendationsData() {
  const user = await requireUser();
  const allOpportunities = await listOpportunities();
  const savedSlugs = await getSavedSlugs();
  const recs = await recommendationsFor(allOpportunities, user.profile, 6);

  const bySlug = new Map(allOpportunities.map((o) => [o.slug, o]));
  const recommended = recs.items
    .map((r) => ({ opportunity: bySlug.get(r.slug)!, reason: r.reason }))
    .filter((r) => r.opportunity);

  if (recommended.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No recommendations available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {recommended.map(({ opportunity, reason }) => (
        <div key={opportunity.slug} className="flex flex-col gap-2">
          <OpportunityCard
            opportunity={opportunity}
            saved={savedSlugs.has(opportunity.slug)}
          />
          <p className="px-1 text-xs leading-relaxed text-muted-foreground">
            <Sparkles className="mr-1 inline h-3 w-3 text-brand-500" />
            {reason}
          </p>
        </div>
      ))}
    </div>
  );
}

export function RecommendationsSection() {
  // We need a way to get the AI source badge.
  // Since the data fetching is now inside RecommendationsData, the source badge needs to be there or fetched.
  // For simplicity, I'll move the whole section including the header into RecommendationsData.
  return (
    <Suspense fallback={<RecommendationsSkeleton />}>
      <RecommendationsContent />
    </Suspense>
  );
}

async function RecommendationsContent() {
  const user = await requireUser();
  const allOpportunities = await listOpportunities();
  const savedSlugs = await getSavedSlugs();
  const recs = await recommendationsFor(allOpportunities, user.profile, 6);

  const bySlug = new Map(allOpportunities.map((o) => [o.slug, o]));
  const recommended = recs.items
    .map((r) => ({ opportunity: bySlug.get(r.slug)!, reason: r.reason }))
    .filter((r) => r.opportunity);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          Recommended for you
        </h3>
        <AiSourceBadge source={recs.source} model={recs.model} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {recommended.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No recommendations available yet.</p>
          </div>
        ) : (
          recommended.map(({ opportunity, reason }) => (
            <div key={opportunity.slug} className="flex flex-col gap-2">
              <OpportunityCard
                opportunity={opportunity}
                saved={savedSlugs.has(opportunity.slug)}
              />
              <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                <Sparkles className="mr-1 inline h-3 w-3 text-brand-500" />
                {reason}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function RecommendationsSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
