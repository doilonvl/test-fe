import { createNavigation } from "next-intl/navigation";
import { locales } from "./request";

export const pathnames = {
  "/": "/",

  // Products
  "/products": { en: "/products", vi: "/san-pham" },
  "/products/[[...segments]]": {
    en: "/products/[[...segments]]",
    vi: "/san-pham/[[...segments]]",
  },
  "/products/[slug]": { en: "/products/[slug]", vi: "/san-pham/[slug]" },

  // News
  "/news": { en: "/news", vi: "/tin-tuc" },
  "/news/[slug]": { en: "/news/[slug]", vi: "/tin-tuc/[slug]" },

  // Projects
  "/projects": { en: "/projects", vi: "/du-an" },
  "/projects/[slug]": { en: "/projects/[slug]", vi: "/du-an/[slug]" },

  // Catalogs (đang dùng dạng số nhiều trong header)
  "/catalogs": { en: "/catalogs", vi: "/catalogs" },
  "/catalogs/[slug]": { en: "/catalogs/[slug]", vi: "/catalogs/[slug]" },

  // (Tùy chọn) Giữ key cũ nếu bạn còn nơi nào đó dùng /catalog
  "/catalog": { en: "/catalog", vi: "/catalog" },
} as const;

export const { Link, useRouter, usePathname, redirect, getPathname } =
  createNavigation({ locales, pathnames });
