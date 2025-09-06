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

function formatFavorites(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString();
}

interface MediaCardProps {
  item: MediaItem;
  type: MediaType;
  priority?: boolean;
}

export default function MediaCard({ item, type, priority = false }: MediaCardProps) {
  const href = `/${type}/${item.malId}`;
  const img = imgOf(item);
  
  // Get the display name - use title if available, fall back to name
  const displayName = item.title || item.name || `#${item.malId}`;

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Image container */}
      <div className="relative mb-3 aspect-[5/7] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
        <Image
          src={img}
          alt={displayName}  // Use displayName here too
          fill
          sizes="(max-width: 640px) 48vw, (max-width: 1024px) 24vw, 18vw"
          className="object-cover scale-110 transition-transform duration-500 group-hover:scale-115"
          priority={priority}
        />
        
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10" />
      </div>

      {/* Content */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex-1 truncate text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
          {displayName}  {/* Use displayName here */}
        </h3>
        
        {typeof item.favorites === "number" && (
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            <span className="text-red-500">❤️</span>
            <span>{formatFavorites(item.favorites)}</span>
          </span>
        )}
      </div>

      {/* Type badge - subtle but informative */}
      <div className="mt-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
          {type}
        </span>
      </div>
    </Link>
  );
}
