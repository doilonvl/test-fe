import { fetchProjectById, fetchProjectBySlug, type Project } from "../_data";

export const GALLERY_TARGET = 30;
export const GALLERY_LOOKUP_LIMIT = 60;

export async function buildGalleryProjects(
  projects: Project[],
  target = GALLERY_TARGET
) {
  if (!projects.length) return [];

  const ready: Project[] = [];
  const pending: { project: Project; index: number }[] = [];

  for (let index = 0; index < projects.length; index++) {
    const project = projects[index];
    if (project?.images?.length) {
      ready.push(project);
    } else if (
      (project.slug || project._id) &&
      pending.length < GALLERY_LOOKUP_LIMIT
    ) {
      pending.push({ project, index });
    }
    if (ready.length >= target) {
      break;
    }
  }

  if (ready.length >= target || pending.length === 0) {
    return ready.slice(0, target);
  }

  const hydrated = await Promise.all(
    pending.map(async ({ project, index }) => {
      const enriched = await hydrateProjectImages(project);
      if (enriched?.images?.length) {
        return { project: { ...project, images: enriched.images }, index };
      }
      return null;
    })
  );

  const hydratedEntries = hydrated.filter(
    (
      entry
    ): entry is {
      project: Project & { images: { url: string; alt?: string }[] };
      index: number;
    } =>
      entry !== null &&
      Array.isArray(entry.project.images) &&
      entry.project.images.length > 0
  );

  hydratedEntries.sort((a, b) => a.index - b.index);

  hydratedEntries.forEach(({ project }) => {
    if (ready.length < target) {
      ready.push(project);
    }
  });

  return ready.slice(0, target);
}

async function hydrateProjectImages(project: Project) {
  try {
    if (project.slug) {
      const bySlug = await fetchProjectBySlug(project.slug);
      if (bySlug?.images?.length) return bySlug;
    }
    if (project._id) {
      const byId = await fetchProjectById(project._id);
      if (byId?.images?.length) return byId;
    }
  } catch {
    // ignore individual hydration errors
  }
  return null;
}
