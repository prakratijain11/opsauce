"use client";

import * as React from "react";
import { Search, SearchX } from "lucide-react";
import { OpportunityCard } from "@/components/app/opportunity-card";
import { cn } from "@/lib/utils";
import type { Opportunity, OpportunityType } from "@/lib/types";

const TYPES: (OpportunityType | "All")[] = [
  "All",
  "Competitive Exam",
  "Certification",
  "Scholarship",
  "Internship",
  "Hackathon",
  "Fellowship",
  "Research",
  "Workshop",
  "Higher Education",
  "Government",
  "Career Program",
];

export function ExploreBrowser({
  opportunities,
  savedSlugs = [],
}: {
  opportunities: Opportunity[];
  savedSlugs?: string[];
}) {
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState<(typeof TYPES)[number]>("All");
  const savedSet = React.useMemo(() => new Set(savedSlugs), [savedSlugs]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return opportunities.filter((o) => {
      const matchesType = type === "All" || o.type === type;
      const matchesQuery =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.organizer.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q));
      return matchesType && matchesQuery;
    });
  }, [opportunities, query, type]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exams, certifications, scholarships…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              type === t
                ? "border-transparent bg-brand-gradient text-white shadow-glow"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"}
      </p>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((o) => (
            <OpportunityCard
              key={o.slug}
              opportunity={o}
              saved={savedSet.has(o.slug)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mb-4 rounded-full bg-secondary p-3">
            <SearchX className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-display text-base font-semibold">No matches found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn&apos;t find any opportunities matching your current filters.
            Try adjusting your search or exploring other categories.
          </p>
        </div>
      )}
    </div>
  );
}
