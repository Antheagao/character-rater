"use client";

import Image from "next/image";
import { formatCompact, resolveImage } from "@/lib/format";
import { useUser } from "@/contexts/UserContext";
import { useState, useEffect } from "react";

interface LikeCounts {
  likes: number;
  dislikes: number;
}

interface UserInteraction {
  userInteraction: number; // 0 = none, 1 = like, -1 = dislike
}

export default function ImageCard({
  data,
  name,
  type,
}: {
  data: any;
  name: string;
  type: "characters" | "anime" | "manga";
}) {
  const img = resolveImage(data);
  const favs = typeof data.favorites === "number" ? formatCompact(data.favorites) : null;
  const { user, token } = useUser();
  
  const [likeCounts, setLikeCounts] = useState<LikeCounts>({ likes: 0, dislikes: 0 });
  const [userInteraction, setUserInteraction] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLikeCounts();
    if (user) {
      fetchUserInteraction();
    }
  }, [data.malId, type, user]);

  const fetchLikeCounts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/likes/count/${type}/${data.malId}`
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/likes/status/${type}/${data.malId}`,
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
      body[`${type.slice(0, -1)}Id`] = data.malId; // characterId, animeId, or mangaId

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
    <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-xl bg-neutral-900 shadow-md">
      <Image
        src={img}
        alt={name}
        width={240}
        height={336}
        className="h-auto w-full object-cover"
        priority
      />
      
      {/* Favorites badge */}
      {favs && (
        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white backdrop-blur dark:bg-white/20 dark:text-white">
          ❤️ {favs}
        </span>
      )}

      {/* Like/Dislike buttons */}
      <div className="absolute bottom-2 left-2 right-2 flex gap-2">
        {/* Like button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLike(1);
          }}
          disabled={loading || !user}
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors ${likeButtonClass} backdrop-blur-sm`}
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
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors ${dislikeButtonClass} backdrop-blur-sm`}
          title={user ? "Dislike" : "Sign in to dislike"}
        >
          <span>🔽</span>
          <span>{likeCounts.dislikes}</span>
        </button>
      </div>

      {/* User interaction indicator */}
      {userInteraction !== 0 && (
        <div className="absolute top-2 right-2">
          <span className="rounded-full bg-black/70 px-2 py-1 text-xs text-white backdrop-blur dark:bg-white/20 dark:text-white">
            {userInteraction === 1 ? "👍 Liked" : "👎 Disliked"}
          </span>
        </div>
      )}
    </div>
  );
}
