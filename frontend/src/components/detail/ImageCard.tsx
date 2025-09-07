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
  userInteraction: number;
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
      body[`${type.slice(0, -1)}Id`] = data.malId;

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
    ? "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-700" 
    : "text-gray-600 bg-gray-100 border-gray-200 hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700";

  const dislikeButtonClass = userInteraction === -1 
    ? "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-700" 
    : "text-gray-600 bg-gray-100 border-gray-200 hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden w-full max-w-xs mx-auto">
      {/* Smaller image container */}
      <div className="relative aspect-[5/7] w-full overflow-hidden rounded-lg bg-neutral-900">
        <Image
          src={img}
          alt={name}
          fill
          className="object-cover scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      </div>

      <div className="p-4 space-y-3">
        {/* Favorites count*/}
        {favs && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-red-500">❤️</span>
              <span className="font-medium">{favs} favorites</span>
            </div>
            
            {/* User interaction indicator */}
            {userInteraction !== 0 && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                {userInteraction === 1 ? "Liked" : "Disliked"}
              </span>
            )}
          </div>
        )}

        {/* Like/Dislike buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleLike(1);
            }}
            disabled={loading || !user}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 ${likeButtonClass}`}
            title={user ? "Like" : "Sign in to like"}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className="font-semibold">{likeCounts.likes}</span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleLike(-1);
            }}
            disabled={loading || !user}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 ${dislikeButtonClass}`}
            title={user ? "Dislike" : "Sign in to dislike"}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
            </svg>
            <span className="font-semibold">{likeCounts.dislikes}</span>
          </button>
        </div>

        {/* Type indicator */}
        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {type}
        </div>
      </div>
    </div>
  );
}
