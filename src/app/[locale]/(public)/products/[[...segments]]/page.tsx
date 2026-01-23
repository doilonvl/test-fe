/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPathname, Link } from "@/i18n/navigation";
import { mergeKeywords } from "@/lib/seo";
import Breadcrumbs from "../_components/Breadcrumbs";
import ImagesLightbox from "../_components/ImagesLightbox";
import Filters from "../_components/Filter";
import Grid from "../_components/Grid";
import Pagination from "../_components/Pagination";
import RelatedProducts from "../_components/RelatedProducts";
import {
  fetchRootCategories,
  fetchNodeWithChildren,
  listProducts,
} from "../_data";

type PageProps = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 60;

const pick = <T,>(v: T | undefined, fb: T) =>
  v === undefined || v === null || v === "" ? fb : v;

const PAGE_SIZE = 50;

const SITE_BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://www.hasakeplay.com.vn"
).replace(/\/$/, "");
const DEFAULT_TITLE = "Products & services";
const DEFAULT_DESCRIPTION =
  "Playground equipment, outdoor fitness equipment, and EPDM rubber flooring solutions.";
const META_IMAGE = "/Logo/hasakelogo.png";

const landingMetasEn: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  "bowling-equipment-supplier": {
    title: "Bowling Alley Equipment Manufacturer and Supplier",
    description:
      "Hasake Play is a reliable and professional manufacturer and supp...uipment, ensuring high-quality products and services in Vietnam.",
    keywords: [
      "bowling systems equipment services",
      "bowling alley equipment manufacturer",
      "bowling alley equipment supplier",
      "bowling systems services",
      "bowling systems manufacturer",
      "bowling systems supplier",
      "bowling equipment supplier",
      "Indoor Bowling Manufacturer",
      "bowling alley equipment installation",
    ],
  },
  "playground-epdm-flooring-manufacturers": {
    title: "EPDM Rubber Tiles Manufacturer & Exporter in Vietnam",
    description:
      "Hasake Play EPDM rubber tiles are a type of flooring material co...rts facilities, gyms, and outdoor. Easy to install and maintain.",
    keywords: [
      "EPDM rubber flooring manufacturers",
      "EPDM rubber flooring supplier",
      "EPDM rubber gym flooring mat",
      "EPDM Gym Flooring Recycled Rubber Mat",
      "EPDM Rubber Roll Gym Flooring Mat",
      "EPDM Kids Playground Flooring",
      "EPDM Rubber Sheet Manufacturer",
      "EPDM Rubber Sheet Supplier",
      "EPDM Playground Rubber Flooring",
      "Playground EPDM Rubber Flooring",
      "Recycled Rubber Flooring Manufacturer",
      "EPDM rubber tiles",
      "epdm rubber tile exporter",
      "epdm rubber tiles manufacturer",
      "gym epdm tiles",
      "Epdm Sports Flooring",
      "Kids Play Area Flooring",
    ],
  },
  "outdoor-fitness-equipment-supplier": {
    title:
      "Outdoor Fitness Equipment | Outdoor Gym Equipment Manufacturer Vietnam",
    description:
      "Get Play Outdoor fitness equipment manufacturer and supplier in ...pment suppliers and exporters offer superior quality in Vietnam.",
    keywords: [
      "Outdoor Gym Equipment Manufacturer",
      "outdoor fitness playground equipment",
      "Outdoor School Fitness Playground Equipment",
      "Open Park Exercise Equipment",
      "open gym equipment",
      "park exercise equipment",
      "park fitness equipment",
      "Outdoor Fitness Equipment Suppliers",
    ],
  },
};

