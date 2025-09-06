"use client";
import { useEffect, useState } from "react";
import { fetchTop } from "@/lib/api";
import type { MediaItem, MediaType } from "@/lib/types";

type PagedResult = {
  items: MediaItem[];
  total: number | null; // <-- not optional
};

export function usePagedTop(kind: MediaType, pageSize = 50) {
  const [page, setPage] = useState(1);               // 1-based
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when kind changes
  useEffect(() => { setPage(1); }, [kind]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const offset = (page - 1) * pageSize;
        const raw = await fetchTop(kind, pageSize, offset) as any;

        const data: PagedResult = Array.isArray(raw)
          ? { items: raw, total: null }
          : {
              items: raw?.items ?? [],
              total: (raw?.meta?.total ?? null) as number | null,
            };

        if (!active) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!active) return;
        setError("Failed to fetch");
        setItems([]);
        setTotal(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [kind, page, pageSize]);

  const totalPages = total != null ? Math.max(1, Math.ceil(total / pageSize)) : null;

  const canPrev = page > 1;
  const canNext = totalPages != null ? page < totalPages : items.length === pageSize; // fallback

  return {
    items, page, setPage, loading, error,
    total, totalPages, canPrev, canNext,
    nextPage: () => canNext && setPage(p => p + 1),
    prevPage: () => canPrev && setPage(p => p - 1),
  };
}
