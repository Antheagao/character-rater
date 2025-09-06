export default function DetailHeader({
  title, subtitle,
}: { title: string; subtitle: string }) {
  return (
    <header className="mb-4">
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
    </header>
  );
}
