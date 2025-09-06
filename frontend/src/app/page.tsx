"use client";
import { useState } from "react";
import TopToolbar from "@/components/TopToolbar";
import MediaGrid from "@/components/MediaGrid";
import Pager from "@/components/Pager";
import { usePagedTop } from "@/hooks/usePagedTop";
import type { MediaType } from "@/lib/types";

const PAGE_SIZE = 50;

export default function Home() {
  const [kind, setKind] = useState<MediaType>("characters");
  const {
    items, page, setPage, loading, error,
    totalPages, canPrev, canNext, nextPage, prevPage,
  } = usePagedTop(kind, PAGE_SIZE);

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
        <TopToolbar value={kind} onChange={(k) => setKind(k)} />
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </p>
      )}

      <MediaGrid items={items} type={kind} loading={loading} />

      <Pager
        page={page}
        totalPages={totalPages}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={prevPage}
        onNext={nextPage}
        onJump={(n) => setPage(n)}
      />
    </main>
  );
}
