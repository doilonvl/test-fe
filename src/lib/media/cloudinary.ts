const CLOUDINARY_HOST = "res.cloudinary.com";

type TransformOptions = {
  width?: number;
  height?: number;
  /** Default fill so cards keep aspect ratio without odd crops */
  crop?: "fill" | "fit" | "limit" | "scale";
  gravity?: string;
  quality?: string;
  format?: string;
  effect?: string;
};

export function toCloudinaryUrl(src: string, opts: TransformOptions = {}) {
  try {
    const url = new URL(src);
    if (url.hostname !== CLOUDINARY_HOST) return src;

    const segments = url.pathname.split("/").filter(Boolean);
    const uploadIdx = segments.indexOf("upload");
    if (uploadIdx === -1) return src;

    const prefix = segments.slice(0, uploadIdx + 1); // includes "upload"
    const rest = segments.slice(uploadIdx + 1);
    const version =
      rest[0] && /^v\d+$/i.test(rest[0]) ? (rest.shift() as string) : undefined;

    const transformation = [
      opts.format ?? "f_auto",
      `q_${opts.quality ?? "auto:best"}`,
      "dpr_auto",
      `c_${opts.crop ?? "fill"}`,
      opts.gravity ? `g_${opts.gravity}` : "g_auto",
      opts.width ? `w_${opts.width}` : null,
      opts.height ? `h_${opts.height}` : null,
      opts.effect ?? "e_improve",
    ]
      .filter(Boolean)
      .join(",");

    const newPath = prefix
      .concat(transformation)
      .concat(version ? [version] : [])
      .concat(rest)
      .join("/");

    url.pathname = `/${newPath}`;
    return url.toString();
  } catch {
    return src;
  }
}
