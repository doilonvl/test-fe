"use client";

import { usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

type Props = { total: number; page: number; limit: number };

export default function Pagination({ total, page, limit }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!total || total <= limit) return null;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  const go = (p: number) => {
    const clamped = Math.min(Math.max(1, p), pageCount);
    const usp = new URLSearchParams(searchParams?.toString());
    usp.set("page", String(clamped));
    const url = `${pathname}?${usp.toString()}`;
    window.history.replaceState(null, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const btn =
    "px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-sm transition";
  const active =
    "px-3 py-1.5 rounded-lg border text-sm transition text-white bg-[#05acfb] border-[#05acfb]";

  const pages: (number | "...")[] = (() => {
    const arr: (number | "...")[] = [];
    const windowSize = 7;
    if (pageCount <= windowSize) {
      for (let i = 1; i <= pageCount; i++) arr.push(i);
      return arr;
    }
    const normalized = [...Array(pageCount)].map((_, i) => i + 1).filter((n) => {
      if (n <= 2) return true;
      if (n >= pageCount - 1) return true;
      return Math.abs(n - page) <= 1;
    });
    let last = 0;
    for (const n of normalized) {
      if (n - last > 1) arr.push("...");
      arr.push(n);
      last = n;
    }
    return arr;
  })();

  return (
    <nav className="flex items-center justify-center gap-2 pt-6">
      {page > 1 && (
        <button className={btn} onClick={() => go(page - 1)} aria-label="Prev">
          ‹
        </button>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`gap-${i}`} className="px-1">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={p === page ? active : btn}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}
      {page < pageCount && (
        <button className={btn} onClick={() => go(page + 1)} aria-label="Next">
          ›
        </button>
      )}
    </nav>
  );
}
