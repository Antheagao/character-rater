"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { MediaType } from "@/lib/types"; // Keep this if the path is correct

interface SearchResult {
  malId: number;
  name: string;
  type: MediaType;
  imageUrl?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout>(null);

  const search = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = `${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery)}`;
      console.log('Fetching from:', apiUrl); // For debugging
      
      const response = await fetch(apiUrl);
      
      // Check if response is OK
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the search to avoid excessive API calls
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (query.trim()) {
      debounceRef.current = setTimeout(() => {
        search(query);
      }, 300); // 300ms debounce
    } else {
      setResults([]);
    }
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    router.push(`/${result.type}/${result.malId}`);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search characters, anime, manga..."
          className="w-full rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          ) : (
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Search results dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.malId}`}
              onClick={() => handleSelect(result)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {result.imageUrl && (
                <img
                  src={result.imageUrl}
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {result.name}
                </div>
                <div className="text-xs capitalize text-gray-500 dark:text-gray-400">
                  {result.type}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
