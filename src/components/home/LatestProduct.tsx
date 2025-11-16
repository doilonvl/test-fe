/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Link } from "@/i18n/navigation";
import { useGetLatestProductItemsQuery } from "@/services/api";
import { useLocale, useTranslations } from "next-intl";
import SectionHeading from "./SectionHeading";

export default function LatestProducts({ limit = 8 }: { limit?: number }) {
  const { data, isFetching, isError } = useGetLatestProductItemsQuery(limit);
  const t = useTranslations("home");
  const locale = useLocale();
  const normalizedLocale = locale?.startsWith("en") ? "en" : "vi";
  // Card lớn: gradient 3 tone + overlay glass phủ toàn khối
  const outerCardClass =
    "relative overflow-hidden rounded-2xl p-5 md:p-8 shadow-1.5xl " +
    "bg-[radial-gradient(120%_120%_at_0%_0%,#ff8905_0%,#05acfb_45%,#8fc542_100%)]";

  const GlassOverlay = () => (
    <div className="pointer-events-none absolute inset-0 bg-white/85 supports-[backdrop-filter]:bg-white/70 backdrop-blur-[2px]" />
  );

  // Card item nhỏ
  const itemClass =
    "group rounded-xl bg-white/95 border border-white/60 " +
    "shadow-[0_6px_18px_-10px_rgba(0,0,0,0.35)] " +
    "transition-transform duration-200 will-change-transform " +
    "hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 hover:scale-[1.03]";

  if (isFetching) {
    return (
      <section className={outerCardClass}>
        <GlassOverlay />
        <div className="relative z-10 flex gap-6 items-stretch">
          {/* Cột trái */}
          <div className="shrink-0 w-[220px] sm:w-[260px] md:w-[280px] pr-4 mr-2 border-r border-black/10">
            <SectionHeading
              title={t("latestTitle")}
              description={t("latestLoadingDesc")}
              layout="stack"
              action={
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-white transition"
                >
                  {t("latestCTA")} →
                </Link>
              }
            />
          </div>

          {/* Cột phải */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: limit ?? 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl bg-white/60 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={outerCardClass}>
        <GlassOverlay />
        <div className="relative z-10 flex gap-6 items-stretch">
          <div className="shrink-0 w-[220px] sm:w-[260px] md:w-[280px] pr-4 mr-2 border-r border-black/10">
            <SectionHeading
              title={t("latestTitle")}
              description={t("latestError")}
              layout="stack"
            />
          </div>
        </div>
      </section>
    );
  }

  const items = data ?? [];

  return (
    <section className={outerCardClass}>
      {/* GLASS overlay phủ toàn khối để làm dịu gradient */}
      <GlassOverlay />
      <div className="relative z-10 flex gap-6 items-stretch">
        {/* Cột trái: tiêu đề + nút */}
        <div className="shrink-0 w-[220px] sm:w-[260px] md:w-[280px] pr-4 mr-2 border-r border-black/10">
          <SectionHeading
            title={t("latestTitle")}
            description={t("latestDesc")}
            layout="stack"
            action={
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-white transition"
              >
                {t("latestCTA")} →
              </Link>
            }
          />
        </div>

        {/* Cột phải: grid card nhỏ */}
        <div className="flex-1 min-w-0">
          <div className="group overflow-hidden max-h-[420px] sm:max-h-[520px] lg:max-h-[560px] transition-all duration-300">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pr-1 group-hover:overflow-y-auto group-hover:pr-2">
              {items.map((p) => {
                const titleMap = (p as any)?.title_i18n;
                const taglineMap = (p as any)?.tagline_i18n;
                const descriptionMap = (p as any)?.description_i18n;
                const localizedTitle =
                  (titleMap && titleMap[normalizedLocale]) || p.title;
                const localizedDesc =
                  (taglineMap && taglineMap[normalizedLocale]) ||
                  p.tagline ||
                  (descriptionMap && descriptionMap[normalizedLocale]) ||
                  (p as any).description ||
                  "";
                return (
                  <li key={p._id} className={itemClass}>
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
                      {/* Ảnh THU VÀO + khoảng trống + bo radius kiểu Coursera */}
                      <div className="p-2">
                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden ring-1 ring-black/5 bg-gray-100">
                          <img
                            src={(p as any).thumbnail || "/placeholder.svg"}
                            alt={localizedTitle}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                          />
                        </div>
                      </div>

                      {/* Nội dung */}
                      <div className="px-3 pb-3 pt-1 text-gray-900">
                        <div className="text-sm font-semibold line-clamp-2">
                          {localizedTitle}
                        </div>
                        {/* Mô tả: đúng bề ngang card; quá thì “ … ” */}
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
