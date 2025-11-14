/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProductNode } from "@/features/products/types";
import SmartImage from "@/components/shared/SmartImage";
import { motion } from "framer-motion";
import Pagination from "./Pagination";

export default function Grid({
  nodes,
  highlightType = false,
}: {
  nodes: ProductNode[];
  highlightType?: boolean;
}) {
  const locale = useLocale();
  const normalizedLocale = locale?.startsWith("en") ? "en" : "vi";
  if (!nodes?.length) return null;

  const listVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.06, delayChildren: 0.04 },
    },
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  } as const;

  // Force remount of the list when dataset changes to reset animations
  const listKey = nodes.map((n) => n._id).join("|");

  const pageSize = 8; // 4 per row * 2 rows
  return (
    <motion.ul
      key={`${listKey}-page`}
      id="products-grid-top"
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4"
    >
      {nodes.slice(0, pageSize).map((n) => {
        const titleMap = (n as any)?.title_i18n;
        const taglineMap = (n as any)?.tagline_i18n;
        const descriptionMap = (n as any)?.description_i18n;
        const localizedTitle =
          (titleMap && titleMap[normalizedLocale]) || n.title;
        const localizedTagline =
          (taglineMap && taglineMap[normalizedLocale]) ||
          n.tagline ||
          (descriptionMap && descriptionMap[normalizedLocale]) ||
          n.description ||
          "";

        const gallery = Array.isArray(n.images) ? n.images.slice(0, 3) : [];
        const hasVideo =
          typeof (n as any).heroVideo === "string" &&
          (n as any).heroVideo.length > 0;

        return (
          <motion.li
            key={n._id}
            variants={cardVariants}
            className="group relative h-full"
            itemScope
            itemType={
              n.type === "item"
                ? "https://schema.org/Product"
                : "https://schema.org/Collection"
            }
          >
            <Link
              href={{
                pathname: "/products/[[...segments]]",
                params: { segments: n.path.split("/") },
              }}
              aria-label={localizedTitle}
              className="block h-full max-w-[320px] mx-auto rounded-2xl border border-white/60 bg-white/80 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <article className="flex h-full flex-col overflow-hidden rounded-2xl">
                <div className="relative mx-3 mt-3 h-48 overflow-hidden rounded-xl bg-gray-100">
                  {hasVideo ? (
                    <video
                      src={(n as any).heroVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : n.thumbnail ? (
                    <SmartImage
                      src={n.thumbnail}
                      alt={localizedTitle}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full" />
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/70">
                      {n.type}
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold">
                      {localizedTitle}
                    </h3>
                    {localizedTagline ? (
                      <p className="mt-1 text-sm text-white/85">
                        {localizedTagline}
                      </p>
                    ) : null}
                  </div>
                </div>

                {gallery.length > 0 ? (
                  <div className="flex gap-2 bg-white/90 px-4 py-3">
                    {gallery.map((img, idx) => (
                      <div
                        key={`${img.url}-${idx}`}
                        className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/70"
                      >
                        <img
                          src={img.url}
                          alt={img.alt || localizedTitle}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {(descriptionMap && descriptionMap[normalizedLocale]) ||
                      n.description ||
                      "Discover full details and specifications."}
                  </p>
                  <div className="flex items-center justify-between text-sm font-semibold text-primary">
                    <span>View details</span>
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
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </article>
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

function TypePill({ type }: { type: ProductNode["type"] }) {
  const pill =
    type === "item"
      ? { bg: "from-[#8fc542] to-[#66b212]", label: "Item" }
      : type === "group"
      ? { bg: "from-[#05acfb] to-[#0487c5]", label: "Group" }
      : { bg: "from-[#ff8905] to-[#d46e00]", label: "Category" };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] text-white bg-gradient-to-r ${pill.bg} shadow-sm ring-1 ring-white/25`}
      aria-label={pill.label}
    >
      {pill.label}
    </span>
  );
}
