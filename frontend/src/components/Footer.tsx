export default function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-black/5 bg-white dark:bg-neutral-900 dark:border-white/10"
    >
      <div className="mx-auto max-w-screen-xl px-4 py-6 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          © {new Date().getFullYear()}{" "} Anthony Mendez
        </p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          Built with Next.js · Fastify · TypeScript · Prisma · PostgreSQL
        </p>
      </div>
    </footer>
  );
}
