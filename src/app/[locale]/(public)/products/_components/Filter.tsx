/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type SVGProps } from "react";

export default function Filters({
  initial,
  total,
  variant = "panel",
}: {
  initial: {
    q?: string;
    sort?: "order" | "-order" | "title" | "-title" | "createdAt" | "-createdAt";
  };
  total: number;
  variant?: "panel" | "inline";
}) {
  const t = useTranslations("products");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initial.q ?? "");
  const [sort, setSort] = useState(initial.sort ?? "order");
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(initial.q));
  const searchInputRef = useRef<HTMLInputElement>(null);

  const updateParam = (patch: Record<string, string | null>) => {
    const usp = new URLSearchParams(searchParams?.toString());
    const before = usp.toString();
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === "") usp.delete(k);
      else usp.set(k, v);
    });
    usp.delete("page");
    const after = usp.toString();
    if (before === after) return;
    router.replace({
      pathname: pathname as unknown as any,
      query: Object.fromEntries(usp.entries()) as unknown as any,
    });
  };

  useEffect(() => {
    const id = setTimeout(() => updateParam({ q: q || null }), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    if (initial.q) {
      setIsSearchOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortOptions: {
    value: typeof sort;
    label: string;
  }[] = [
    // { value: "order", label: t("sort.order") },
    // { value: "-order", label: t("sort.-order") },
    { value: "title", label: t("sort.order") },
    { value: "-title", label: t("sort.-order") },
    { value: "createdAt", label: t("sort.createdAt") },
    { value: "-createdAt", label: t("sort.-createdAt") },
  ];

  const showSearchInput = isSearchOpen || Boolean(q);

  const focusSearchInput = () => {
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const collapseSearchIfEmpty = () => {
    if (!q.trim()) {
      setIsSearchOpen(false);
    }
  };

  if (variant === "inline") {
    return (
      <div className="flex flex-col items-end gap-2 text-right">
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-2 py-1.5 shadow backdrop-blur">
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(true);
                focusSearchInput();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#05acfb] to-[#8fc542] text-white shadow"
              aria-label={t("searchPlaceholder")}
            >
              <SearchIcon className="h-4 w-4" />
            </button>

            <div
              className={`relative flex items-center overflow-hidden transition-all duration-300 ${
                showSearchInput
                  ? "w-48 opacity-100"
                  : "w-0 opacity-0 pointer-events-none"
              }`}
            >
              <input
                ref={searchInputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={collapseSearchIfEmpty}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
              {q ? (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQ("");
                    updateParam({ q: null });
                    focusSearchInput();
                  }}
                  className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                  aria-label={t("clear")}
                >
                  {"\u00d7"}
                </button>
              ) : null}
            </div>
          </div>

          <select
            value={sort}
            onChange={(e) => {
              const v = e.target.value as typeof sort;
              setSort(v);
              updateParam({ sort: v });
            }}
            className="h-10 rounded-full border border-white/70 bg-white/95 px-4 text-sm font-medium text-slate-600 shadow focus:border-[#05acfb] focus:outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setQ("");
              setSort("order");
              setIsSearchOpen(false);
              router.replace(pathname as unknown as any);
            }}
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/70 bg-white/95 px-4 text-sm font-semibold text-slate-600 shadow transition hover:border-[#05acfb] hover:text-slate-900"
          >
            {t("clear")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-xl backdrop-blur-lg">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {t("title")}
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {t("resultCount", { count: total })}
          </p>
        </div>

        <button
          onClick={() => {
            setQ("");
            setSort("order");
            setIsSearchOpen(false);
            router.replace(pathname as unknown as any);
          }}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#05acfb] to-[#8fc542] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
        >
          {t("clear")}
        </button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => {
            const isActive = sort === option.value;
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => {
                  if (isActive) return;
                  setSort(option.value);
                  updateParam({ sort: option.value });
                }}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "border-transparent bg-gradient-to-r from-[#05acfb] to-[#8fc542] text-white shadow"
                    : "border-slate-200 bg-white/80 text-slate-600 hover:border-[#05acfb]/60 hover:text-slate-900"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(true);
              focusSearchInput();
            }}
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-[#05acfb]/50 bg-white/90 text-[#05acfb] shadow transition ${
              showSearchInput ? "pointer-events-none opacity-0" : ""
            }`}
            aria-label={t("searchPlaceholder")}
          >
            <SearchIcon className="h-5 w-5" />
          </button>

          <div
            className={`relative flex items-center overflow-hidden rounded-full border border-[#05acfb]/40 bg-white/95 shadow transition-all duration-300 ${
              showSearchInput
                ? "w-[260px] px-4 py-1.5 opacity-100"
                : "w-0 px-0 py-0 opacity-0 pointer-events-none"
            }`}
          >
            <SearchIcon className="h-4 w-4 text-[#05acfb]" />
            <input
              ref={searchInputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={collapseSearchIfEmpty}
              placeholder={t("searchPlaceholder")}
              className="ml-2 w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
            {q ? (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQ("");
                  updateParam({ q: null });
                  focusSearchInput();
                }}
                className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                aria-label={t("clear")}
              >
                {"\u00d7"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="11" cy="11" r="6" strokeWidth="1.8" />
      <path d="m16 16 4 4" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
