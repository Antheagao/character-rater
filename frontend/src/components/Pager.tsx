"use client";

interface PagerProps {
  page: number;
  totalPages: number | null;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJump?: (n: number) => void;
  className?: string; // Add this prop
}

export default function Pager({
  page,
  totalPages,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onJump,
  className = "", // Add with default value
}: PagerProps) {
  return (
    <div className={`mt-6 flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className="rounded-xl px-3 py-2 text-sm border border-black/10 disabled:opacity-40 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
      >
        ← Prev
      </button>

      <span className="text-sm text-neutral-700 dark:text-neutral-300">
        Page <strong>{page}</strong>
        {totalPages ? <> / {totalPages}</> : null}
      </span>

      <button
        onClick={onNext}
        disabled={!canNext}
        className="rounded-xl px-3 py-2 text-sm border border-black/10 disabled:opacity-40 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
      >
        Next →
      </button>
    </div>
  );
}
