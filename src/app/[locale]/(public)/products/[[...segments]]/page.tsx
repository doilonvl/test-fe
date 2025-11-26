/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/error-boundaries */
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

        <Grid nodes={result.items} highlightType />
        <Pagination
          total={result.total}
          page={result.page}
          limit={result.limit ?? PAGE_SIZE}
        />
      </main>
    );
  }

  // 2) NODE: Ä‘i sÃ¢u theo slug; hiá»ƒn thá»‹ description + con theo type
  if (currentPath) {
    try {
      const data = await fetchNodeWithChildren(currentPath, sort);
      // Náº¿u lÃ  item, hiá»ƒn thá»‹ trang chi tiáº¿t ngay táº¡i route lá»“ng nhau
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
              <h1 className="text-2xl font-bold">{t("title")}</h1>
              {/* <p className="text-muted-foreground">{t("subtitle")}</p> */}
            </header>

            <Breadcrumbs
              nodeTitle={nodeTitle}
              ancestors={crumbs}
              labels={{ home: "Home", products: "Products & services" }}
            />

            {nodeDescription ? (
              <section className="prose max-w-none">
                <p className="text-gray-700">{nodeDescription}</p>
              </section>
            ) : null}

            {(() => {
              const imgs = Array.isArray(node.images) ? node.images : [];
              if (imgs.length > 0) return <ImagesLightbox images={imgs} />;
              if (node.thumbnail)
                return (
                  <ImagesLightbox
                    images={[{ url: node.thumbnail, alt: nodeTitle }]}
                  />
                );
              return null;
            })()}
          </main>
        );
      }

      // Quy Æ°á»›c hiá»ƒn thá»‹:
      // - Náº¿u node lÃ  CATEGORY  â†’ Æ°u tiÃªn show cÃ¡c con type = "group"
      // - Náº¿u node lÃ  GROUP     â†’ show cÃ¡c con type = "item"
      // - Náº¿u CATEGORY khÃ´ng cÃ³ group nhÆ°ng cÃ³ item trá»±c thuá»™c â†’ hiá»ƒn thá»‹ item
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

      // Náº¿u khÃ´ng cÃ³ con nÃ o Ä‘á»ƒ hiá»ƒn thá»‹: cho phÃ©p detail view cá»§a chÃ­nh node
      if (children.length === 0) {
        const nodeTitle =
          pickLocalizedField(node, localeKey, "title") || node.title;
        const crumbs = localizeBreadcrumbs(data.breadcrumbs as any, localeKey);
        return (
          <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
            <header className="space-y-2">
              <div className="h-1 w-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)] rounded-full" />
              <h1 className="text-2xl font-bold">{t("title")}</h1>
            </header>

            <Breadcrumbs
              nodeTitle={nodeTitle}
              ancestors={crumbs}
              labels={{ home: "Home", products: "Products & services" }}
            />

            {nodeDescription ? (
              <section className="prose max-w-none">
                <p className="text-gray-700">{nodeDescription}</p>
              </section>
            ) : null}

            {(() => {
              const imgs = Array.isArray(node.images) ? node.images : [];
              if (imgs.length > 0) return <ImagesLightbox images={imgs} />;
              if (node.thumbnail)
                return (
                  <ImagesLightbox
                    images={[{ url: node.thumbnail, alt: nodeTitle }]}
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
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            {/* <p className="text-muted-foreground">{t("subtitle")}</p> */}
          </header>

          {/* Breadcrumbs ngáº¯n gá»n: Home / Products & services / [node] */}
          <Breadcrumbs
            nodeTitle={nodeTitle}
            ancestors={crumbs}
            labels={{ home: "Home", products: "Products & services" }}
          />

          {/* Description cá»§a node */}
          {nodeDescription ? (
            <section className="prose max-w-none">
              {/* náº¿u description cÃ³ HTML, báº¡n cÃ³ thá»ƒ Ä‘á»•i sang dangerouslySetInnerHTML */}
              <p className="text-gray-700">{nodeDescription}</p>
            </section>
          ) : null}

          {/* KhÃ´ng hiá»ƒn thá»‹ Filter/Search á»Ÿ cáº¥p sÃ¢u (group/item) */}

          {/* Grid con theo type mong muá»‘n */}
          <Grid key={currentPath} nodes={pageChildren} />

          <Pagination total={total} page={page} limit={PAGE_SIZE} />
        </main>
      );
    } catch {
      notFound();
    }
  }

  // 3) ROOT: chá»‰ â€œHome / Products & servicesâ€ + danh má»¥c gá»‘c (category)
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
                labels={{ home: "Home", products: "Products & services" }}
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

        <Grid key="root" nodes={listing.items} />
        <Pagination
          total={listing.total}
          page={listing.page}
          limit={listing.limit ?? PAGE_SIZE}
        />
      </main>
    );
  }
}
