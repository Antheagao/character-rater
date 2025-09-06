"use client";
import { useState } from "react";
import TopToolbar from "@/components/TopToolbar";
import MediaGrid from "@/components/MediaGrid";
import Pager from "@/components/Pager";
import { usePagedTop } from "@/hooks/usePagedTop";
import type { MediaType } from "@/lib/types";

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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Top Lists</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {kind === "characters" ? "Top favorite characters" :
             kind === "anime" ? "Top favorite anime" : "Top favorite manga"}
          </p>
        </div>
        <TopToolbar value={kind} onChange={handleKindChange} />
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </p>
      )}

      <MediaGrid items={items} type={kind} loading={loading} />

      {!loading && items.length === 0 && !error && (
        <div className="py-12 text-center">
          <div className="text-neutral-400 dark:text-neutral-500 mb-2 text-4xl">🔍</div>
          <p className="text-neutral-500 dark:text-neutral-400">No items found</p>
        </div>
      )}

      {/* Handle null totalPages by providing a default value */}
      {totalPages !== null && totalPages > 1 && (
        <Pager
          page={page}
          totalPages={totalPages}
          canPrev={canPrev}
          canNext={canNext}
          onPrev={prevPage}
          onNext={nextPage}
          onJump={(n) => setPage(n)}
          className="mt-8"
        />
      )}
    </main>
  );
}
