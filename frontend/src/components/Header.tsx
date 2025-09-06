"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add a subtle shadow after scrolling a bit
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-sm",
        "dark:bg-neutral-900/70 dark:border-white/10",
        scrolled ? "shadow-sm" : "",
      ].join(" ")}
    >
      {/* Skip link for a11y */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:inset-x-0 focus:top-2 focus:mx-auto focus:w-max rounded bg-black px-3 py-1 text-white dark:bg-white dark:text-black"
      >
        Skip to content
      </a>

      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
            
            <span className="text-xl font-semibold tracking-tight">Anime Rater</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/browse"
              className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/30 dark:hover:bg-white/10 dark:focus:ring-white/30"
            >
              Browse
            </Link>
            <Link
              href="/rankings"
              className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/30 dark:hover:bg-white/10 dark:focus:ring-white/30"
            >
              Rankings
            </Link>
          </nav>

          {/* Auth actions (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/signin"
              className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/30 dark:hover:bg-white/10 dark:focus:ring-white/30"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-black px-3 py-2 text-sm text-white transition hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black/40 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:focus:ring-white/40"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/30 dark:hover:bg-white/10 dark:focus:ring-white/30"
          >
            {/* simple hamburger / close */}
            <span className="sr-only">Open main menu</span>
            <svg
              viewBox="0 0 24 24"
              className={`h-5 w-5 ${open ? "hidden" : "block"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            <svg
              viewBox="0 0 24 24"
              className={`h-5 w-5 ${open ? "block" : "hidden"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Mobile menu panel */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height,opacity] ${
            open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-1 pb-3 pt-2">
            <Link
              href="/browse"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/30 dark:hover:bg-white/10 dark:focus:ring-white/30"
            >
              Browse
            </Link>
            <Link
              href="/rankings"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/30 dark:hover:bg-white/10 dark:focus:ring-white/30"
            >
              Rankings
            </Link>
            <div className="mt-2 flex items-center gap-2">
              <Link
                href="/signin"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/30 dark:hover:bg-white/10 dark:focus:ring-white/30"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-black px-3 py-2 text-sm text-white transition hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black/40 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:focus:ring-white/40"
              >
                Sign up
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
