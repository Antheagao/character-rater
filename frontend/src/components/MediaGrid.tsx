"use client";
import type { MediaItem, MediaType } from "@/lib/types";
import MediaCard from "./MediaCard";

export default function MediaGrid({
  items, type, loading,
}: { items: MediaItem[]; type: MediaType; loading?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
      {items.map((it) => <MediaCard key={`${type}-${it.malId}`} item={it} type={type} />)}
      {loading && Array.from({ length: 10 }).map((_, i) => (
        <div key={`sk-${i}`} className="animate-pulse rounded-2xl border border-black/5 bg-white/60 p-3 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/60">
          <div className="relative mb-3 aspect-[5/7] w-full rounded-xl bg-black/5 dark:bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-black/10 dark:bg-white/10" />
        </div>
      ))}
    </div>
  );
}
