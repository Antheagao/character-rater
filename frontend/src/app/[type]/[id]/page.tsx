import type { Metadata } from "next";
import Image from "next/image";

type Params = { type: "characters" | "anime" | "manga"; id: string };

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3001";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: `Details • ${params.type} • ${params.id}` };
}

// number -> 17.2k / 1.5M
function formatCompact(n?: number) {
  if (typeof n !== "number") return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

// pick best image from either shape
function resolveImage(data: any): string {
  return (
    data?.imageUrl ||
    data?.imagesJson?.webp?.image_url ||
    data?.imagesJson?.jpg?.image_url ||
    "/placeholder.png"
  );
}

async function fetchDetail(type: Params["type"], id: string) {
  const res = await fetch(`${API_BASE}/${type}/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default async function DetailPage({ params }: { params: Params }) {
  const data = await fetchDetail(params.type, params.id);

  const name: string = data.name ?? data.title ?? `#${data.malId}`;
  const img = resolveImage(data);
  const favs = formatCompact(data.favorites);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">{name}</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {params.type.toUpperCase()} • MAL #{data.malId}
        </p>
      </header>

      <section className="mt-6 grid gap-8 md:grid-cols-[240px,1fr]">
        {/* Image / key stats */}
        <div className="space-y-4">
          <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-xl bg-neutral-900 shadow-md">
            {/* Fixed, sensible size (keeps 5:7 ratio without towering) */}
            <Image
              src={img}
              alt={name}
              width={240}
              height={336} // ~5:7 ratio
              className="h-auto w-full object-cover"
              priority
            />
            {typeof data.favorites === "number" && (
              <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white backdrop-blur dark:bg-white/20 dark:text-white">
                ❤️ {favs}
              </span>
            )}
          </div>

          {/* Quick facts card */}
          <div className="rounded-xl border border-black/10 bg-white p-4 text-sm shadow-sm dark:border-white/10 dark:bg-neutral-900">
            {params.type === "anime" && (
              <ul className="space-y-1">
                {data.score != null && (
                  <li>
                    <span className="opacity-70">Score:</span> {data.score}
                  </li>
                )}
                {data.episodes != null && (
                  <li>
                    <span className="opacity-70">Episodes:</span> {data.episodes}
                  </li>
                )}
                {data.status && (
                  <li>
                    <span className="opacity-70">Status:</span> {data.status}
                  </li>
                )}
              </ul>
            )}
            {params.type === "manga" && (
              <ul className="space-y-1">
                {data.score != null && (
                  <li>
                    <span className="opacity-70">Score:</span> {data.score}
                  </li>
                )}
                {data.chapters != null && (
                  <li>
                    <span className="opacity-70">Chapters:</span> {data.chapters}
                  </li>
                )}
                {data.status && (
                  <li>
                    <span className="opacity-70">Status:</span> {data.status}
                  </li>
                )}
              </ul>
            )}
            {params.type === "characters" && data.nicknames?.length ? (
              <div>
                <span className="opacity-70">Nicknames:</span> {data.nicknames.join(", ")}
              </div>
            ) : null}
          </div>
        </div>

        {/* Description */}
        <article className="prose prose-sm dark:prose-invert max-w-none">
          <h2>Overview</h2>
          <p>{data.about || data.synopsis || "No description available."}</p>
        </article>
      </section>
    </main>
  );
}
