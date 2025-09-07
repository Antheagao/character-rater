"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { MediaType } from "@/lib/types";

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
      const response = await fetch(apiUrl);
      
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

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (query.trim()) {
      debounceRef.current = setTimeout(() => {
        search(query);
      }, 300);
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
          className="w-full rounded-full border border-border bg-background py-2.5 pl-4 pr-12 text-sm placeholder-muted-foreground shadow-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background hover:border-border/70"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          ) : (
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Search results dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-xl border border-border bg-background/95 shadow-2xl backdrop-blur-sm transition-all duration-200 animate-in fade-in-80">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.malId}`}
              onClick={() => handleSelect(result)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-all duration-150 hover:bg-accent/50 first:rounded-t-xl last:rounded-b-xl"
            >
              {result.imageUrl && (
                <img
                  src={result.imageUrl}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {result.name}
                </div>
                <div className="text-xs capitalize text-muted-foreground">
                  {result.type}
                </div>
              </div>
              <svg className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}