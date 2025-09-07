"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, loading } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-border/50",
        "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        "transition-all duration-300 ease-out",
        scrolled ? "shadow-lg shadow-black/5" : "",
      ].join(" ")}
    >
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:ring-2 focus:ring-primary/50"
      >
        Skip to content
      </a>

      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo subtle hover effect */}
          <Link 
            href="/" 
            className="group flex items-center gap-2" 
            aria-label="Go to homepage"
          >
            <span className="text-xl font-semibold tracking-tight text-foreground transition-transform duration-200 group-hover:scale-105">
              Anime Rater
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1"></nav>

          {/* Auth actions*/}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              // skeleton with shimmer
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-muted via-border/20 to-muted bg-[length:200%_100%] animate-shimmer" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="rounded-lg px-4 py-2 text-sm text-foreground transition-all duration-200 hover:bg-accent/10 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-4 py-2 text-sm text-foreground transition-all duration-200 hover:bg-accent/10 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="rounded-lg px-4 py-2 text-sm text-foreground transition-all duration-200 hover:bg-accent/10 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-2 text-sm text-primary-foreground transition-all duration-300 hover:from-primary/90 hover:to-primary hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-all duration-200 hover:bg-accent/10 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <span className="sr-only">Open main menu</span>
            {/* Animated hamburger icon */}
            <svg viewBox="0 0 24 24" className={`h-5 w-5 transition-transform duration-200 ${open ? "hidden" : "block"}`} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            <svg viewBox="0 0 24 24" className={`h-5 w-5 transition-transform duration-200 ${open ? "block" : "hidden"}`} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
          <nav className="flex flex-col gap-2 pb-4 pt-3">
            <div className="flex flex-col gap-2">
              {loading ? (
                <div className="h-10 rounded-lg bg-gradient-to-r from-muted via-border/20 to-muted bg-[length:200%_100%] animate-shimmer" />
              ) : user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-foreground transition-all duration-200 hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {user.username}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg px-4 py-3 text-left text-foreground transition-all duration-200 hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-foreground transition-all duration-200 hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-3 text-primary-foreground transition-all duration-300 hover:from-primary/90 hover:to-primary hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
