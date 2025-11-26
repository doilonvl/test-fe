"use client";
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocale } from "next-intl";

type Img = { url: string; alt?: string };

export default function ImagesLightbox({ images }: { images: Img[] }) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState<number>(0);
  const [visibleCount, setVisibleCount] = React.useState(
    Math.min(5, images.length)
  );
  const locale = (useLocale && useLocale()) || "vi";

  if (!images?.length) return null;
  const initialCount = Math.min(5, images.length);

  React.useEffect(() => {
    setVisibleCount(initialCount);
  }, [initialCount, images]);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const showNext = () => setIndex((i) => (i + 1) % images.length);
  const showPrev = () =>
    setIndex((i) => (i - 1 + images.length) % images.length);

  const current = images[index];
  const shown = images.slice(0, visibleCount);
  const isEn = String(locale).toLowerCase().startsWith("en");
  const moreLabel = isEn ? "Show more" : "Xem thêm";
  const lessLabel = isEn ? "Show less" : "Thu gọn";
  const remaining = images.length - visibleCount;
  const hasMore = remaining > 0;
  const canCollapse = visibleCount > initialCount;

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <section className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {shown.map((img, i) => (
          <figure
            key={`${img.url}-${i}`}
            className="rounded-lg overflow-hidden border bg-white cursor-zoom-in"
            title={img.alt || undefined}
            onClick={() => openAt(i)}
          >
            <img
              src={img.url}
              alt={img.alt || "Image"}
              className="w-full h-44 object-cover md:h-48 lg:h-52"
            />
            {img.alt ? (
              <figcaption className="p-2 text-xs text-white bg-slate-900/70">
                {img.alt}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </section>

      {images.length > 5 ? (
        <div className="mt-3">
          {hasMore ? (
            <button
              type="button"
              onClick={() =>
                setVisibleCount((count) => Math.min(count + 20, images.length))
              }
              className="text-sm text-sky-600 hover:underline"
              aria-expanded={true}
            >
              {remaining > 0
                ? `${moreLabel} (+${Math.min(20, remaining)})`
                : moreLabel}
            </button>
          ) : canCollapse ? (
            <button
              type="button"
              onClick={() => setVisibleCount(initialCount)}
              className="text-sm text-sky-600 hover:underline"
              aria-expanded={false}
            >
              {lessLabel}
            </button>
          ) : null}
        </div>
      ) : null}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[80] -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-6xl max-h-[92vh] p-0 outline-none">
            <Dialog.Title className="sr-only">
              {current?.alt || "Image preview"}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              {current?.alt
                ? `Full-size preview of ${current.alt}`
                : "Full-size preview of the selected product image"}
            </Dialog.Description>
            {current ? (
              <div className="relative max-h-[90vh] w-full rounded-2xl overflow-hidden bg-black/40">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white hover:bg-black/80"
                  aria-label="Close"
                >
                  ×
                </button>
                <button
                  type="button"
                  onClick={showPrev}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white hover:bg-black/80"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white hover:bg-black/80"
                  aria-label="Next image"
                >
                  ›
                </button>
                <img
                  src={current.url}
                  alt={current.alt || "Image"}
                  className="mx-auto max-h-[90vh] w-full object-contain"
                />
                {current.alt ? (
                  <div className="absolute left-0 right-0 bottom-3 flex items-center justify-center px-4">
                    <span className="inline-flex items-center justify-center rounded-full bg-black/70 px-4 py-2 text-center text-sm text-white/95">
                      {current.alt}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
