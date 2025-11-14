import { fetchProjects } from "./_data";
import ProjectsExplorer from "./_components/Explorer";
import { buildGalleryProjects } from "./_lib/gallery";

export const revalidate = 60;
const PAGE_SIZE = 24;

export default async function ProjectsPage() {
  const initialPage = 1;
  const res = await fetchProjects({ page: initialPage, limit: PAGE_SIZE });
  const projects = res.items ?? [];
  const galleryProjects = await buildGalleryProjects(
    projects,
    projects.length || undefined
  );
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
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