const landingMetasVi: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  "bowling-equipment-supplier": {
    title: "Nhà sản xuất & cung cấp thiết bị bowling",
    description:
      "Hasake Play thiết kế, cung ứng và lắp đặt hệ thống bowling trọn gói tại Việt Nam, đáp ứng tiêu chuẩn an toàn và vận hành ổn định.",
    keywords: [
      "thiết bị bowling",
      "nhà sản xuất thiết bị bowling",
      "nhà cung cấp thiết bị bowling",
      "bowling alley equipment",
      "hệ thống bowling",
      "lắp đặt bowling",
    ],
  },
  "playground-epdm-flooring-manufacturers": {
    title: "Nhà sản xuất sàn cao su EPDM tại Việt Nam",
    description:
      "Sàn cao su EPDM cho sân chơi, sân thể thao và khu gym, độ bền cao, chống trơn trượt, thoát nước tốt.",
    keywords: [
      "sàn cao su EPDM",
      "sàn cao su EPDM ngoài trời",
      "sàn EPDM sân chơi",
      "EPDM rubber flooring",
      "EPDM playground flooring",
    ],
  },
  "outdoor-fitness-equipment-supplier": {
    title: "Nhà sản xuất máy tập công viên & thiết bị thể dục ngoài trời",
    description:
      "Giải pháp máy tập công viên, thiết bị thể dục ngoài trời bền bỉ cho khu dân cư, công viên và trường học.",
    keywords: [
      "máy tập công viên",
      "thiết bị thể dục ngoài trời",
      "outdoor fitness equipment",
      "outdoor gym equipment",
    ],
  },
};

type LandingCopy = {
  heading: string;
  intro: string;
  support?: string;
  imageAlt?: string;
};

const landingCopyEn: Record<string, LandingCopy> = {
  "bowling-equipment-supplier": {
    heading: "Bowling Alley Equipment Manufacturer and Supplier",
    intro:
      "As a bowling alley equipment manufacturer and bowling equipment supplier in Vietnam, Hasake Play delivers custom lanes, scoring systems, and lighting that elevate every venue.",
    support:
      "Our bowling equipment supplier team provides design, installation, and maintenance so your bowling systems stay reliable for families and players.",
    imageAlt: "Bowling alley equipment supplier in Vietnam",
  },
  "playground-epdm-flooring-manufacturers": {
    heading: "EPDM Rubber Tiles Manufacturer & Exporter in Vietnam",
    intro:
      "We are EPDM rubber flooring manufacturers delivering EPDM playground rubber flooring and gym tiles engineered for impact absorption and drainage.",
    support:
      "This EPDM rubber tiles manufacturer supplies durable, easy-to-clean surfacing for parks, sports areas, and schools across Vietnam.",
    imageAlt: "EPDM rubber flooring manufacturers in Vietnam",
  },
  "outdoor-fitness-equipment-supplier": {
    heading:
      "Outdoor Fitness Equipment | Outdoor Gym Equipment Manufacturer Vietnam",
    intro:
      "Hasake Play is an outdoor fitness equipment supplier and outdoor gym equipment manufacturer in Vietnam, building durable park exercise equipment for communities.",
    support:
      "We design and install outdoor fitness playground equipment, open park exercise equipment, and school fitness stations to encourage daily movement.",
    imageAlt: "Outdoor fitness equipment supplier in Vietnam",
  },
};

const landingCopyVi: Record<string, LandingCopy> = {
  "bowling-equipment-supplier": {
    heading: "Nhà sản xuất & cung cấp thiết bị bowling",
    intro:
      "Hasake Play cung cấp giải pháp bowling trọn gói từ tư vấn layout, thiết kế đến cung ứng và lắp đặt hệ thống tại Việt Nam.",
    support:
      "Đội ngũ chuyên gia đồng hành từ vận hành thử, đào tạo kỹ thuật đến bảo trì định kỳ.",
    imageAlt: "Thiết bị bowling và hệ thống bowling tại Việt Nam",
  },
  "playground-epdm-flooring-manufacturers": {
    heading: "Nhà sản xuất sàn cao su EPDM tại Việt Nam",
    intro:
      "Sàn cao su EPDM chuyên dụng cho sân chơi và sân thể thao giúp hấp thụ va đập, chống trơn trượt và dễ bảo trì.",
    support:
      "Giải pháp thi công tối ưu độ bền, thoát nước nhanh, phù hợp công viên và trường học.",
    imageAlt: "Sàn cao su EPDM cho sân chơi ngoài trời",
  },
  "outdoor-fitness-equipment-supplier": {
    heading: "Nhà sản xuất máy tập công viên & thiết bị thể dục ngoài trời",
    intro:
      "Giải pháp máy tập công viên và thiết bị thể dục ngoài trời bền bỉ cho khu dân cư, công viên, trường học.",
    support:
      "Hỗ trợ thiết kế, lắp đặt và bảo trì để đảm bảo an toàn và hiệu quả khai thác.",
    imageAlt: "Máy tập công viên và thiết bị thể dục ngoài trời",
  },
};

