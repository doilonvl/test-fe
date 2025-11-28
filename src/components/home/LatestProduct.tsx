/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ProductNode } from "@/types/content";
import SectionHeading from "./SectionHeading";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

async function fetchLatestProducts(
  limit: number,
  locale: string
): Promise<ProductNode[]> {
  try {
    const res = await fetch(
      `${API_BASE}/products?type=item&isPublished=true&limit=${limit}&sort=-createdAt`,
      {
        next: { revalidate: 300 },
        headers: { "Accept-Language": locale },
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    if (Array.isArray(json)) return json as ProductNode[];
    if (Array.isArray(json?.items)) return json.items as ProductNode[];
    if (Array.isArray(json?.data)) return json.data as ProductNode[];
    return [];
  } catch {
    return [];
  }
}

export default async function LatestProducts({
  limit = 8,
}: {
  limit?: number;
}) {
  const locale = await getLocale();
  const t = await getTranslations("home");
  const normalizedLocale = locale?.startsWith("en") ? "en" : "vi";
  const items = await fetchLatestProducts(limit, normalizedLocale);

  const outerCardClass =
    "relative overflow-hidden rounded-2xl p-5 md:p-8 shadow-1.5xl " +
    "bg-[radial-gradient(120%_120%_at_0%_0%,#ff8905_0%,#05acfb_45%,#8fc542_100%)]";

  const itemClass =
    "group rounded-xl bg-white/95 border border-white/60 " +
    "shadow-[0_6px_18px_-10px_rgba(0,0,0,0.35)] " +
    "transition-transform duration-200 will-change-transform " +
    "hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 hover:scale-[1.03]";

  const skeletons = Array.from({ length: limit ?? 8 });

  return (
    <section className={outerCardClass}>
      <div className="pointer-events-none absolute inset-0 bg-white/85 supports-[backdrop-filter]:bg-white/70 backdrop-blur-[2px]" />
      <div className="relative z-10 flex gap-6 items-stretch">
        <div className="shrink-0 w-[220px] sm:w-[260px] md:w-[280px] pr-4 mr-2 border-r border-black/10">
          <SectionHeading
            title={t("latestTitle")}
            description={t(items.length ? "latestDesc" : "latestLoadingDesc")}
            layout="stack"
            action={
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-white transition"
              >
                {t("latestCTA")}
              </Link>
            }
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="max-h-[420px] sm:max-h-[520px] overflow-y-auto pr-1 sm:pr-2 transition-all duration-300 lg:max-h-none lg:overflow-visible lg:pr-0">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {(items.length ? items : skeletons).map((p, idx) => {
                if (!items.length) {
                  return (
                    <li
                      key={`skeleton-${idx}`}
                      className="h-28 rounded-xl bg-white/60 animate-pulse"
                    />
                  );
                }

                const titleMap = (p as any)?.title_i18n;
                const taglineMap = (p as any)?.tagline_i18n;
                const descriptionMap = (p as any)?.description_i18n;
                const localizedTitle =
                  (titleMap && titleMap[normalizedLocale]) || (p as any).title;
                const localizedDesc =
                  (taglineMap && taglineMap[normalizedLocale]) ||
                  (p as any).tagline ||
                  (descriptionMap && descriptionMap[normalizedLocale]) ||
                  (p as any).description ||
                  "";

                return (
                  <li key={(p as any)._id} className={itemClass}>
                    <Link
                      href={{
                        pathname: "/products/[[...segments]]",
                        params: {
                          segments: ((p as any).path || (p as any).slug || "")
                            .split("/")
                            .filter(Boolean),
                        },
                      }}
                      className="block"
                    >
                      <div className="p-2">
                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden ring-1 ring-black/5 bg-gray-100">
                          <Image
                            src={(p as any).thumbnail || "/placeholder.svg"}
                            alt={localizedTitle}
                            fill
                            sizes="(min-width: 1280px) 260px, (min-width: 768px) 30vw, 45vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                            loading="lazy"
                          />
                        </div>
                      </div>

                      <div className="px-3 pb-3 pt-1 text-gray-900">
                        <div className="text-sm font-semibold line-clamp-2">
                          {localizedTitle}
                        </div>
                        {localizedDesc ? (
                          <div className="mt-1 text-xs text-gray-600 truncate">
                            {localizedDesc}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
