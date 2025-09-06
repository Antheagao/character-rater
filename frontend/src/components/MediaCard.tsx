"use client";
import Image from "next/image";
import Link from "next/link";
import type { MediaItem, MediaType } from "@/lib/types";

function imgOf(m: MediaItem) {
  return (
    m.imageUrl ||
    m.imagesJson?.webp?.image_url ||
    m.imagesJson?.jpg?.image_url ||
    "/placeholder.png"
  );
}

// format: 17200 -> 17.2k, 1500000 -> 1.5M
function formatFavorites(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function MediaCard({ item, type }: { item: MediaItem; type: MediaType }) {
  const href = `/${type}/${item.malId}`;
  const img = imgOf(item);
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-black/5 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-neutral-900"
    >
      <div className="relative w-full aspect-[5/7] overflow-hidden rounded-xl bg-neutral-900">
        <Image
          src={img}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 48vw, (max-width: 1024px) 24vw, 18vw"
          className="object-cover will-change-transform [transform:translateZ(0)] scale-[1.02] group-hover:scale-[1.05] transition-transform duration-300"
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <h3 className="max-w-[70%] truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {item.name}
        </h3>
        {typeof item.favorites === "number" && (
          <span 
            className="shrink-0 whitespace-nowrap rounded-lg bg-black/5 px-2 py-1 text-[12px] font-semibold text-neutral-700 dark:bg-white/10 dark:text-neutral-200 flex items-center gap-1"
          >
            <span aria-hidden>❤️</span>
            {formatFavorites(item.favorites!)}
          </span>
        )}
      </div>
    </Link>
  );
}
