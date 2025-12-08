/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/services/api";
import { guardUploadFiles } from "@/services/upload.guard";
import type { Project, UploadedFile } from "@/types/content";

export type ProjectListResp = {
  items: Project[];
  total: number;
  page: number;
  limit: number;
};

export const adminProjectsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjectsAdmin: builder.query<
      ProjectListResp,
      {
        page?: number;
        limit?: number;
        q?: string;
        year?: number;
        sort?: string;
      } | void
    >({
      query: (arg) => ({
        // Dùng endpoint chung /projects (backend không có /projects/list ở prod)
        url: "/projects",
        params: {
          page: 1,
          limit: 20,
          sort: "-year,-createdAt",
          ...(arg || {}),
        },
        cache: "no-store",
      }),
      transformResponse: (raw: any): ProjectListResp => {
        if (!raw) return { items: [], total: 0, page: 1, limit: 20 };
        if (Array.isArray(raw)) {
          return {
            items: raw,
            total: raw.length,
            page: 1,
            limit: raw.length || 20,
          };
        }
        // hỗ trợ nhiều kiểu payload
        if (raw.items && Array.isArray(raw.items)) {
          return {
            items: raw.items,
            total:
              Number(raw.total ?? raw.pagination?.total ?? raw.items.length) ||
              0,
            page: Number(raw.page ?? raw.pagination?.page ?? 1) || 1,
            limit: Number(raw.limit ?? raw.pagination?.limit ?? 20) || 20,
          };
        }
        if (raw.data && Array.isArray(raw.data)) {
          return {
            items: raw.data,
            total:
              Number(raw.total ?? raw.pagination?.total ?? raw.data.length) ||
              0,
            page: Number(raw.page ?? raw.pagination?.page ?? 1) || 1,
            limit: Number(raw.limit ?? raw.pagination?.limit ?? 20) || 20,
          };
        }
        return { items: [], total: 0, page: 1, limit: 20 };
      },
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((p) => ({
                type: "Projects" as const,
                id: p._id,
              })),
              { type: "Projects" as const, id: "LIST" },
            ]
          : [{ type: "Projects" as const, id: "LIST" }],
    }),

    createProject: builder.mutation<
      { ok?: boolean; _id?: string },
      {
        project: string;
        scope: string;
        client: string;
        year: number;
        slug?: string;
        isPublished: boolean;
        images?: { url: string; alt?: string }[];
      }
    >({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),

    updateProject: builder.mutation<
      { ok?: boolean },
      {
        id: string;
        patch: Partial<
          Pick<
            Project,
            "project" | "scope" | "client" | "year" | "isPublished" | "images"
          >
        >;
      }
    >({
      query: ({ id, patch }) => ({
        url: `/projects/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Projects", id },
        { type: "Projects", id: "LIST" },
      ],
    }),

    deleteProject: builder.mutation<{ ok?: boolean }, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),

    uploadProjectImages: builder.mutation<
      UploadedFile[],
      { files: File[]; folder?: string }
    >({
      query: ({ files, folder = "projects" }) => {
        guardUploadFiles(files, {
          allowedTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif",
            "image/avif",
          ],
          maxBytes: 8 * 1024 * 1024,
          maxFiles: 12,
        });
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        return {
          url: `/upload/multi?folder=${encodeURIComponent(folder)}`,
          method: "POST",
          body: fd,
        };
      },
      transformResponse: (raw: any): UploadedFile[] => {
        if (Array.isArray(raw)) return raw as UploadedFile[];
        if (raw?.items && Array.isArray(raw.items)) return raw.items;
        if (raw?.data && Array.isArray(raw.data)) return raw.data;
        if (raw?.url && raw?.publicId) return [raw];
        if (raw?.secure_url || raw?.public_id) {
          return [
            {
              url: raw.secure_url || raw.url,
              publicId: raw.public_id || raw.publicId,
              bytes: raw.bytes ?? raw.size ?? 0,
              contentType:
                raw.contentType || raw.mimeType || raw.mimetype || "image/jpeg",
              provider: "cloudinary",
            },
          ];
        }
        if (raw?.file?.url && raw?.file?.publicId) return [raw.file];
        return [];
      },
    }),

    checkProjectSlug: builder.query<{ exists: boolean }, { slug: string }>({
      query: ({ slug }) => ({ url: "/projects/slug/check", params: { slug } }),
    }),
    slugifyProject: builder.query<{ slug: string }, { title: string }>({
      query: ({ title }) => ({ url: "/projects/slugify", params: { title } }),
    }),
    regenerateProjectSlug: builder.mutation<{ slug: string }, { id: string }>({
      query: ({ id }) => ({
        url: `/projects/${id}/slug/regenerate`,
        method: "POST",
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Projects", id },
        { type: "Projects", id: "LIST" },
      ],
    }),
    backfillProjectSlugs: builder.mutation<{ updated: number }, void>({
      query: () => ({ url: "/projects/slugs/backfill", method: "POST" }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProjectsAdminQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUploadProjectImagesMutation,
  useCheckProjectSlugQuery,
  useLazyCheckProjectSlugQuery,
  useSlugifyProjectQuery,
  useLazySlugifyProjectQuery,
  useRegenerateProjectSlugMutation,
  useBackfillProjectSlugsMutation,
} = adminProjectsApi;
