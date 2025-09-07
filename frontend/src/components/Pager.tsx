"use client";
import { useState } from "react";

interface PagerProps {
  page: number;
  totalPages: number | null;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJump?: (n: number) => void;
  className?: string;
}

export default function Pager({
  page,
  totalPages,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onJump,
  className = "",
}: PagerProps) {
  const [showPageInput, setShowPageInput] = useState(false);
  const [pageInput, setPageInput] = useState("");

  const handlePageJump = () => {
    if (onJump && pageInput) {
      const newPage = parseInt(pageInput);
      if (!isNaN(newPage) && newPage >= 1 && totalPages && newPage <= totalPages) {
        onJump(newPage);
      }
    }
    setShowPageInput(false);
    setPageInput("");
  };

  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className={`
          flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-medium
          border border-border bg-background transition-all duration-200
          hover:bg-accent/50 hover:scale-105 hover:shadow-sm
          focus:outline-none focus:ring-2 focus:ring-primary/40
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        `}
        aria-label="Previous page"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Info with Jump Capability */}
      <div className="flex items-center gap-2">
        {showPageInput ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePageJump()}
              className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder={page.toString()}
              min={1}
              max={totalPages}
              autoFocus
            />
            <span className="text-sm text-muted-foreground">of {totalPages}</span>
            <button
              onClick={handlePageJump}
              className="rounded-lg bg-primary px-2 py-1 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Go
            </button>
          </div>
        ) : (
          <button
            onClick={() => onJump && setShowPageInput(true)}
            className="rounded-xl px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-accent/50 hover:text-foreground transition-colors"
          >
            Page <strong className="text-foreground">{page}</strong> 
            <span className="text-muted-foreground"> of {totalPages}</span>
          </button>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canNext}
        className={`
          flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-medium
          border border-border bg-background transition-all duration-200
          hover:bg-accent/50 hover:scale-105 hover:shadow-sm
          focus:outline-none focus:ring-2 focus:ring-primary/40
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        `}
        aria-label="Next page"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}