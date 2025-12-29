import { getPathname } from "@/i18n/navigation";
import { locales } from "@/i18n/request";

type ProductNode = {
  path?: string;
  updatedAt?: string;
};

type ProductListResponse = {
  items?: ProductNode[];
  total?: number;
  page?: number;
  limit?: number;
};

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  process.env.API_BASE_URL?.replace(/\/$/, "") ||
  process.env.API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

const SITE_BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type PathnameHref = Parameters<typeof getPathname>[0]["href"];

const buildUrl = (pathname: string) => new URL(pathname, SITE_BASE).toString();

const getProductsPathname = (locale: string, segments: string[]) => {
  if (segments.length > 0) {
    return (
      getPathname({
        href: {
          pathname: "/products/[[...segments]]",
          params: { segments },
        },
        locale,
      }) ?? `/products/${segments.join("/")}`
    );
  }
  return getPathname({ href: "/products", locale }) ?? "/products";
};

async function listProducts(params: {
  page?: number;
  limit?: number;
  sort?: "order" | "-order" | "title" | "-title" | "createdAt" | "-createdAt";
  type?: "category" | "group" | "item";
}): Promise<ProductListResponse> {
  const usp = new URLSearchParams();
  if (params.page) usp.set("page", String(params.page));
  if (params.limit) usp.set("limit", String(params.limit));
  if (params.sort) usp.set("sort", params.sort);
  if (params.type) usp.set("type", params.type);
  const res = await fetch(`${BASE}/products?${usp.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [], page: 1, limit: 0, total: 0 };
  return res.json();
}

async function fetchAllProductItems() {
  const items: ProductNode[] = [];
  const limit = 200;
  let page = 1;
  let total = Infinity;

  while (items.length < total) {
    const res = await listProducts({
      page,
      limit,
      type: "item",
      sort: "order",
    });
    const batch = res.items ?? [];
    items.push(...batch);
    total = typeof res.total === "number" ? res.total : items.length;
    if (batch.length < limit) break;
    page += 1;
    if (page > 200) break;
  }

  return items;
}

export async function GET() {
  const now = new Date().toISOString();
  const seen = new Set<string>();
  const urls: { loc: string; lastmod: string }[] = [];

  const staticHrefs: PathnameHref[] = [
    "/",
    "/products",
    "/news",
    "/projects",
    "/about-us",
    "/contact-us",
    "/privacy",
    "/catalogs",
  ];

  for (const locale of locales) {
    for (const href of staticHrefs) {
      const pathname =
        getPathname({ href, locale }) ??
        (typeof href === "string" ? href : href.pathname);
      const url = buildUrl(pathname);
      if (seen.has(url)) continue;
      seen.add(url);
      urls.push({ loc: xmlEscape(url), lastmod: now });
    }
  }

  const productItems = await fetchAllProductItems();
  for (const item of productItems) {
    const rawPath = (item.path || "").trim();
    if (!rawPath) continue;
    const segments = rawPath.split("/").filter(Boolean);
    if (segments.length === 0) continue;
    const lastmod = item.updatedAt
      ? new Date(item.updatedAt).toISOString()
      : now;

    for (const locale of locales) {
      const pathname = getProductsPathname(locale, segments);
      const url = buildUrl(pathname);
      if (seen.has(url)) continue;
      seen.add(url);
      urls.push({ loc: xmlEscape(url), lastmod });
    }
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (entry) =>
          `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>`
      )
      .join("\n") +
    "\n</urlset>\n";

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
