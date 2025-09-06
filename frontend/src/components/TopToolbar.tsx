"use client";
import type { MediaType } from "@/lib/types";

export default function TopToolbar({
  value, onChange,
}: { value: MediaType; onChange: (v: MediaType) => void }) {
  const btn = "px-3 py-1.5 text-sm rounded-xl transition focus:outline-none focus:ring-2";
  const active = "bg-black text-white dark:bg-white dark:text-black";
  const idle   = "bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15";
  return (
    <div className="inline-flex gap-1 rounded-2xl border border-black/10 p-1 dark:border-white/10">
      {(["characters","anime","manga"] as MediaType[]).map(k => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`${btn} ${value === k ? active : idle}`}
          aria-pressed={value === k}
        >
          {k === "characters" ? "Top Characters" : k === "anime" ? "Top Anime" : "Top Manga"}
        </button>
      ))}
    </div>
  );
}
