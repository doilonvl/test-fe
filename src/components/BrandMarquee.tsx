/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Image from "next/image";
import FadeIn from "./animation/FadeIn";

type Logo = { src: string; alt?: string };

const SPEED_PX_PER_SEC = 250;

const ITEM_WIDTH_PX = 220; // ~ w-[220px]
const ITEM_GAP_PX = 64; // gap-16 = 16 * 4

export default function BrandMarquee({ logos }: { logos: Logo[] }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const measureRef = React.useRef<HTMLDivElement | null>(null);

  const [repeat, setRepeat] = React.useState(2);
  const [durationSec, setDurationSec] = React.useState(20);

  const renderList = React.useMemo(() => {
    const half = Array.from({ length: repeat }, () => logos).flat();
    return [...half, ...half];
  }, [logos, repeat]);

  React.useEffect(() => {
    if (!containerRef.current || !measureRef.current) return;

    const calc = () => {
      const containerW = containerRef.current!.clientWidth;
      const singleSetWidth = logos.length * (ITEM_WIDTH_PX + ITEM_GAP_PX);
      const need = Math.max(1, Math.ceil(containerW / singleSetWidth) + 1);
      setRepeat(need);

      const distancePx = singleSetWidth * need;
      const dur = distancePx / SPEED_PX_PER_SEC;
      setDurationSec(Math.max(6, Math.min(60, dur)));
    };

    const ro = new ResizeObserver(calc);
    ro.observe(containerRef.current);

    calc();

    return () => ro.disconnect();
  }, [logos]);

  return (
    <div
      ref={containerRef}
      className="brand-marquee relative overflow-hidden bg-slate-100 py-0 px-8"
    >
      <div
        className="marquee-track flex w-max items-center gap-16 will-change-transform animate-brand-marquee"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{ ["--marquee-duration" as any]: `${durationSec}s` }}
      >
        {renderList.map((l, i) => (
          <div
            key={i}
            className="group relative flex h-24 w-[220px] items-center justify-center
                       transition-opacity duration-300 opacity-90"
          >
            <Image
              src={l.src}
              alt={l.alt ?? "Brand logo"}
              width={220}
              height={80}
              sizes="220px"
              className="max-h-20 w-auto h-auto object-contain select-none
                         grayscale group-hover:grayscale-0
                         transition-transform duration-300 will-change-transform
                         group-hover:scale-110 cursor-pointer"
              style={{ width: "auto", height: "auto" }}
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Gradient trái/phải */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-slate-100 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-slate-100 to-transparent" />
    </div>
  );
}
