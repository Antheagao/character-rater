"use client";
import { useState } from "react";
import TopToolbar from "@/components/TopToolbar";
import MediaGrid from "@/components/MediaGrid";
import Pager from "@/components/Pager";
import { usePagedTop } from "@/hooks/usePagedTop";
import type { MediaType } from "@/lib/types";
import SearchBar from "@/components/SearchBar";

const PAGE_SIZE = 20;

export default function Home() {
  const [kind, setKind] = useState<MediaType>("characters");
  const {
    items, page, setPage, loading, error,
    totalPages, canPrev, canNext, nextPage, prevPage,
  } = usePagedTop(kind, PAGE_SIZE);

  const handleKindChange = (newKind: MediaType) => {
    if (newKind !== kind) {
      setKind(newKind);
      setPage(1);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Search Bar with subtle animation */}
      <div className="mb-8 flex justify-center animate-fade-in">
        <SearchBar />
      </div>

      {/* Header section with smooth transitions */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between transition-all duration-200">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
            Top Lists
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {kind === "characters" ? "Top favorite characters" :
             kind === "anime" ? "Top favorite anime" : "Top favorite manga"}
          </p>
        </div>
        <TopToolbar value={kind} onChange={handleKindChange} />
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-xl border border-error/20 bg-error/10 p-4 text-error animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Main content grid */}
      <MediaGrid items={items} type={kind} loading={loading} />

      {/* Empty state */}
      {!loading && items.length === 0 && !error && (
        <div className="py-16 text-center animate-fade-in">
          <div className="text-muted-foreground mb-4 text-6xl opacity-60">🔍</div>
          <p className="text-muted-foreground text-lg font-medium">No items found</p>
          <p className="text-muted-foreground/70 text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {totalPages !== null && totalPages > 1 && (
        <Pager
          page={page}
          totalPages={totalPages}
          canPrev={canPrev}
          canNext={canNext}
          onPrev={prevPage}
          onNext={nextPage}
          onJump={(n) => setPage(n)}
          className="mt-8 animate-fade-in"
        />
      )}
    </main>
  );
}