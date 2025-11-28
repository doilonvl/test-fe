import { fetchProjects } from "./_data";
import ProjectsExplorer from "./_components/Explorer";
import { buildGalleryProjects } from "./_lib/gallery";
import { getTranslations } from "next-intl/server";
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
import { ChevronRight } from "lucide-react";

export const revalidate = 60;
const PAGE_SIZE = 24;
const siteUrl = "https://hasakeplay.com.vn/projects";

export const metadata: Metadata = {
  title: "Dự án | Hasake Play",
  description:
    "Bộ sưu tập các dự án thiết kế, thi công khu vui chơi của Hasake Play.",
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Dự án | Hasake Play",
    description:
      "Xem các dự án nổi bật và hình ảnh thi công khu vui chơi Hasake Play.",
    url: siteUrl,
    siteName: "Hasake Play",
    images: [{ url: "/Logo/hasakelogo.png", width: 512, height: 512 }],
  },
};

export default async function ProjectsPage() {
  const nav = await getTranslations("nav");
  const initialPage = 1;
  const res = await fetchProjects({ page: initialPage, limit: PAGE_SIZE });
  const projects = res.items ?? [];
  const galleryProjects = await buildGalleryProjects(
    projects,
    projects.length || undefined
  );
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-4">
        <Breadcrumb>
          <BreadcrumbList className="text-sm text-muted-foreground">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">{nav("home")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">
                {nav("projects")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </section>
      <ProjectsExplorer
        initialProjects={projects}
        initialGalleryProjects={galleryProjects}
        total={typeof res.total === "number" ? res.total : 0}
        pageSize={res.limit ?? PAGE_SIZE}
        initialPage={res.page ?? initialPage}
      />
    </main>
  );
}
