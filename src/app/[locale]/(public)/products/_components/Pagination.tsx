/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

type Props = {
  total: number;
  page: number;
  limit: number; // 10 (5 items/row × 2 rows)
};

export default function Pagination({ total, page, limit }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!total || total <= limit) return null;

  const pageCount = Math.max(1, Math.ceil(total / limit));

  const goPage = (p: number) => {
    const clamped = Math.min(Math.max(1, p), pageCount);
    const usp = new URLSearchParams(searchParams?.toString());
    usp.set("page", String(clamped));
    router.replace({
      pathname: pathname as unknown as any,
      query: Object.fromEntries(usp.entries()) as unknown as any,
    });
    // (tuỳ chọn) cuộn lên đầu danh sách
    if (typeof window !== "undefined") {
      const top = document.getElementById("products-grid-top")?.offsetTop ?? 0;
      window.scrollTo({ top: Math.max(0, top - 16), behavior: "smooth" });
    }
  };

  const getPages = () => {
    const pages: (number | "...")[] = [];
    const windowSize = 7; // tối đa 7 nút số
    if (pageCount <= windowSize) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
      return pages;
    }
    const show = new Set<number>([
      1,
      2,
      page - 1,
      page,
      page + 1,
      pageCount - 1,
      pageCount,
    ]);
    const normalized = [...Array(pageCount)]
      .map((_, i) => i + 1)
      .filter((n) => {
        if (n <= 2) return true;
        if (n >= pageCount - 1) return true;
        return Math.abs(n - page) <= 1;
      });

    let last = 0;
    for (const n of normalized) {
      if (n - last > 1) pages.push("...");
      pages.push(n);
      last = n;
    }
    return pages;
  };

  const pages = getPages();

  const baseBtn =
    "px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-sm transition";
  const activeBtn =
    "px-3 py-1.5 rounded-lg border text-sm transition text-white";
  const activeStyle = {
    backgroundColor: "#05acfb",
    borderColor: "#05acfb" as const,
  };

  return (
    <nav
      className="flex items-center justify-center gap-2 pt-4"
      aria-label="Pagination"
    >
      <button
        onClick={() => goPage(page - 1)}
        className={`${baseBtn} ${page <= 1 ? "hidden" : ""} cursor-pointer`}
        aria-label="Previous"
      >
        ‹
      </button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span
            key={`gap-${idx}`}
            className="px-2 text-muted-foreground select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={(p === page ? activeBtn : baseBtn) + " cursor-pointer"}
            style={p === page ? activeStyle : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goPage(page + 1)}
        className={`${baseBtn} ${
          page >= pageCount ? "hidden" : ""
        } cursor-pointer`}
        aria-label="Next"
      >
        ›
      </button>
    </nav>
  );
}


