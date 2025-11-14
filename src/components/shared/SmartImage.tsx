"use client";
import Image, { ImageProps } from "next/image";

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
  const optimizedSrc = src.includes("cloudinary.com")
    ? src.replace("/upload/", "/upload/f_auto,q_auto,c_fill,w_900/")
    : src;
  if (!isAllowed && "fill" in rest && rest.fill) {
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
    <Image src={src} alt={alt} {...rest} />
  ) : (
    <img
      src={src}
      alt={alt}
      className={("className" in rest && rest.className) || ""}
    />
  );
}
