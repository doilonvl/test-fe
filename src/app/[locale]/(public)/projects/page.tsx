import { fetchProjects } from "./_data";
import ProjectsExplorer from "./_components/Explorer";
import { buildGalleryProjects } from "./_lib/gallery";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { buildPageMetadata, mergeKeywords } from "@/lib/seo";

export const revalidate = 60;
const PAGE_SIZE = 24;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getTranslations("seo");
  const locale = await getLocale();
  const industryKeywords = seo.raw("keywords.industry") as string[];
  return buildPageMetadata({
    title: seo("pages.projects.title"),
    description: seo("pages.projects.description"),
    keywords: mergeKeywords(industryKeywords),
    href: "/projects",
    locale,
  });
}

export default async function ProjectsPage() {
  const nav = await getTranslations("nav");
  const initialPage = 1;
  const res = await fetchProjects({ page: initialPage, limit: PAGE_SIZE });
  const projects = res.items ?? [];
  const galleryProjects = await buildGalleryProjects(
    projects,
    projects.length || undefined
  );
  const breadcrumb = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{nav("home")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{nav("projects")}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <ProjectsExplorer
        initialProjects={projects}
        initialGalleryProjects={galleryProjects}
        total={typeof res.total === "number" ? res.total : 0}
        pageSize={res.limit ?? PAGE_SIZE}
        initialPage={res.page ?? initialPage}
        breadcrumb={breadcrumb}
      />
    </main>
  );
}

