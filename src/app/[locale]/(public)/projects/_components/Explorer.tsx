/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState, type SVGProps } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Images, Table2 } from "lucide-react";
import ProjectsGallery from "./Gallery";
import ProjectsTable from "./Table";
import type { Project } from "../_data";
import { useTranslations } from "next-intl";

const API_BASE_FOR_CLIENT =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "/api/v1";

type ExplorerProps = {
  initialProjects: Project[];
  initialGalleryProjects: Project[];
  total?: number;
  pageSize: number;
  initialPage: number;
};

export default function ProjectsExplorer({
  initialProjects,
  initialGalleryProjects,
  total,
  pageSize,
  initialPage,
}: ExplorerProps) {
  const tNav = useTranslations("nav");
  const tProj = useTranslations("projects");
  const initialTotalCount = typeof total === "number" ? total : null;
  const initialExhausted =
    initialProjects.length < pageSize ||
    (typeof total === "number" && initialProjects.length >= total);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [galleryProjects, setGalleryProjects] = useState<Project[]>(
    initialGalleryProjects
  );
  const [page, setPage] = useState(initialPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(
    initialTotalCount
  );
  const [exhausted, setExhausted] = useState(initialExhausted);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    setGalleryProjects(initialGalleryProjects);
  }, [initialGalleryProjects]);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    setTotalCount(
      typeof total === "number"
        ? total
        : initialProjects.length < pageSize
        ? initialProjects.length
        : null
    );
    setExhausted(
      initialProjects.length < pageSize ||
        (typeof total === "number" && initialProjects.length >= total)
    );
  }, [total]);

  const years = useMemo(() => {
    const set = new Set<number>();
    projects.forEach((p) => p.year && set.add(p.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [projects]);

  const [q, setQ] = useState("");
  const [year, setYear] = useState("");
  const normalizedQuery = q.trim().toLowerCase();

  const filteredGalleryProjects = useMemo(
    () =>
      galleryProjects.filter((project) =>
        matchesFilters(project, normalizedQuery, year)
      ),
    [galleryProjects, normalizedQuery, year]
  );

  const filteredProjectsCount = useMemo(
    () =>
      projects.filter((project) =>
        matchesFilters(project, normalizedQuery, year)
      ).length,
    [projects, normalizedQuery, year]
  );

  const hasMore =
    !exhausted && (totalCount === null ? true : projects.length < totalCount);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    setLoadError(null);
    try {
      const usp = new URLSearchParams({
        isPublished: "true",
        sort: "-year,-createdAt",
        limit: String(pageSize),
        page: String(nextPage),
      });
      const res = await fetch(`${API_BASE_FOR_CLIENT}/projects?${usp}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch page ${nextPage}`);
      }
      const json = await res.json();
      const newItems: Project[] = Array.isArray(json)
        ? json
        : json.items ?? json.data ?? [];
      const mergedProjects = mergeProjects(projects, newItems);
      setProjects(mergedProjects);
      const mergedGallery = mergeGalleryProjects(galleryProjects, newItems);
      setGalleryProjects(mergedGallery);
      setPage(nextPage);
      const derivedTotal = extractTotal(json);
      setTotalCount((prev) => {
        if (typeof derivedTotal === "number") return derivedTotal;
        return prev;
      });
      if (
        (typeof derivedTotal === "number" &&
          mergedProjects.length >= derivedTotal) ||
        newItems.length < pageSize ||
        !newItems.length
      ) {
        setExhausted(true);
      }
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Unable to load more projects."
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {tProj("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {tProj("resultCount", { count: filteredProjectsCount })}
            </p>
          </div>
          <ProjectsFiltersInline
            q={q}
            year={year}
            years={years}
            onSearchChange={setQ}
            onYearChange={setYear}
          />
        </div>
      </header>

      <Tabs defaultValue="gallery" className="space-y-1">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="gallery" aria-label="Gallery view">
            <Images className="size-4" aria-hidden />
            <span className="sr-only">Gallery</span>
          </TabsTrigger>
          <TabsTrigger value="table" aria-label="Table view">
            <Table2 className="size-4" aria-hidden />
            <span className="sr-only">Table</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="focus-visible:outline-none">
          <ProjectsGallery data={filteredGalleryProjects} variant="grid" />
        </TabsContent>

        <TabsContent value="table" className="focus-visible:outline-none">
          <ProjectsTable data={projects} filters={{ q, year }} />
        </TabsContent>
      </Tabs>

      {loadError ? (
        <p className="text-center text-sm text-red-500">{loadError}</p>
      ) : null}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={loadMore}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#05acfb] to-[#8fc542] px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-70"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? tProj("loadingMore") : tProj("loadMore")}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function ProjectsFiltersInline({
  q,
  year,
  years,
  onSearchChange,
  onYearChange,
}: {
  q: string;
  year: string;
  years: number[];
  onSearchChange: (value: string) => void;
  onYearChange: (value: string) => void;
}) {
  const t = useTranslations("projects");
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(q));
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showSearchInput = isSearchOpen || Boolean(q);

  const clearAll = () => {
    onSearchChange("");
    onYearChange("");
    setIsSearchOpen(false);
  };

  const focusInput = () =>
    requestAnimationFrame(() => searchInputRef.current?.focus());

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 text-right">
      <div className="flex items-center gap-2 rounded-full border border-[#05acfb]/40 bg-white/95 px-2 py-1.5 shadow">
        <button
          type="button"
          onClick={() => {
            setIsSearchOpen(true);
            focusInput();
          }}
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#05acfb] to-[#8fc542] text-white shadow transition ${
            showSearchInput ? "pointer-events-none opacity-0" : ""
          }`}
          aria-label={t("aria.search")}
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
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => {
              if (!q.trim()) setIsSearchOpen(false);
            }}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            aria-label={t("aria.search")}
          />
          {q ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSearchChange("");
                focusInput();
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
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
        className="h-10 rounded-full border border-white/70 bg-white/95 px-4 text-sm font-medium text-slate-600 shadow focus:border-[#05acfb] focus:outline-none"
        aria-label={t("aria.filterByYear")}
      >
        <option value="">{t("filterAllYears")}</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={clearAll}
        className="inline-flex h-10 items-center justify-center rounded-full border border-white/70 bg-white/95 px-4 text-sm font-semibold text-slate-600 shadow transition hover:border-[#05acfb] hover:text-slate-900"
      >
        {t("clear")}
      </button>
    </div>
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

function matchesFilters(project: Project, query: string, year: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesYear = !year || String(project.year) === year;
  if (!matchesYear) return false;
  if (!normalizedQuery) return true;
  const haystacks = [project.project, project.scope, project.client].filter(
    Boolean
  ) as string[];
  return haystacks.some((entry) =>
    entry.toLowerCase().includes(normalizedQuery)
  );
}

function mergeProjects(existing: Project[], incoming: Project[]): Project[] {
  if (!incoming.length) return existing;
  const map = new Map<string, Project>();
  const keyOf = (p: Project) => p._id || p.slug || `${p.project}-${p.year}`;
  [...existing, ...incoming].forEach((project) => {
    map.set(keyOf(project), project);
  });
  return Array.from(map.values());
}

function mergeGalleryProjects(
  existing: Project[],
  incoming: Project[]
): Project[] {
  if (!incoming.length) return existing;
  const keyOf = (p: Project) => p._id || p.slug || `${p.project}-${p.year}`;
  const map = new Map<string, Project>();
  existing.forEach((project) => {
    if (project.images?.length) {
      map.set(keyOf(project), project);
    }
  });
  incoming.forEach((project) => {
    if (project.images?.length) {
      map.set(keyOf(project), project);
    }
  });
  return Array.from(map.values());
}

function extractTotal(payload: any): number | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const candidates = [
    (payload as any).total,
    (payload as any).count,
    (payload as any).totalCount,
    (payload as any).meta?.total,
    (payload as any).pagination?.total,
  ].filter((value) => typeof value === "number") as number[];
  return candidates.length ? candidates[0] : undefined;
}
