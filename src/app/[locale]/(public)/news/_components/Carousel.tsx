"use client";

import { useMemo, useState } from "react";
import type { News } from "@/types/content";
import NewsCard from "./NewsCard";

export default function NewsCarousel({
  items,
  perView = 5,
}: {
  items: News[];
  perView?: number;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / perView));
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const pages = useMemo(() => {
    const arr: News[][] = [];
    for (let i = 0; i < items.length; i += perView)
      arr.push(items.slice(i, i + perView));
    return arr;
  }, [items, perView]);

  if (!items?.length) return null;

  return (
    <div className="relative">
      {/* Track */}
      <div className="overflow-hidden rounded-xl border w-full p-5">
        <div
          className="flex transition-transform duration-300 ease-out w-full"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {pages.map((group, gi) => (
            <div key={gi} className="w-full flex-none grid gap-3 grid-cols-5">
              {group.map((n) => (
                <NewsCard key={n._id} n={n} variant="small" />
              ))}
              {group.length < perView &&
                Array.from({ length: perView - group.length }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {canPrev && (
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 shadow hover:bg-white border"
          aria-label="Prev"
        >
          ‹
        </button>
      )}
      {canNext && (
        <button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 shadow hover:bg-white border"
          aria-label="Next"
        >
          ›
        </button>
      )}
    </div>
  );
}
