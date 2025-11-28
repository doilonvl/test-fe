/* eslint-disable @typescript-eslint/no-explicit-any */

import { Link } from "@/i18n/navigation";
import SmartImage from "@/components/shared/SmartImage";
import type { ProductNode } from "@/features/products/types";

type Props = {
  nodes: ProductNode[];
  highlightType?: boolean;
};

export default function Grid({ nodes, highlightType = false }: Props) {
  if (!nodes?.length) return null;

  const firstId = nodes[0]?._id;

  return (
    <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
      {nodes.map((n, idx) => {
        const titleMap = (n as any)?.title_i18n;
        const taglineMap = (n as any)?.tagline_i18n;
        const descriptionMap = (n as any)?.description_i18n;
        const localizedTitle =
          (titleMap && titleMap[getLocaleKey()]) || n.title;
        const localizedTagline =
          (taglineMap && taglineMap[getLocaleKey()]) ||
          n.tagline ||
          (descriptionMap && descriptionMap[getLocaleKey()]) ||
          n.description ||
          "";

        const gallery = Array.isArray(n.images) ? n.images.slice(0, 3) : [];
        const hasVideo =
          typeof (n as any).heroVideo === "string" &&
          (n as any).heroVideo.length > 0;

        return (
          <li
            key={n._id}
            className="group relative h-full opacity-0 translate-y-4 animate-[fade-slide-up_0.5s_ease-out_forwards]"
            style={{ animationDelay: `${idx * 0.06}s` }}
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
                params: { segments: n.path.split("/").filter(Boolean) },
              }}
              aria-label={localizedTitle}
              className="block h-full max-w-[320px] mx-auto rounded-2xl border border-white/60 bg-white/80 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <article className="flex h-full flex-col overflow-hidden rounded-2xl">
                <div className="relative mx-3 mt-3 h-48 overflow-hidden rounded-xl bg-gray-100">
                  {hasVideo ? (
                    <video
                      src={(n as any).heroVideo}
                      muted
                      playsInline
                      controls={false}
                      preload="metadata"
                      className="h-full w-full object-cover"
                      aria-label={localizedTitle}
                    />
                  ) : n.thumbnail ? (
                    <SmartImage
                      src={n.thumbnail}
                      alt={localizedTitle}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                      fetchPriority={n._id === firstId ? "high" : "auto"}
                    />
                  ) : (
                    <div className="h-full w-full" />
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/70">
                      {highlightType ? n.type : null}
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
                    {gallery.map((img, gIdx) => (
                      <div
                        key={`${img.url}-${gIdx}`}
                        className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/70"
                      >
                        <SmartImage
                          src={img.url}
                          alt={img.alt || localizedTitle}
                          fill
                          sizes="64px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {(descriptionMap && descriptionMap[getLocaleKey()]) ||
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
          </li>
        );
      })}
    </ul>
  );
}

function getLocaleKey() {
  if (typeof Intl === "undefined") return "vi";
  try {
    const lang =
      typeof navigator !== "undefined"
        ? navigator.language
        : typeof document !== "undefined"
        ? document.documentElement.lang
        : "vi";
    return lang.toLowerCase().startsWith("en") ? "en" : "vi";
  } catch {
    return "vi";
  }
}
