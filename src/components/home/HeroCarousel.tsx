"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type Slide = { src: string };

const DELAY = 4000;

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [enableAutoplay, setEnableAutoplay] = React.useState(true);
  const plugin = React.useRef(
    Autoplay({
      delay: DELAY,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
    })
  );

  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) {
      setEnableAutoplay(false);
      plugin.current?.stop();
    }
    const onChange = (e: MediaQueryListEvent) => {
      setEnableAutoplay(!e.matches);
      if (e.matches) plugin.current?.stop();
      else plugin.current?.play();
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={enableAutoplay ? [plugin.current] : []}
      className="w-full"
    >
      <CarouselContent className="cursor-pointer">
        {slides.map((s, i) => (
          <CarouselItem key={i} className="p-0 cursor-pointer">
            <div className="relative h-[62vh] w-full">
              <Image
                src={s.src}
                alt={`Slide ${i + 1}`}
                fill
                sizes="100vw"
                className="object-cover select-none"
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
