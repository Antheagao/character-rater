const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3001";

function qs(params: Record<string, string | number | boolean | undefined>) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) u.set(k, String(v));
  });
  return u.toString();
}

export async function fetchTop(kind: "characters" | "anime" | "manga", limit: number, offset: number) {
  const url = `${API_BASE}/${kind}?${qs({
    sort: "favorites",
    order: "desc",
    limit,
    offset,
  })}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}
