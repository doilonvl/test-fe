/* eslint-disable @typescript-eslint/no-explicit-any */
import { listNews } from "./_data";
import { getTranslations } from "next-intl/server";
import NewsCard from "./_components/NewsCard";
// Removed paginate in favor of a slider for row 2
import NewsCarousel from "./_components/Carousel";
// import NewsBreadcrumbs from "./_components/BreadCrumbs";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 60;

export default async function NewsListPage({ searchParams }: PageProps) {
  const qs = (await searchParams) || {};
  const page = Number((qs.page as string) || "1");
  const limit = 20; // nới limit để đủ dữ liệu cho carousel

  const { items, total } = await listNews({ page, limit });
  const t = await getTranslations("news");
  const first = items[0];
  const second = items[1];
  const third = items[2];
  const rest = items.slice(3);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header above the first row */}

      <section className="space-y-6">
        {/* Hàng đầu tiên: 1 lớn bên trái, 2 nhỏ bên phải */}
        {(first || second || third) && (
          <div className="grid gap-3 md:grid-cols-[2fr_1fr] items-start">
            <div className="space-y-3">
              <section className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {t("breadcrumb")}
                </div>
                <h1 className="text-2xl font-bold">{t("title")}</h1>
                {/* <p className="text-muted-foreground">{t("subtitle")}</p> */}
              </section>
              {first ? <NewsCard n={first} variant="large" /> : null}
            </div>
            <div className="grid gap-4">
              {second ? <NewsCard n={second} variant="small" wide /> : null}
              {third ? <NewsCard n={third} variant="small" wide /> : null}
            </div>
          </div>
        )}

        {/* Các bài phía dưới: thẳng hàng đồng nhất */}
        {rest.length > 0 && <NewsCarousel items={rest} perView={5} />}
      </section>
    </main>
  );
}
