import type { Paged, ProductNode } from "@/features/products/types";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  process.env.API_BASE_URL?.replace(/\/$/, "") ||
  process.env.API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

export async function fetchRootCategories(): Promise<Paged<ProductNode>> {
  const res = await fetch(`${BASE}/products/root?type=category&sort=order`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [], total: 0, page: 1, limit: 20 };
  return res.json();
}

export async function fetchNodeWithChildren(
  path: string,
  sort:
    | "order"
    | "-order"
    | "title"
    | "-title"
    | "createdAt"
    | "-createdAt" = "order"
): Promise<{
  node: ProductNode;
  children: ProductNode[];
  breadcrumbs: {
    title: string;
    slug: string;
    title_i18n?: Record<string, string | undefined>;
  }[];
}> {
  const usp = new URLSearchParams({ path, sort });
  const res = await fetch(`${BASE}/products/node?${usp.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Node not found");
  return res.json();
}

export async function searchProducts(
  q: string,
  page = 1,
  limit = 20,
  options?: {
    type?: "category" | "group" | "item";
    sort?: "order" | "-order" | "title" | "-title" | "createdAt" | "-createdAt";
  }
): Promise<Paged<ProductNode>> {
  const usp = new URLSearchParams({
    q,
    page: String(page),
    limit: String(limit),
  });
  if (options?.type) usp.set("type", options.type);
  if (options?.sort) usp.set("sort", options.sort);
  const res = await fetch(`${BASE}/products/search?${usp.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [], total: 0, page, limit };
  return res.json();
}

export async function listProducts(params: {
  page?: number;
  limit?: number;
  sort?: "order" | "-order" | "title" | "-title" | "createdAt" | "-createdAt";
  type?: "category" | "group" | "item";
  q?: string;
}): Promise<{
  items: ProductNode[];
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}> {
  const usp = new URLSearchParams();
  if (params.page) usp.set("page", String(params.page));
  if (params.limit) usp.set("limit", String(params.limit));
  if (params.sort) usp.set("sort", params.sort);
  if (params.type) usp.set("type", params.type);
  if (params.q) usp.set("q", params.q);
  const res = await fetch(`${BASE}/products?${usp.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [], page: 1, limit: 12, total: 0 };
  return res.json();
}
