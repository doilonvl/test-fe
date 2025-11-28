/* eslint-disable @typescript-eslint/no-explicit-any */
export type Project = {
  _id: string;
  slug?: string;
  project: string;
  scope: string;
  client: string;
  year: number;
  yearText?: string;
  images?: { url: string; alt?: string }[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

type Paged<T> = { items: T[]; total: number; page: number; limit: number };

const BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5001/api/v1"
).replace(/\/$/, "");

type FetchProjectsOptions = {
  page?: number;
  limit?: number;
};

export async function fetchProjects(
  options: FetchProjectsOptions = {}
): Promise<Paged<Project>> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 24;
  const usp = new URLSearchParams({
    isPublished: "true",
    sort: "-year,-createdAt",
    limit: String(limit),
    page: String(page),
  });
  const res = await fetch(`${BASE}/projects?${usp.toString()}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return { items: [], total: 0, page: 1, limit: 0 };
  const json = await res.json();
  if (Array.isArray(json)) {
    return { items: json as Project[], total: json.length, page, limit };
  }
  return json as Paged<Project>;
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  const res = await fetch(`${BASE}/projects/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  const item = Array.isArray(json) ? json[0] : json?.item ?? json?.data ?? json;
  return (item as Project) ?? null;
}

export async function fetchProjectBySlug(
  slug: string
): Promise<Project | null> {
  const pickFromJson = (json: any): Project | null => {
    if (!json) return null;
    if (Array.isArray(json)) {
      // Some backends mistakenly return a list; pick the one matching slug
      const bySlug = json.find((x: any) => x?.slug === slug);
      return (bySlug as Project) ?? (json[0] as Project) ?? null;
    }
    const item = json?.item ?? json?.data ?? json;
    if (Array.isArray(item)) {
      const bySlug = item.find((x: any) => x?.slug === slug);
      return (bySlug as Project) ?? (item[0] as Project) ?? null;
    }
    return (item as Project) ?? null;
  };
  // 1) canonical public endpoint
  try {
    const res = await fetch(
      `${BASE}/projects/by-slug/${encodeURIComponent(slug)}`,
      {
        // Bạn đang server-render → no-store là đúng
        cache: "no-store",
        // (Tuỳ) next: { revalidate: 60 } // nếu muốn still ISR
      }
    );
    if (res.ok) {
      const json = await res.json();
      const item = pickFromJson(json);
      if (item) return item;
    }
    if (res.status !== 404) {
      // Nếu lỗi khác 404, đừng fallback lung tung
      return null;
    }
  } catch {}

  // 2) Optional fallback: query by slug param if API supports it
  try {
    const resQ = await fetch(
      `${BASE}/projects?slug=${encodeURIComponent(slug)}&limit=1`,
      { cache: "no-store" }
    );
    if (resQ.ok) {
      const j = await resQ.json();
      const items: Project[] = Array.isArray(j) ? j : j?.items ?? j?.data ?? [];
      const bySlug = items.find((x) => x?.slug === slug);
      if (bySlug) return bySlug;
      if (items?.[0]) return items[0];
    }
  } catch {}

  // 3) Fallback cuối: thử legacy "id or slug" (BE getOne) – CÓ THỂ trả unpublished
  //   → chỉ dùng nếu bạn chấp nhận hiển thị cả unpublished khi truy cập trực tiếp (tuỳ policy)
  try {
    const res2 = await fetch(`${BASE}/projects/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (res2.ok) {
      const json = await res2.json();
      const item = pickFromJson(json);
      if (item && (item as Project).isPublished) return item as Project;
      return null;
    }
  } catch {}

  return null;
}
