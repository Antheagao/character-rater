// src/components/Header.tsx
"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-md dark:bg-neutral-900/70 dark:border-white/10">
      <div className=" w-full px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-black dark:bg-white" />
            <span className="text-xl font-semibold tracking-tight">Anime Characters</span>
          </Link>

          {/* Actions */}
          <div className="md:flex items-center gap-2">
            <Link
              href="/signin"
              className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-black px-3 py-2 text-sm text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
