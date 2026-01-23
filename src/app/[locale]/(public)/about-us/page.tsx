import AboutUs from "@/components/shared/AboutUs";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import type { Metadata } from "next";
import { buildPageMetadata, mergeKeywords } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getTranslations("seo");
  const locale = await getLocale();
  const industryKeywords = seo.raw("keywords.industry") as string[];
  return buildPageMetadata({
    title: seo("pages.about.title"),
    description: seo("pages.about.description"),
    keywords: mergeKeywords(industryKeywords),
    href: "/about-us",
    locale,
  });
}

export default async function AboutUsPage() {
  const nav = await getTranslations("nav");

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">{nav("home")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{nav("about")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#ff8905,#05acfb,#8fc542)]" />
        <AboutUs />
      </section>
    </main>
  );
}
