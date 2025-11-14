/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable prefer-const */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project } from "../_data";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Filters = {
  q: string;
  year: string;
};

export default function ProjectsTable({
  data,
  filters,
}: {
  data: Project[];
  filters: Filters;
}) {
  const router = useRouter();
  const t = useTranslations("projects");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 10 / 20 / 50
  const filtered = useMemo(() => {
    const qn = filters.q.trim().toLowerCase();
    return data.filter((d) => {
      const matchText =
        !qn ||
        d.project.toLowerCase().includes(qn) ||
        d.scope.toLowerCase().includes(qn) ||
        d.client.toLowerCase().includes(qn);
      const matchYear = !filters.year || String(d.year) === filters.year;
      return matchText && matchYear;
    });
  }, [data, filters]);

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  const goDetail = (p: Project) => {
    if (p.slug) {
      router.push({ pathname: "/projects/[slug]", params: { slug: p.slug } });
    } else {
      router.push({ pathname: "/projects/[slug]", params: { slug: p._id } });
    }
  };

  const pageNumbers = useMemo(() => {
    const max = 5;
    const half = Math.floor(max / 2);
    let from = Math.max(1, safePage - half);
    let to = Math.min(totalPages, from + max - 1);
    from = Math.max(1, to - max + 1);
    const arr: number[] = [];
    for (let i = from; i <= to; i++) arr.push(i);
    return arr;
  }, [safePage, totalPages]);

  return (
    <section className="space-y-4">
      <p className="text-sm font-medium text-slate-700">
        {t("resultCount", { count: filtered.length })}
      </p>
      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="text-left px-4 py-2 font-semibold">
                {t("table.project")}
              </th>
              <th className="text-left px-4 py-2 font-semibold">
                {t("table.scope")}
              </th>
              <th className="text-left px-4 py-2 font-semibold">
                {t("table.client")}
              </th>
              <th className="text-left px-4 py-2 font-semibold">
                {t("table.year")}
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((p) => {
              const clickable = !!(p.slug || p._id);
              return (
                <tr
                  key={p._id}
                  className={`border-t transition ${
                    clickable ? "hover:bg-gray-50 cursor-pointer" : "opacity-70"
                  }`}
                  onClick={() => clickable && goDetail(p)}
                  tabIndex={clickable ? 0 : -1}
                  onKeyDown={(e) => {
                    if (clickable && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      goDetail(p);
                    }
                  }}
                >
                  <td className="px-4 py-2">{p.project}</td>
                  <td className="px-4 py-2">{p.scope}</td>
                  <td className="px-4 py-2">{p.client}</td>
                  <td className="px-4 py-2">{p.yearText ?? p.year}</td>
                </tr>
              );
            })}
            {!pageItems.length && (
              <tr>
                <td
                  className="px-4 py-8 text-center text-muted-foreground"
                  colSpan={4}
                >
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {total > 0
            ? t("pagination.showing", {
                start: String(start + 1),
                end: String(Math.min(end, total)),
                total: String(total),
              })
            : t("pagination.noData")}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1 border rounded-md bg-white text-sm"
            aria-label="Rows per page"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} {t("pagination.perPageSuffix")}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              className="px-2 py-1 border rounded-md text-sm disabled:opacity-50"
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              aria-label={t("aria.firstPage")}
            >
              «
            </button>
            <button
              className="px-2 py-1 border rounded-md text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label={t("aria.prevPage")}
            >
              ‹
            </button>

            {pageNumbers[0] > 1 && (
              <span className="px-2 text-sm text-gray-500">…</span>
            )}

            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-2 py-1 border rounded-md text-sm ${
                  n === safePage
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white"
                }`}
                aria-current={n === safePage ? "page" : undefined}
              >
                {n}
              </button>
            ))}

            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <span className="px-2 text-sm text-gray-500">…</span>
            )}

            <button
              className="px-2 py-1 border rounded-md text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label={t("aria.nextPage")}
            >
              ›
            </button>
            <button
              className="px-2 py-1 border rounded-md text-sm disabled:opacity-50"
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              aria-label={t("aria.lastPage")}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
