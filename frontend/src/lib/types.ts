export type MediaType = "characters" | "anime" | "manga";

export type MediaItem = {
  malId: number;
  name: string;
  title?: string;
  favorites?: number;
  imageUrl?: string | null;
  imagesJson?: {
    jpg?: { image_url?: string };
    webp?: { image_url: string };
  };
};
