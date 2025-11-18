/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { News } from "@/types/content";
import { toCloudinaryUrl } from "@/lib/media/cloudinary";

export default function NewsCard({
  n,
  variant = "large",
  wide,
  compact,
  overlay,
}: {
  n: News;
  variant?: "large" | "small";
  wide?: boolean; // Ưu tiên 16:9 cho thẻ lớn khi cần
  compact?: boolean; // Bớt padding media để canh hàng
  overlay?: React.ReactNode; // Nội dung chèn lên ảnh (absolute)
}) {
  const t = useTranslations("news");
  const locale = useLocale();
  const localeKey = locale?.startsWith("en") ? "en" : "vi";
  const localizedTitle = (n as any)?.title_i18n?.[localeKey] ?? n.title ?? "";
  const localizedExcerpt =
    (n as any)?.excerpt_i18n?.[localeKey] ?? n.excerpt ?? "";
  const href = { pathname: "/news/[slug]", params: { slug: n.slug } } as const;

  // Kích thước ảnh mục tiêu (vừa phải, tránh upscale quá mức)
  const isLarge = variant === "large";
  const useWide = wide || isLarge;
  const targetWidth = useWide ? 860 : 420;
  const targetHeight = useWide
    ? Math.round((targetWidth * 9) / 16)
    : Math.round((targetWidth * 3) / 4);

  // Tối ưu Cloudinary để tránh thumbnail mờ
  const betterCover = (src: string) =>
    toCloudinaryUrl(src, {
      width: targetWidth,
      height: targetHeight,
      quality: "auto:best",
      crop: "fill",
      gravity: "auto",
    });

  // Whitelist nguồn ảnh dạng <Image>
  const canNextImage = (() => {
    try {
      const u = new URL(n.cover || "");
      const host = u.hostname.toLowerCase();
      const ok = u.protocol === "https:";
      const white = new Set([
        "res.cloudinary.com",
        "hasakeplay.com.vn",
        "upload.wikimedia.org",
        "cdn.example.com",
      ]);
      return ok && white.has(host);
    } catch {
      return false;
    }
  })();

  // Meta date (nếu có)
  const dateISO =
    (n as any).publishedAt || (n as any).createdAt || (n as any).updatedAt;
  const dateLabel = dateISO
    ? new Date(dateISO).toLocaleDateString()
    : undefined;

  // Class helpers
  const mediaAspect = useWide ? "aspect-video" : "aspect-[4/3]";
  const mediaPad = compact ? "" : "p-3 md:p-4";

  return (
    <Link
      href={href}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 rounded-2xl transition-transform duration-300"
      aria-label={localizedTitle}
    >
      <article
        itemScope
        itemType="https://schema.org/NewsArticle"
        className={[
          // Khung trung tính, chuyên nghiệp
          "relative isolate overflow-hidden rounded-2xl border border-slate-200/80",
          "bg-gradient-to-b from-white via-white to-slate-50/70",
          "shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition duration-300",
          "group-hover:-translate-y-1 group-hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]",
          "motion-reduce:transform-none motion-reduce:transition-none",
        ].join(" ")}
      >
        {/* Accent màu nếu card sáng trọng hơn */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-500"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-4 h-32 rounded-full bg-gradient-to-b from-sky-200/30 via-transparent to-transparent blur-3xl opacity-0 transition duration-500 group-hover:opacity-100"
        />
        {/* MEDIA */}
        {n.cover ? (
          <div
            className={[mediaPad, "transition-colors duration-300"].join(" ")}
          >
            <div
              className={[
                mediaAspect,
                "relative overflow-hidden rounded-[1.25rem] bg-slate-950/[0.04]",
                "ring-1 ring-slate-900/5 shadow-inner",
              ].join(" ")}
            >
              {/* Overlay tùy chọn: dạng nền đen mờ để giữ text ở tone news */}
              {overlay ? (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/50 via-black/30 to-transparent text-white p-3 sm:p-4">
                  {overlay}
                </div>
              ) : null}

              {canNextImage ? (
                <Image
                  src={betterCover(n.cover!)}
                  alt={n.title}
                  fill
                  sizes={
                    isLarge
                      ? "(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 860px"
                      : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 420px"
                  }
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                  quality={85}
                  priority={isLarge}
                />
              ) : (
                <img
                  src={betterCover(n.cover!)}
                  alt={n.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                  loading={isLarge ? "eager" : "lazy"}
                  decoding="async"
                />
              )}

              {/* Dải mờ để text dễ đọc nếu overlay ở dưới */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/15 to-transparent"
              />
            </div>
          </div>
        ) : null}

        {/* BODY */}
        <div className="px-5 pb-5 pt-3 md:px-6 md:pb-6">
          {/* Eyebrow meta (date) – nhỏ, trung tính */}
          {dateLabel ? (
            <div
              className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500"
              itemProp="datePublished"
            >
              <time dateTime={new Date(dateISO).toISOString()}>
                {dateLabel}
              </time>
              <span
                aria-hidden
                className="h-0.5 w-8 bg-gradient-to-r from-slate-300/80 to-transparent"
              />
            </div>
          ) : null}

          {/* Title */}
          <h3
            className={[
              isLarge ? "text-lg md:text-xl" : "text-base md:text-lg",
              "font-semibold leading-snug text-slate-900 line-clamp-2",
              "group-hover:text-gray-950 transition-colors duration-300",
            ].join(" ")}
            itemProp="headline"
          >
            {localizedTitle}
          </h3>

          {/* Excerpt */}
          {localizedExcerpt ? (
            <p
              className={[
                "mt-3 text-sm text-slate-600/90 line-clamp-3",
                isLarge ? "md:line-clamp-4 md:text-[15px]" : "",
              ].join(" ")}
              itemProp="description"
            >
              {localizedExcerpt}
            </p>
          ) : null}

          <div
            className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent"
            aria-hidden
          />

          {/* Read more – trung tính, ít màu mè */}
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 group-hover:text-gray-900">
            {t("readMore")}
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4 text-slate-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-slate-800"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M13 5l7 7-7 7" />
            </svg>
          </span>

          {/* SEO microdata (nếu cần) */}
          {n.cover ? <meta itemProp="image" content={n.cover} /> : null}
          <meta itemProp="url" content={`/news/${n.slug}`} />
        </div>
      </article>
    </Link>
  );
}
