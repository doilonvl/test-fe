/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image, { ImageProps } from "next/image";
import { toCloudinaryUrl } from "@/lib/media/cloudinary";

const ALLOWED = new Set([
  "res.cloudinary.com",
  "hasakeplay.com.vn",
  "upload.wikimedia.org",
]);

type Props = Omit<ImageProps, "src"> & { src: string };

export default function SmartImage({ src, alt, ...rest }: Props) {
  let host: string | null = null;
  try {
    host = new URL(src).hostname;
  } catch {}

  const isAllowed = !host || ALLOWED.has(host);

  const width =
    typeof (rest as any).width === "number"
      ? (rest as any).width
      : "fill" in rest && (rest as any).fill
      ? 1200
      : 900;
  const height =
    typeof (rest as any).height === "number" ? (rest as any).height : undefined;

  const optimizedSrc =
    host === "res.cloudinary.com"
      ? toCloudinaryUrl(src, {
          width,
          height,
          quality: "auto:best",
          crop: "fill",
          gravity: "auto",
        })
      : src;

  if (!isAllowed && "fill" in rest && (rest as any).fill) {
    return (
      <div className="relative" style={{ width: "100%", height: "100%" }}>
        <img
          src={optimizedSrc}
          alt={alt}
          style={{ objectFit: "cover" }}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return isAllowed ? (
    <Image src={optimizedSrc} alt={alt} {...rest} />
  ) : (
    <img
      src={optimizedSrc}
      alt={alt}
      className={("className" in rest && (rest as any).className) || ""}
    />
  );
}
