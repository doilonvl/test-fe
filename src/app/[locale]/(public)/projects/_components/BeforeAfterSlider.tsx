"use client";

import { useId, useState } from "react";

type ImageInput =
  | { url: string; alt?: string }
  | { src: string; alt?: string };

type Props = {
  before: ImageInput;
  after: ImageInput;
  labels?: {
    before?: string;
    after?: string;
  };
};

const getSrc = (img: ImageInput) => ("url" in img ? img.url : img.src);
const getAlt = (img: ImageInput, fallback: string) =>
  img.alt || fallback || "Before / After image";

export default function BeforeAfterSlider({ before, after, labels }: Props) {
  const [position, setPosition] = useState(50);
  const sliderId = useId();

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="relative h-[320px] w-full overflow-hidden rounded-xl bg-slate-100">
        <img
          src={getSrc(before)}
          alt={getAlt(before, labels?.before || "Before")}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${position}%` }}
          aria-hidden
        >
          <img
            src={getSrc(after)}
            alt={getAlt(after, labels?.after || "After")}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ left: `${position}%` }}
          aria-hidden
        >
          <div className="h-full w-0.5 -translate-x-0.5 bg-white shadow" />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 shadow">
            {position}%
          </div>
        </div>

        <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white">
          {labels?.before || "Before"}
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white">
          {labels?.after || "After"}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label htmlFor={sliderId} className="text-xs font-semibold text-slate-500">
          Drag
        </label>
        <input
          id={sliderId}
          type="range"
          min={10}
          max={90}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="w-full accent-sky-500"
          aria-label="Adjust before and after comparison"
        />
      </div>
    </div>
  );
}
