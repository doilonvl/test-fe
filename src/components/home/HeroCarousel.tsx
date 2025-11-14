/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type Slide = { src: string };

const DELAY = 4000;

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const plugin = React.useRef(
    Autoplay({
      delay: DELAY,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
    })
  );

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[plugin.current]}
      className="w-full"
    >
      <CarouselContent className="cursor-pointer">
        {slides.map((s, i) => (
          <CarouselItem key={i} className="p-0 cursor-pointer">
            <img
              src={s.src}
              alt={`Slide ${i + 1}`}
              className="h-[62vh] w-full object-cover select-none cursor-pointer"
              draggable={false}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
