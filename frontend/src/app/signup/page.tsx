"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useUser();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await register(email, username, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-neutral-900">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Join Anime Rater today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
