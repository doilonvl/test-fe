"use client";

import Image from "next/image";

type Slide = { src: string };

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const primary = slides[0]?.src ?? "/Logo/hasakelogo.png";

  return (
    <div className="relative h-[72vh] min-h-[520px] w-full overflow-hidden">
      <Image
        src={primary}
        alt="Hasake Play hero"
        fill
        sizes="100vw"
        className="object-cover select-none"
        priority
        draggable={false}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),rgba(0,0,0,0.55))]" />
    </div>
  );
}
