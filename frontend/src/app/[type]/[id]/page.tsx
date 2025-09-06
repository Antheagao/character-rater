import type { Metadata } from "next";
import DetailHeader from "@/components/detail/DetailHeader";
import ImageCard from "@/components/detail/ImageCard";
import QuickFacts from "@/components/detail/QuickFacts";
import AppearanceGrid from "@/components/detail/AppearanceGrid";
import Overview from "@/components/detail/Overview";

type Params = { type: "characters" | "anime" | "manga"; id: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3001";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: `Details • ${params.type} • ${params.id}` };
}

async function fetchDetail(type: Params["type"], id: string) {
  const res = await fetch(`${API_BASE}/${type}/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default async function DetailPage({ params }: { params: Params }) {
  const data = await fetchDetail(params.type, params.id);

  const name: string = data.name ?? data.title ?? `#${data.malId}`;
  const isCharacter = params.type === "characters";
  const animeAppearances: any[] = Array.isArray(data.animeAppearances) ? data.animeAppearances : [];
  const mangaAppearances: any[] = Array.isArray(data.mangaAppearances) ? data.mangaAppearances : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <DetailHeader
        title={name}
        subtitle={`${params.type.toUpperCase()} • MAL #${data.malId}`}
      />

      {/* Modern layout with better spacing */}
      <section className="mt-8 grid gap-8 lg:grid-cols-[280px,1fr] lg:gap-12">
        {/* Sidebar with image and facts */}
        <aside className="space-y-6">
          <ImageCard data={data} name={name} />
          <QuickFacts type={params.type} data={data} />
        </aside>

        {/* Main content area */}
        <article className="space-y-8">
          <Overview text={data.about || data.synopsis} />
          
          {isCharacter && (
            <div className="space-y-6">
              <AppearanceGrid 
                title="Appears in (Anime)" 
                items={animeAppearances} 
                type="anime" 
              />
              <AppearanceGrid 
                title="Appears in (Manga)" 
                items={mangaAppearances} 
                type="manga" 
              />
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