const enhanceImages = (images: any[], alt?: string) =>
  images.map((img, idx) => ({
    ...img,
    alt:
      img.alt ||
      (alt ? `${alt}${images.length > 1 ? ` ${idx + 1}` : ""}` : undefined),
  }));

const getProductsPathname = (locale: string, segments: string[]) => {
  if (segments.length > 0) {
    const basePath = getPathname({ href: "/products", locale }) ?? "/products";
    return `${basePath}/${segments.join("/")}`;
  }
  return getPathname({ href: "/products", locale }) ?? "/products";
};

const buildAbsoluteUrl = (pathname: string) =>
  new URL(pathname, SITE_BASE).toString();

const buildAlternates = (segments: string[], locale: string) => ({
  canonical: buildAbsoluteUrl(getProductsPathname(locale, segments)),
  languages: {
    en: buildAbsoluteUrl(getProductsPathname("en", segments)),
    vi: buildAbsoluteUrl(getProductsPathname("vi", segments)),
  },
});

const buildMetadata = ({
  title,
  description,
  segments,
  locale,
  keywords,
  fallbackTitle,
  fallbackDescription,
}: {
  title?: string;
  description?: string;
  segments: string[];
  locale: string;
  keywords?: string[];
  fallbackTitle: string;
  fallbackDescription: string;
}): Metadata => {
  const metaTitle = title || fallbackTitle || DEFAULT_TITLE;
  const metaDescription =
    description || fallbackDescription || DEFAULT_DESCRIPTION;
  const alternates = buildAlternates(segments, locale);
  const canonical = alternates.canonical as string;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    alternates,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonical,
      siteName: "Hasake Play",
      images: [{ url: META_IMAGE, width: 512, height: 512 }],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [META_IMAGE],
    },
  };
};

const toAbsoluteUrl = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://")
    ? url
    : new URL(url, SITE_BASE).toString();

