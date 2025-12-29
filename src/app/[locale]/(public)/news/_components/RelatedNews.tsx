/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import SmartImage from "@/components/shared/SmartImage";
import type { News } from "@/types/content";

type Props = {
  title: string;
  items: News[];
  localeKey: string;
};

export default function RelatedNews({ title, items, localeKey }: Props) {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [progress, setProgress] = useState(0);
  const isCarousel = items.length > 3;

  const cards = useMemo(
    () =>
      items.map((n) => {
        const titleMap = (n as any)?.title_i18n;
        const excerptMap = (n as any)?.excerpt_i18n;
        const localizedTitle =
          (titleMap && titleMap[localeKey]) || n.title || "";
        const localizedExcerpt =
          (excerptMap && excerptMap[localeKey]) || n.excerpt || "";
        return { n, localizedTitle, localizedExcerpt };
      }),
    [items, localeKey]
  );

  useEffect(() => {
    if (!isCarousel) return;
    const track = trackRef.current;
    if (!track) return;

    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      setCanLeft(track.scrollLeft > 8);
      setCanRight(track.scrollLeft < max - 8);
      setProgress(max > 0 ? track.scrollLeft / max : 0);
    };

    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isCarousel, items.length]);

  const scrollByAmount = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const offset = Math.round(track.clientWidth * 0.9);
    track.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  if (!items?.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-1 w-10 rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        {isCarousel ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              disabled={!canLeft}
              aria-label="Previous articles"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              disabled={!canRight}
              aria-label="Next articles"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      {isCarousel ? (
        <>
          <div className="h-1 w-full rounded-full bg-slate-200/70">
            <div
              className="h-full origin-left rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)] transition-transform duration-300"
              style={{ transform: `scaleX(${Math.max(0.08, progress)})` }}
            />
          </div>
          <div className="relative">
            <ul
              ref={trackRef}
              className="flex gap-4 overflow-x-auto pb-2 pr-6 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              aria-label={title}
            >
              {cards.map(({ n, localizedTitle, localizedExcerpt }) => (
                <li key={n._id} className="min-w-[260px] max-w-[300px] snap-start">
                  <Link
                    href={{ pathname: "/news/[slug]", params: { slug: n.slug } }}
                    className="group flex h-full gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {n.cover ? (
                        <SmartImage
                          src={n.cover}
                          alt={localizedTitle}
                          fill
                          sizes="96px"
                          className="object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {localizedTitle}
                      </h3>
                      {localizedExcerpt ? (
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                          {localizedExcerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent"
            />
          </div>
        </>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ n, localizedTitle, localizedExcerpt }) => (
            <li key={n._id} className="h-full">
              <Link
                href={{ pathname: "/news/[slug]", params: { slug: n.slug } }}
                className="group flex h-full gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {n.cover ? (
                    <SmartImage
                      src={n.cover}
                      alt={localizedTitle}
                      fill
                      sizes="96px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                    {localizedTitle}
                  </h3>
                  {localizedExcerpt ? (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {localizedExcerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
