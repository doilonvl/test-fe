import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function apiRoot() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:5001";
  const base = raw.replace(/\/+$/, "");
  return /\/api\/v1$/i.test(base) ? base : `${base}/api/v1`;
}

function getSlug(req: Request, params?: { slug?: string }) {
  if (params?.slug) return params.slug;
  const parts = new URL(req.url).pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ locale: string; slug: string }> }
) {
  const resolvedParams = await ctx.params;
  const slug = getSlug(req, resolvedParams);
  if (!slug) return new NextResponse("Catalog not found", { status: 404 });

  const detailUrl = `${apiRoot()}/catalogs/${encodeURIComponent(slug)}`;
  const r = await fetch(detailUrl, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!r.ok) return new NextResponse("Catalog not found", { status: 404 });
  const data = await r.json();
  const item = data?.item ?? data;
  const src: string | undefined = item?.pdf?.url;
  if (!src) return new NextResponse("Catalog not found", { status: 404 });

  const upstream = await fetch(src, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Upstream error", { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${slug}.pdf"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}