const buildBreadcrumbJsonLd = ({
  locale,
  homeLabel,
  productsLabel,
  ancestors,
  currentTitle,
  currentSegments,
}: {
  locale: string;
  homeLabel: string;
  productsLabel: string;
  ancestors: { title: string; slug: string }[];
  currentTitle: string;
  currentSegments: string[];
}) => {
  const items: { name: string; item: string }[] = [];
  const homePath = getPathname({ href: "/", locale }) ?? "/";
  items.push({ name: homeLabel, item: buildAbsoluteUrl(homePath) });

  const productsPath = getProductsPathname(locale, []);
  items.push({ name: productsLabel, item: buildAbsoluteUrl(productsPath) });

  const segments: string[] = [];
  ancestors.forEach((crumb) => {
    segments.push(crumb.slug);
    const path = getProductsPathname(locale, segments);
    items.push({ name: crumb.title, item: buildAbsoluteUrl(path) });
  });

  const currentPath = getProductsPathname(locale, currentSegments);
  if (currentTitle) {
    items.push({ name: currentTitle, item: buildAbsoluteUrl(currentPath) });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
};

const buildParentPath = (
  crumbs: { slug: string }[] | undefined,
  nodeSlug: string,
) => {
  if (!crumbs?.length) return "";
  const slugs = crumbs.map((c) => c.slug).filter(Boolean);
  if (slugs[slugs.length - 1] === nodeSlug) slugs.pop();
  return slugs.join("/");
};

const fetchRelatedNodes = async ({
  node,
  breadcrumbs,
  sort,
}: {
  node: { type: "category" | "group" | "item"; slug: string; _id?: string };
  breadcrumbs:
    | { title: string; slug: string; title_i18n?: Record<string, string> }[]
    | undefined;
  sort: "order" | "-order" | "title" | "-title" | "createdAt" | "-createdAt";
}) => {
  const parentPath = buildParentPath(breadcrumbs, node.slug);
  if (node.type === "category" && !parentPath) {
    const roots = await fetchRootCategories();
    return roots.items ?? [];
  }
  if (!parentPath) return [];
  try {
    const parent = await fetchNodeWithChildren(parentPath, sort);
    const siblings = Array.isArray(parent?.children) ? parent.children : [];
    return siblings.filter((child) => child.type === node.type);
  } catch {
    return [];
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}): Promise<Metadata> {
  const { segments = [] } = await params;
  const localeKey = normalizeLocale(await getLocale());
  const seo = await getTranslations("seo");
  const defaults = {
    title: seo("pages.products.title"),
    description: seo("pages.products.description"),
  };
  const industryKeywords = seo.raw("keywords.industry") as string[];
  const currentPath = segments.join("/");
  const landing = (localeKey === "en" ? landingMetasEn : landingMetasVi)[
    currentPath
  ];
  if (landing) {
    return buildMetadata({
      title: landing.title,
      description: landing.description,
      segments,
      locale: localeKey,
      keywords: mergeKeywords(industryKeywords, landing.keywords),
      fallbackTitle: defaults.title,
      fallbackDescription: defaults.description,
    });
  }

  // Fallback: generate meta from node data so dynamic slugs (e.g. nested) get specific titles
  try {
    const data = await fetchNodeWithChildren(currentPath, "order");
    if (!data || !data.node) throw new Error("Missing node");
    const crumbs = localizeBreadcrumbs(data.breadcrumbs as any, localeKey);
    const nodeTitle = resolveNodeTitle(data.node, crumbs, localeKey);
    const nodeDescription = pickLocalizedField(
      data.node,
      localeKey,
      "description",
    );
    const crumbTitles = crumbs.map((c) => c.title).filter(Boolean);
    const chainTitles = [...crumbTitles, nodeTitle].filter(Boolean);
    const titleText =
      chainTitles.length > 1 ? chainTitles.join(" | ") : nodeTitle;
    return buildMetadata({
      title: titleText || defaults.title,
      description: nodeDescription || defaults.description,
      segments,
      locale: localeKey,
      keywords: mergeKeywords(industryKeywords),
      fallbackTitle: defaults.title,
      fallbackDescription: defaults.description,
    });
  } catch {
    return buildMetadata({
      title: defaults.title,
      description: defaults.description,
      segments,
      locale: localeKey,
      keywords: mergeKeywords(industryKeywords),
      fallbackTitle: defaults.title,
      fallbackDescription: defaults.description,
    });
  }
}
const normalizeLocale = (value: string | undefined) =>
  value && value.toLowerCase().startsWith("en") ? "en" : "vi";

const pickLocalizedField = (
  entity: any,
  localeKey: string,
  field: "tagline" | "description" | "title",
) => {
  if (!entity) return "";
  const map = entity?.[`${field}_i18n`];
  if (map && typeof map === "object" && map !== null) {
    const localized = (map as Record<string, string | undefined>)[localeKey];
    if (localized) return localized;
  }
  return entity?.[field] || "";
};

const localizeBreadcrumbs = (
  crumbs:
    | {
        title: string;
        slug: string;
        title_i18n?: Record<string, string | undefined>;
      }[]
    | undefined,
  localeKey: string,
) =>
  (crumbs || [])
    .slice(0, Math.max((crumbs || []).length - 1, 0)) // drop current node to avoid duplication
    .map((crumb) => ({
      ...crumb,
      title:
        pickLocalizedField(crumb, localeKey, "title")?.trim() || crumb.title,
    }))
    .filter((crumb, idx, arr) => {
      const prev = arr[idx - 1];
      if (!prev) return true;
      return (
        (prev.title || "").trim().toLowerCase() !==
        (crumb.title || "").trim().toLowerCase()
      );
    });

const resolveNodeTitle = (
  node: any,
  crumbs: ReturnType<typeof localizeBreadcrumbs>,
  localeKey: string,
) => {
  const localized = pickLocalizedField(node, localeKey, "title");
  if (localized) return localized;
  const tail = crumbs[crumbs.length - 1];
  if (tail?.slug === node.slug && tail.title) return tail.title;
  return node.title || "";
};

const extractProjectRefs = (node: any) => {
  const raw =
    node?.usedProjects ??
    node?.projectsUsed ??
    node?.projects ??
    node?.projectReferences ??
    node?.projectRefs;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") return { label: item };
      if (typeof item === "object") {
        const label =
          item.title ||
          item.name ||
          item.project ||
          item.label ||
          item.slug ||
          "";
        if (!label) return null;
        const slug = item.slug || item.projectSlug;
        return { label, slug };
      }
      return null;
    })
    .filter(Boolean) as { label: string; slug?: string }[];
};

