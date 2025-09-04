"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Character = {
  malId: number;
  name: string;
  imagesJson: {
    jpg?: { image_url?: string };
    webp?: { image_url?: string };
  };
};

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    async function loadCharacters() {
      try {
        const res = await fetch("http://localhost:3001/characters");
        const data: Character[] = await res.json();
        setCharacters(data.slice(0, 20));
      } catch (err) {
        console.error("Failed to fetch characters", err);
      }
    }
    loadCharacters();
  }, []);

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test list</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {characters.map((char) => {
          const img =
            char.imagesJson?.webp?.image_url ||
            char.imagesJson?.jpg?.image_url ||
            "/placeholder.png"; // fallback
          return (
            <div
              key={char.malId}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative w-full h-48">
                <Image
                  src={img}
                  alt={char.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {char.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
