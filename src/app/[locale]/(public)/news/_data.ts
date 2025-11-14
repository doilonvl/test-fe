/* eslint-disable @typescript-eslint/no-explicit-any */
import type { News } from "@/types/content";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  process.env.API_BASE_URL?.replace(/\/$/, "") ||
  process.env.API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

export async function listNews({
  page = 1,
  limit = 9,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<{
  items: News[];
  page: number;
  limit: number;
  total: number;
}> {
  const usp = new URLSearchParams({
    isPublished: "true",
    sort: "-publishedAt",
    page: String(page),
    limit: String(limit),
  });

  let data: any;
  try {
    const res = await fetch(`${BASE}/news?${usp.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { items: [], page, limit, total: 0 };
    }
    data = await res.json();
  } catch {
    return { items: [], page, limit, total: 0 };
  }

  const items: News[] = Array.isArray(data)
    ? data
    : data?.items ?? data?.data ?? [];

  const total =
    data?.pagination?.total ??
    data?.total ??
    (Array.isArray(data) ? data.length : items.length);
  const currentPage = data?.pagination?.page ?? data?.page ?? page;
  const currentLimit = data?.pagination?.limit ?? data?.limit ?? limit;

  return { items, page: currentPage, limit: currentLimit, total };
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  try {
    const res = await fetch(`${BASE}/news/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