export default async function ProductsPage({
  params,
  searchParams,
}: PageProps) {
  const t = await getTranslations("products");
  const nav = await getTranslations("nav");
  const localeKey = normalizeLocale(await getLocale());
  const seo = await getTranslations("seo");
  const defaults = {
    title: seo("pages.products.title"),
    description: seo("pages.products.description"),
  };
  const industryKeywords = seo.raw("keywords.industry") as string[];
  const { segments = [] } = await params;
  const qs = await searchParams;

  const renderEmptyState = () => (
    <section className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
      <p className="text-base font-semibold text-slate-900">
        {t("empty.title")}
      </p>
      <p className="mt-2 text-sm text-slate-600">{t("empty.desc")}</p>
    </section>
  );

  const q = typeof qs.q === "string" ? qs.q : "";
  const sort = (typeof qs.sort === "string" ? qs.sort : "order") as
    | "order"
    | "-order"
    | "title"
    | "-title"
    | "createdAt"
    | "-createdAt";
  const page = Number(pick(qs.page as string | undefined, "1"));
  const currentPath = segments.join("/");
  const landing = (localeKey === "en" ? landingCopyEn : landingCopyVi)[
    currentPath
  ];
  const renderLandingIntro = () =>
    landing ? (
      <section className="prose max-w-none">
        <p className="text-gray-700">{landing.intro}</p>
        {landing.support ? (
          <p className="text-gray-700">{landing.support}</p>
        ) : null}
      </section>
    ) : null;

  // 1) SEARCH: váº«n nhÆ° hiá»‡n táº¡i (chá»‰ type=category)
  if (q.trim()) {
    const result = await listProducts({
      q,
      page,
      limit: PAGE_SIZE,
      sort,
      type: "category",
    });

    return (
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <header className="space-y-4">
          <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{t("title")}</h1>
              <p className="text-sm text-muted-foreground">
                {t("resultCount", { count: result.total })}
              </p>
            </div>
            <Filters
              variant="inline"
              initial={{ q, sort }}
              total={result.total}
            />
          </div>
        </header>

        <Grid
          nodes={result.items}
          highlightType
          localeKey={localeKey}
          viewDetailsLabel={t("viewDetails")}
          fallbackDescription={t("subtitle")}
        />
        {result.items.length === 0 ? renderEmptyState() : null}
        <Pagination
          total={result.total}
          page={result.page}
          limit={result.limit ?? PAGE_SIZE}
        />
      </main>
    );
  }

  if (currentPath) {
    try {
      const data = await fetchNodeWithChildren(currentPath, sort);
      if (!data || !data.node) {
        return (
          <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
            <header className="space-y-3">
              <Breadcrumbs
                labels={{ home: nav("home"), products: nav("products") }}
                isRootProducts
              />
              <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />
              <h1 className="text-2xl font-bold">{defaults.title}</h1>
            </header>
            {renderEmptyState()}
          </main>
        );
      }
      if (data.node.type === "item") {
        const node = data.node as any;
        const crumbs = localizeBreadcrumbs(data.breadcrumbs as any, localeKey);
        const nodeTitle = resolveNodeTitle(node, crumbs, localeKey);
        const pageHeading = nodeTitle || landing?.heading || t("title");
        const nodeDescription = pickLocalizedField(
          node,
          localeKey,
          "description",
        );
        const usedProjects = extractProjectRefs(node);
        const relatedNodes = await fetchRelatedNodes({
          node,
          breadcrumbs: data.breadcrumbs as any,
          sort,
        });
        const related = relatedNodes.filter((n) => n._id !== node._id);
        const imageUrls = Array.isArray(node.images)
          ? node.images
              .map((img: { url?: string }) => img?.url)
              .filter((url: string | undefined): url is string => Boolean(url))
          : [];
        if (imageUrls.length === 0 && node.thumbnail) {
          imageUrls.push(node.thumbnail);
        }
        const productUrl = buildAbsoluteUrl(
          getProductsPathname(localeKey, segments),
        );
        const productJsonLd = {
          "@context": "https://schema.org",
          "@type": "Product",
          name: pageHeading,
          description: nodeDescription || undefined,
          image: imageUrls.map((url: string) => toAbsoluteUrl(url)),
          url: productUrl,
          brand: {
            "@type": "Brand",
            name: "Hasake Play",
          },
        };
        const breadcrumbJsonLd = buildBreadcrumbJsonLd({
          locale: localeKey,
          homeLabel: nav("home"),
          productsLabel: nav("products"),
          ancestors: crumbs,
          currentTitle: nodeTitle || pageHeading,
          currentSegments: segments,
        });
        return (
          <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(productJsonLd),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(breadcrumbJsonLd),
              }}
            />
            <header className="space-y-3">
              <Breadcrumbs
                nodeTitle={nodeTitle}
                ancestors={crumbs}
                labels={{ home: nav("home"), products: nav("products") }}
              />
              <div className="h-1 w-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)] rounded-full" />
              <h1 className="text-2xl font-bold">{pageHeading}</h1>
              {/* <p className="text-muted-foreground">{t("subtitle")}</p> */}
            </header>

            {renderLandingIntro()}

            {nodeDescription ? (
              <section className="prose max-w-none">
                <p className="text-gray-700">{nodeDescription}</p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {t("usedProjectsEyebrow")}
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t("usedProjectsTitle")}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {t("usedProjectsDesc")}
                  </p>
                </div>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-[#05acfb]"
                >
                  {t("usedProjectsCta")}
                  <span aria-hidden>→</span>
                </Link>
              </div>

              {usedProjects.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {usedProjects.map((project, idx) =>
                    project.slug ? (
                      <Link
                        key={`${project.slug}-${idx}`}
                        href={{
                          pathname: "/projects/[slug]",
                          params: { slug: project.slug },
                        }}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-[#05acfb] hover:text-[#05acfb]"
                      >
                        {project.label}
                      </Link>
                    ) : (
                      <span
                        key={`${project.label}-${idx}`}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {project.label}
                      </span>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  {t("usedProjectsEmpty")}
                </p>
              )}
            </section>

            {(() => {
              const imgs = Array.isArray(node.images) ? node.images : [];
              const landingAlt = landing?.imageAlt;
              if (imgs.length > 0)
                return (
                  <ImagesLightbox images={enhanceImages(imgs, landingAlt)} />
                );
              if (node.thumbnail)
                return (
                  <ImagesLightbox
                    images={[
                      {
                        url: node.thumbnail,
                        alt: landingAlt || nodeTitle,
                      },
                    ]}
                  />
                );
              return null;
            })()}

            {related.length ? (
              <RelatedProducts
                title={t("relatedTitle")}
                nodes={related}
                localeKey={localeKey}
              />
            ) : null}
          </main>
        );
      }

      const node = data.node as any;
      const nodeDescription = pickLocalizedField(
        node,
        localeKey,
        "description",
      );
      const allChildren = Array.isArray(data.children) ? data.children : [];
      let desiredType = node.type === "group" ? "item" : "group";
      let children = allChildren.filter((c) => c.type === desiredType);
      if (children.length === 0 && node.type === "category") {
        const directItems = allChildren.filter((c) => c.type === "item");
        if (directItems.length > 0) {
          desiredType = "item";
          children = directItems;
        }
      }

      const total = children.length;
      const start = (page - 1) * PAGE_SIZE;
      const pageChildren = children.slice(start, start + PAGE_SIZE);

      const crumbs = localizeBreadcrumbs(data.breadcrumbs as any, localeKey);
      const nodeTitle = resolveNodeTitle(node, crumbs, localeKey);
      const listHeading = nodeTitle || landing?.heading || t("title");
      const relatedNodes = await fetchRelatedNodes({
        node,
        breadcrumbs: data.breadcrumbs as any,
        sort,
      });
      const related = relatedNodes.filter((n) => n._id !== node._id);

      if (children.length === 0) {
        return (
          <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
            <header className="space-y-3">
              <Breadcrumbs
                nodeTitle={nodeTitle}
                ancestors={crumbs}
                labels={{ home: nav("home"), products: nav("products") }}
              />
              <div className="h-1 w-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)] rounded-full" />
              <h1 className="text-2xl font-bold">{listHeading}</h1>
            </header>

            {renderLandingIntro()}

            {nodeDescription ? (
              <section className="prose max-w-none">
                <p className="text-gray-700">{nodeDescription}</p>
              </section>
            ) : null}

            {(() => {
              const imgs = Array.isArray(node.images) ? node.images : [];
              const landingAlt = landing?.imageAlt;
              if (imgs.length > 0)
                return (
                  <ImagesLightbox images={enhanceImages(imgs, landingAlt)} />
                );
              if (node.thumbnail)
                return (
                  <ImagesLightbox
                    images={[
                      {
                        url: node.thumbnail,
                        alt: landingAlt || nodeTitle,
                      },
                    ]}
                  />
                );
              return null;
            })()}

            {related.length ? (
              <RelatedProducts
                title={t("relatedTitle")}
                nodes={related}
                localeKey={localeKey}
              />
            ) : null}
          </main>
        );
      }

      return (
        <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
          <header className="space-y-3">
            <Breadcrumbs
              nodeTitle={nodeTitle}
              ancestors={crumbs}
              labels={{ home: nav("home"), products: nav("products") }}
            />
            <div className="h-1 w-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)] rounded-full" />
            <h1 className="text-2xl font-bold">{listHeading}</h1>
            {/* <p className="text-muted-foreground">{t("subtitle")}</p> */}
          </header>

          {renderLandingIntro()}

          {nodeDescription ? (
            <section className="prose max-w-none">
              <p className="text-gray-700">{nodeDescription}</p>
            </section>
          ) : null}

          <Grid
            key={currentPath}
            nodes={pageChildren}
            localeKey={localeKey}
            viewDetailsLabel={t("viewDetails")}
            fallbackDescription={t("subtitle")}
          />

          <Pagination total={total} page={page} limit={PAGE_SIZE} />

          {related.length ? (
            <RelatedProducts
              title={t("relatedTitle")}
              nodes={related}
              localeKey={localeKey}
            />
          ) : null}
        </main>
      );
    } catch {
      return (
        <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
          <header className="space-y-3">
            <Breadcrumbs
              labels={{ home: nav("home"), products: nav("products") }}
              isRootProducts
            />
            <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />
            <h1 className="text-2xl font-bold">{defaults.title}</h1>
          </header>
          {renderEmptyState()}
        </main>
      );
    }
  }

  {
    const listing = await listProducts({
      page,
      limit: PAGE_SIZE,
      sort,
      type: "category",
    });

    return (
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <header className="space-y-4">
          <Breadcrumbs
            labels={{ home: nav("home"), products: nav("products") }}
            isRootProducts
          />
          <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{t("title")}</h1>
            </div>
            <Filters
              variant="inline"
              initial={{ q: "", sort }}
              total={listing.total}
            />
          </div>
        </header>

        <Grid
          key="root"
          nodes={listing.items}
          localeKey={localeKey}
          viewDetailsLabel={t("viewDetails")}
          fallbackDescription={t("subtitle")}
        />
        {listing.items.length === 0 ? renderEmptyState() : null}
        <Pagination
          total={listing.total}
          page={listing.page}
          limit={listing.limit ?? PAGE_SIZE}
        />
      </main>
    );
  }
}
