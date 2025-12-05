/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/error-boundaries */
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import Breadcrumbs from "../_components/Breadcrumbs";
import ImagesLightbox from "../_components/ImagesLightbox";
import Filters from "../_components/Filter";
import Grid from "../_components/Grid";
import Pagination from "../_components/Pagination";
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

const siteUrl = "https://hasakeplay.com.vn/products";

const defaultMetadata: Metadata = {
  title: "Products & services",
  description:
    "Explore Hasake Play's catalog of playground equipment, design services, and installation support.",
  openGraph: {
    title: "Products & services | Hasake Play",
    description:
      "Discover playground equipment and services for indoor and outdoor projects.",
    url: siteUrl,
    siteName: "Hasake Play",
    images: [{ url: "/Logo/hasakelogo.png", width: 512, height: 512 }],
  },
  alternates: { canonical: siteUrl },
};

const landingMetas: Record<
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

type LandingCopy = {
  heading: string;
  intro: string;
  support?: string;
  imageAlt?: string;
};

const landingCopy: Record<string, LandingCopy> = {
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

const enhanceImages = (images: any[], alt?: string) =>
  images.map((img, idx) => ({
    ...img,
    alt:
      img.alt ||
      (alt ? `${alt}${images.length > 1 ? ` ${idx + 1}` : ""}` : undefined),
  }));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}): Promise<Metadata> {
  const { segments = [] } = await params;
  const currentPath = segments.join("/");
  const landing = landingMetas[currentPath];
  if (landing) {
    const url = siteUrl + "/" + currentPath;
    return {
      title: landing.title,
      description: landing.description,
      keywords: landing.keywords,
      alternates: { canonical: url },
      openGraph: {
        title: landing.title,
        description: landing.description,
        url,
        siteName: "Hasake Play",
        images: [{ url: "/Logo/hasakelogo.png", width: 512, height: 512 }],
      },
      twitter: {
        card: "summary_large_image",
        title: landing.title,
        description: landing.description,
        images: ["/Logo/hasakelogo.png"],
      },
    };
  }

  // Fallback: generate meta from node data so dynamic slugs (e.g. nested) get specific titles
  try {
    const localeKey = normalizeLocale(await getLocale());
    const data = await fetchNodeWithChildren(currentPath, "order");
    const nodeTitle =
      pickLocalizedField(data.node, localeKey, "title") || data.node.title;
    const nodeDescription = pickLocalizedField(
      data.node,
      localeKey,
      "description"
    );
    const url = siteUrl + "/" + currentPath;
    return {
      title: nodeTitle || defaultMetadata.title,
      description: nodeDescription || defaultMetadata.description,
      alternates: { canonical: url },
      openGraph: {
        title: nodeTitle || defaultMetadata.title,
        description: nodeDescription || defaultMetadata.description,
        url,
        siteName: "Hasake Play",
        images: [{ url: "/Logo/hasakelogo.png", width: 512, height: 512 }],
      },
      twitter: {
        card: "summary_large_image",
        title: nodeTitle || defaultMetadata.title,
        description: nodeDescription || defaultMetadata.description,
        images: ["/Logo/hasakelogo.png"],
      },
    };
  } catch {
    return defaultMetadata;
  }
}

const normalizeLocale = (value: string | undefined) =>
  value && value.toLowerCase().startsWith("en") ? "en" : "vi";

const pickLocalizedField = (
  entity: any,
  localeKey: string,
  field: "tagline" | "description" | "title"
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
  localeKey: string
) =>
  (crumbs || []).map((crumb) => ({
    ...crumb,
    title: pickLocalizedField(crumb, localeKey, "title")?.trim() || crumb.title,
  }));

export default async function ProductsPage({
  params,
  searchParams,
}: PageProps) {
  const t = await getTranslations("products");
  const nav = await getTranslations("nav");
  const localeKey = normalizeLocale(await getLocale());
  const { segments = [] } = await params;
  const qs = await searchParams;

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
  const landing = landingCopy[currentPath];
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
      const headingText = landing?.heading || t("title");
      if (data.node.type === "item") {
        const node = data.node as any;
        const nodeDescription = pickLocalizedField(
          node,
          localeKey,
          "description"
        );
        const nodeTitle =
          pickLocalizedField(node, localeKey, "title") || node.title;
        const crumbs = localizeBreadcrumbs(data.breadcrumbs as any, localeKey);
        return (
          <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
            <header className="space-y-2">
              <div className="h-1 w-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)] rounded-full" />
              <h1 className="text-2xl font-bold">{headingText}</h1>
              {/* <p className="text-muted-foreground">{t("subtitle")}</p> */}
            </header>

            <Breadcrumbs
              nodeTitle={nodeTitle}
              ancestors={crumbs}
              labels={{ home: nav("home"), products: nav("products") }}
            />

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
          </main>
        );
      }

      const node = data.node as any;
      const nodeDescription = pickLocalizedField(
        node,
        localeKey,
        "description"
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

      if (children.length === 0) {
        const nodeTitle =
          pickLocalizedField(node, localeKey, "title") || node.title;
        const crumbs = localizeBreadcrumbs(data.breadcrumbs as any, localeKey);
        return (
          <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
            <header className="space-y-2">
              <div className="h-1 w-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)] rounded-full" />
              <h1 className="text-2xl font-bold">{headingText}</h1>
            </header>

            <Breadcrumbs
              nodeTitle={nodeTitle}
              ancestors={crumbs}
              labels={{ home: nav("home"), products: nav("products") }}
            />

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
          </main>
        );
      }

      const nodeTitle =
        pickLocalizedField(data.node, localeKey, "title") || data.node.title;
      const crumbs = localizeBreadcrumbs(data.breadcrumbs as any, localeKey);

      return (
        <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
          <header className="space-y-2">
            <div className="h-1 w-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)] rounded-full" />
            <h1 className="text-2xl font-bold">{headingText}</h1>
            {/* <p className="text-muted-foreground">{t("subtitle")}</p> */}
          </header>

          <Breadcrumbs
            nodeTitle={nodeTitle}
            ancestors={crumbs}
            labels={{ home: nav("home"), products: nav("products") }}
          />

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
        </main>
      );
    } catch {
      notFound();
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
          <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{t("title")}</h1>
              <Breadcrumbs
                labels={{ home: nav("home"), products: nav("products") }}
                isRootProducts
              />
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
        <Pagination
          total={listing.total}
          page={listing.page}
          limit={listing.limit ?? PAGE_SIZE}
        />
      </main>
    );
  }
}
