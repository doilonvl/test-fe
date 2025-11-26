/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";

type ImageItem = { url: string; alt?: string };

type ProjectImagesProps = {
  images: ImageItem[];
  projectName: string;
  projectSlug?: string;
  emptyText?: string;
};

export default function ProjectImages({
  images,
  projectName,
  emptyText = "No images",
}: ProjectImagesProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => (i === null ? null : (i + 1) % images.length));
      }
      if (e.key === "ArrowLeft") {
        setActiveIndex((i) =>
          i === null ? null : (i - 1 + images.length) % images.length
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, images.length]);

  if (!images.length)
    return <p className="text-muted-foreground">{emptyText}</p>;

  const open = (idx: number) => setActiveIndex(idx);
  const close = () => setActiveIndex(null);
  const next = () =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % images.length));
  const prev = () =>
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length
    );

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {images.map((img, i) => (
          <li key={i} className="group relative">
            <div className="rounded-xl bg-gradient-to-br from-[#ff8905]/35 via-[#05acfb]/35 to-[#8fc542]/35 p-[1.2px]">
              <figure className="relative overflow-hidden rounded-xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_28px_-14px_rgba(0,0,0,0.45)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_50px_-15px_rgba(0,0,0,0.5)]">
                <button
                  type="button"
                  onClick={() => open(i)}
                  className="block w-full text-left"
                >
                  <div className="relative h-44 sm:h-48 md:h-52">
                    <img
                      src={img.url}
                      alt={img.alt ?? projectName}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background:
                          "radial-gradient(1200px 180px at 50% 0%, rgba(255,137,5,0.06), rgba(5,172,251,0.06), rgba(143,197,66,0.06) 60%, transparent 80%)",
                      }}
                    />
                    <div className="absolute bottom-2 right-2 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[10px] font-medium text-gray-800 shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
                        Phóng to
                      </span>
                    </div>
                  </div>
                  {img.alt ? (
                    <figcaption className="px-3 py-2 text-lg text-muted-foreground line-clamp-1">
                      {img.alt}
                    </figcaption>
                  ) : null}
                </button>
              </figure>
            </div>
          </li>
        ))}
      </ul>

      {activeIndex !== null && images[activeIndex] ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={close}
        >
          <div
            className="relative max-h-[90vh] max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white hover:bg-black/80"
              aria-label="Đóng"
            >
              ×
            </button>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white hover:bg-black/80"
              aria-label="Ảnh trước"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white hover:bg-black/80"
              aria-label="Ảnh sau"
            >
              ›
            </button>
            <div className="overflow-hidden rounded-2xl bg-black/40">
              <img
                src={images[activeIndex].url}
                alt={images[activeIndex].alt ?? projectName}
                className="mx-auto max-h-[90vh] w-full object-contain"
              />
            </div>
            {images[activeIndex].alt || projectName ? (
              <div className="mt-3 flex items-center justify-between text-sm text-white/80">
                <div className="font-semibold text-white line-clamp-1">
                  {images[activeIndex].alt || projectName}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
