// Function to adjust number of favorites -> 17.2k / 1.5M
export function formatCompact(n?: number) {
  if (typeof n !== "number") return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

// Function to pick best image from json data
export function resolveImage(data: any): string {
  return (
    data?.imageUrl ||
    data?.imagesJson?.webp?.image_url ||
    data?.imagesJson?.jpg?.image_url ||
    "/placeholder.png"
  );
}
