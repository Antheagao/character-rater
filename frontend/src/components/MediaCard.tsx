"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
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

interface LikeCounts {
  likes: number;
  dislikes: number;
}

interface UserInteraction {
  userInteraction: number;
}

interface MediaCardProps {
  item: MediaItem;
  type: MediaType;
  priority?: boolean;
}

export default function MediaCard({ item, type, priority = false }: MediaCardProps) {
  const href = `/${type}/${item.malId}`;
  const img = imgOf(item);
  const { user, token } = useUser();
  
  const [likeCounts, setLikeCounts] = useState<LikeCounts>({ likes: 0, dislikes: 0 });
  const [userInteraction, setUserInteraction] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const displayName = item.title || item.name || `#${item.malId}`;

  useEffect(() => {
    fetchLikeCounts();
    if (user) {
      fetchUserInteraction();
    }
  }, [item.malId, type, user]);

  const fetchLikeCounts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/likes/count/${type}/${item.malId}`
      );
      if (response.ok) {
        const data = await response.json();
        setLikeCounts(data);
      }
    } catch (error) {
      console.error('Error fetching like counts:', error);
    }
  };

  const fetchUserInteraction = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/likes/status/${type}/${item.malId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (response.ok) {
        const data: UserInteraction = await response.json();
        setUserInteraction(data.userInteraction);
      }
    } catch (error) {
      console.error('Error fetching user interaction:', error);
    }
  };

  const handleLike = async (value: number) => {
    if (!user || !token) return;
    
    setLoading(true);
    try {
      const body: any = { value };
      body[`${type.slice(0, -1)}Id`] = item.malId;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        fetchLikeCounts();
        fetchUserInteraction();
      }
    } catch (error) {
      console.error('Error updating like:', error);
    } finally {
      setLoading(false);
    }
  };

  const likeButtonClass = userInteraction === 1 
    ? "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800" 
    : "text-gray-600 bg-gray-100 border-gray-200 hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700";

  const dislikeButtonClass = userInteraction === -1 
    ? "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800" 
    : "text-gray-600 bg-gray-100 border-gray-200 hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700";

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Image container */}
      <div className="relative mb-3 aspect-[5/7] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
        <Image
          src={img}
          alt={displayName}
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
          {displayName}
        </h3>
        
        {typeof item.favorites === "number" && (
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            <span className="text-red-500">❤️</span>
            <span>{formatFavorites(item.favorites)}</span>
          </span>
        )}
      </div>

      {/* Like/Dislike buttons */}
      <div className="mt-3 flex items-center gap-2">
        {/* Like button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLike(1);
          }}
          disabled={loading || !user}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${likeButtonClass}`}
          title={userInteraction === 1 ? "Remove like" : "Like"}
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          <span className="font-semibold">{likeCounts.likes}</span>
        </button>

        {/* Dislike button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLike(-1);
          }}
          disabled={loading || !user}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${dislikeButtonClass}`}
          title={userInteraction === -1 ? "Remove dislike" : "Dislike"}
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
          </svg>
          <span className="font-semibold">{likeCounts.dislikes}</span>
        </button>
      </div>

      {/* Type badge */}
      <div className="mt-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
          {type}
        </span>
      </div>
    </Link>
  );
}
