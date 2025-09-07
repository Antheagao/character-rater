"use client";
import type { MediaType } from "@/lib/types";

export default function TopToolbar({
  value, onChange,
}: { value: MediaType; onChange: (v: MediaType) => void }) {
  const options = [
    { value: "characters", label: "Top Characters" },
    { value: "anime", label: "Top Anime" },
    { value: "manga", label: "Top Manga" }
  ] as const;

  return (
    <div 
      className="inline-flex gap-1 rounded-2xl border border-border/50 bg-background/80 p-1 backdrop-blur-md shadow-sm"
      role="tablist"
      aria-label="Content type selector"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            role="tab"
            aria-selected={isActive}
            className={`
              relative px-3 py-1.5 text-sm rounded-xl transition-all duration-200 ease-out
              focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2
              ${isActive 
                ? "bg-primary text-primary-foreground shadow-md font-medium ring-2 ring-primary/20" 
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30"
              }
            `}
          >
            {option.label}
            
            {/* Persistent active indicator - always visible when active */}
            {isActive && (
              <span className="absolute inset-x-2 -bottom-1 h-0.5 bg-primary/80 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
