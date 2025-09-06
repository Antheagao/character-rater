import Image from "next/image";
import { formatCompact, resolveImage } from "@/lib/format";

export default function ImageCard({
  data, name,
}: { data: any; name: string }) {
  const img = resolveImage(data);
  const favs = typeof data.favorites === "number" ? formatCompact(data.favorites) : null;

  return (
    <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-xl bg-neutral-900 shadow-md">
      <Image
        src={img}
        alt={name}
        width={240}
        height={336}
        className="h-auto w-full object-cover"
        priority
      />
      {favs && (
        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white backdrop-blur dark:bg-white/20 dark:text-white">
          ❤️ {favs}
        </span>
      )}
    </div>
  );
}
