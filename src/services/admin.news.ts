/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/services/api";
import type { News, UploadedFile } from "@/types/content";

export type NewsListResp = {
  items: News[];
  total: number;
  page: number;
  limit: number;
};

export const adminNewsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNewsAdmin: builder.query<
      NewsListResp,
      { page?: number; limit?: number; q?: string; sort?: string } | void
    >({

      query: (arg) => ({
        url: "/news/list",
        params: {
          page: 1,
          limit: 20,
          sort: "-publishedAt,-createdAt",
          ...(arg || {}),
        },
        cache: "no-store",
      }),
      transformResponse: (raw: any): NewsListResp => {
        if (!raw) return { items: [], total: 0, page: 1, limit: 20 };
        if (Array.isArray(raw)) {
          return {
            items: raw,
            total: raw.length,
            page: 1,
            limit: raw.length || 20,
          };
        }
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
              ...res.items.map((n) => ({ type: "News" as const, id: n._id })),
              { type: "News" as const, id: "LIST" },
            ]
          : [{ type: "News" as const, id: "LIST" }],
    }),

    createNews: builder.mutation<
      { ok?: boolean; _id?: string },
      {
        title: string;
        slug: string;
        excerpt?: string;
        content: string;
        cover?: string;
        images?: { url: string; alt?: string }[];
        author?: string;
        isPublished: boolean;
        publishedAt?: string; // ISO
        title_i18n?: Record<string, string | undefined>;
        excerpt_i18n?: Record<string, string | undefined>;
        content_i18n?: Record<string, string | undefined>;
      }
    >({
      query: (body) => ({ url: "/news", method: "POST", body }),
      invalidatesTags: [{ type: "News", id: "LIST" }],
    }),

    updateNews: builder.mutation<
      { ok?: boolean },
      {
        id: string;
        patch: Partial<
          Pick<
            News,
            | "title"
            | "slug"
            | "excerpt"
            | "content"
            | "cover"
            | "images"
            | "author"
            | "isPublished"
            | "publishedAt"
            | "title_i18n"
            | "excerpt_i18n"
            | "content_i18n"
          >
        >;
      }
    >({
      query: ({ id, patch }) => ({
        url: `/news/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "News", id },
        { type: "News", id: "LIST" },
      ],
    }),

    deleteNews: builder.mutation<{ ok?: boolean }, string>({
      query: (id) => ({ url: `/news/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "News", id: "LIST" }],
    }),

    uploadNewsImages: builder.mutation<
      UploadedFile[],
      { files: File[]; folder?: string }
    >({
      query: ({ files, folder = "news" }) => {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        return {
          url: `/upload/multi?folder=${encodeURIComponent(folder)}`,
          method: "POST",
          body: fd,
        };
      },
      transformResponse: (raw: any): UploadedFile[] => {
        if (Array.isArray(raw)) return raw;
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
  }),
  overrideExisting: false,
});

export const {
  useGetNewsAdminQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  useUploadNewsImagesMutation,
} = adminNewsApi;
