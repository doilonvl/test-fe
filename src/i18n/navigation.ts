import { createNavigation } from "next-intl/navigation";
import { locales, defaultLocale } from "./request";

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

  // Privacy policy
  "/privacy": { en: "/privacy", vi: "/bao-mat" },

  // Catalogs
  "/catalogs": { en: "/catalogs", vi: "/catalogs" },
  "/catalogs/[slug]": { en: "/catalogs/[slug]", vi: "/catalogs/[slug]" },

  // Optional single form
  "/catalog": { en: "/catalog", vi: "/catalog" },

  // About
  "/about-us": { en: "/about-us", vi: "/gioi-thieu" },

  // Contact
  "/contact-us": { en: "/contact-us", vi: "/lien-he" },
} as const;

export const { Link, useRouter, usePathname, redirect, getPathname } =
  createNavigation({
    locales,
    defaultLocale,
    pathnames,
    localePrefix: "as-needed",
  });
