/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Project } from "../_data";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type GalleryProps = {
  data: Project[];
  variant?: "marquee" | "grid";
};

type GalleryItem = {
  id: string;
  project: string;
  slug?: string;
  imageUrl: string;
  imageAlt?: string;
};

type GalleryColumnProps = {
  items: GalleryItem[];
  msPerPixel: number;
  className?: string;
};

const POSSIBLE_DELAYS = ["0s", "0.1s", "0.2s", "0.3s", "0.4s", "0.5s"];

export default function ProjectsGallery({
  data,
  variant = "marquee",
}: GalleryProps) {
  const t = useTranslations("projects");
  const [showAllGrid, setShowAllGrid] = useState(false);
  const images = useMemo<GalleryItem[]>(() => {
    return data
      .map((project) => {
        const firstImage = project.images?.[0];
        if (!firstImage?.url) return null;
        return {
          id: project._id,
          project: project.project,
          slug: project.slug,
          imageUrl: firstImage.url,
          imageAlt: firstImage.alt ?? project.project,
        };
      })
      .filter(Boolean) as GalleryItem[];
  }, [data]);

  useEffect(() => {
    setShowAllGrid(false);
  }, [data, variant]);

  const emptyState = (
    <div className="rounded-2xl border bg-white/60 p-10 text-center text-muted-foreground">
      {t("galleryEmpty")}
    </div>
  );

  if (images.length === 0) return emptyState;

  if (variant === "grid") {
    const maxVisible = 12;
    const visibleImages = showAllGrid ? images : images.slice(0, maxVisible);
    const showToggle = images.length > maxVisible;

    return (
      <div className="space-y-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleImages.map((item, index) => (
            <GalleryCard
              key={item.id}
              item={item}
              index={index}
              variant="grid"
              label={t("card.label")}
              cta={t("card.cta")}
            />
          ))}
        </div>
        {showToggle ? (
          <button
            type="button"
            onClick={() => setShowAllGrid((prev) => !prev)}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {showAllGrid ? t("galleryToggle.less") : t("galleryToggle.more")}
          </button>
        ) : null}
      </div>
    );
  }

  const columns = splitArray(images, 3);
  const columnOne = columns[0] ?? [];
  const columnTwo = columns[1] ?? [];
  const columnThree = columns[2] ?? [];

  return (
    <div className="gallery-marquee relative -mx-4 px-4 sm:mx-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-linear-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-linear-to-t from-white to-transparent" />
      <div className="relative grid h-192 max-h-[150vh] grid-cols-1 items-start gap-6 overflow-hidden md:grid-cols-2 lg:grid-cols-3">
        <GalleryColumn
          items={columnOne}
          msPerPixel={12}
          label={t("card.label")}
          cta={t("card.cta")}
        />
        <GalleryColumn
          items={columnTwo}
          className="hidden md:block"
          msPerPixel={16}
          label={t("card.label")}
          cta={t("card.cta")}
        />
        <GalleryColumn
          items={columnThree}
          className="hidden lg:block"
          msPerPixel={14}
          label={t("card.label")}
          cta={t("card.cta")}
        />
      </div>
    </div>
  );
}

function GalleryColumn({
  items,
  msPerPixel,
  className,
  label,
  cta,
}: GalleryColumnProps & { label: string; cta: string }) {
  const columnRef = useRef<HTMLDivElement | null>(null);
  const [columnHeight, setColumnHeight] = useState(0);

  useEffect(() => {
    const element = columnRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setColumnHeight(entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const duration = `${Math.max(columnHeight * msPerPixel, 12000)}ms`;
  const style = {
    "--marquee-duration": duration,
  } as CSSProperties & { ["--marquee-duration"]?: string };

  const duplicated = items.concat(items);

  return (
    <div
      ref={columnRef}
      className={cx(
        "animate-gallery-marquee space-y-6 py-4",
        className,
        items.length === 0 && "opacity-0"
      )}
      style={style}
    >
      {duplicated.map((item, index) => (
        <GalleryCard
          key={`${item.id}-${index}`}
          item={item}
          index={index}
          label={label}
          cta={cta}
          variant="marquee"
        />
      ))}
    </div>
  );
}

function GalleryCard({
  item,
  index,
  label,
  cta,
  variant,
}: {
  item: GalleryItem;
  index: number;
  label: string;
  cta: string;
  variant: "marquee" | "grid";
}) {
  const href = item.slug
    ? `/projects/${item.slug}`
    : `/projects/${item.id ?? ""}`;

  const animationDelay =
    POSSIBLE_DELAYS[index % POSSIBLE_DELAYS.length] ?? "0s";

  return (
    <Link
      href={href as any}
      className={`group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        variant === "grid" ? "h-full" : ""
      }`}
      style={variant === "marquee" ? { animationDelay } : undefined}
    >
      <article
        className={cx(
          "rounded-4xl bg-white/80 p-4 transition",
          variant === "marquee"
            ? "animate-gallery-fade-in shadow-[0_25px_60px_-35px_rgba(15,23,42,0.7)] hover:-translate-y-1"
            : "h-full border border-white/70 shadow-lg hover:-translate-y-1"
        )}
      >
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gray-100">
          <div className="aspect-3/4 overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.imageAlt}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/70 to-transparent p-5 text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">
              {label}
            </p>
            <h4 className="text-lg font-semibold leading-snug">
              {item.project}
            </h4>
            <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground/90">
              {cta}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function splitArray<T>(array: T[], parts: number) {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i++) {
    const index = i % parts;
    if (!result[index]) {
      result[index] = [];
    }
    result[index].push(array[i]);
  }
  return result;
}

function cx(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}
