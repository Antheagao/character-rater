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
  userInteraction: number; // 0 = none, 1 = like, -1 = dislike
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

  // Get the display name - use title if available, fall back to name
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
      body[`${type.slice(0, -1)}Id`] = item.malId; // characterId, animeId, or mangaId

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        // Refresh both counts and user interaction
        fetchLikeCounts();
        fetchUserInteraction();
      }
    } catch (error) {
      console.error('Error updating like:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determine like/dislike button colors based on user interaction
  const likeButtonClass = userInteraction === 1 
    ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" 
    : "text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300";

  const dislikeButtonClass = userInteraction === -1 
    ? "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" 
    : "text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300";

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
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors ${likeButtonClass}`}
          title={user ? "Like" : "Sign in to like"}
        >
          <span>🔼</span>
          <span>{likeCounts.likes}</span>
        </button>

        {/* Dislike button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLike(-1);
          }}
          disabled={loading || !user}
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors ${dislikeButtonClass}`}
          title={user ? "Dislike" : "Sign in to dislike"}
        >
          <span>🔽</span>
          <span>{likeCounts.dislikes}</span>
        </button>
      </div>

      {/* Type badge - subtle but informative */}
      <div className="mt-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
          {type}
        </span>
      </div>

      {/* User interaction indicator */}
      {userInteraction !== 0 && (
        <div className="mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {userInteraction === 1 ? "You liked this" : "You disliked this"}
          </span>
        </div>
      )}
    </Link>
  );
}
