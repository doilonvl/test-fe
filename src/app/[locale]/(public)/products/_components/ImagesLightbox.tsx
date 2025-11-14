"use client";
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocale } from "next-intl";

export default function ImagesLightbox({
  images,
}: {
  images: { url: string; alt?: string }[];
}) {
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

  const current = images[index];
  const shown = images.slice(0, visibleCount);
  const isEn = String(locale).toLowerCase().startsWith("en");
  const moreLabel = isEn ? "Show more" : "Xem thêm";
  const lessLabel = isEn ? "Show less" : "Thu gọn";
  const remaining = images.length - visibleCount;
  const hasMore = remaining > 0;
  const canCollapse = visibleCount > initialCount;

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
              className="w-full h-40 object-cover md:h-44 lg:h-48"
            />
            {img.alt ? (
              <figcaption className="p-2 text-xs text-muted-foreground">
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
          <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[96vw] max-w-5xl max-h-[90vh]">
            <Dialog.Title className="sr-only">
              {current?.alt || "Image preview"}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              {current?.alt
                ? `Full-size preview of ${current.alt}`
                : "Full-size preview of the selected product image"}
            </Dialog.Description>
            {current ? (
              <div className="rounded-lg overflow-hidden bg-black/5">
                <img
                  src={current.url}
                  alt={current.alt || "Image"}
                  className="max-h-[85vh] w-auto mx-auto object-contain"
                />
                {current.alt ? (
                  <div className="mt-2 text-center text-sm text-white/90">
                    {current.alt}
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
