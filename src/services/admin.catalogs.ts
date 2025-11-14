/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/services/api";
import type { Catalog, CatalogListResp } from "@/types/content";

export const adminCatalogsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCatalogsAdmin: builder.query<CatalogListResp, void>({
      query: () => ({
        url: "/catalogs/list",
        cache: "no-store",
      }),
      providesTags: ["Catalogs"],
    }),

    createCatalog: builder.mutation<
      { ok?: boolean; _id?: string },
      {
        title: string;
        year: number;
        slug: string;
        isPublished: boolean;
        pdf: {
          url: string;
          provider: "cloudinary";
          publicId: string;
          bytes: number;
          contentType: string;
        };
      }
    >({
      query: (body) => ({
        url: "/catalogs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Catalogs"],
    }),

    updateCatalog: builder.mutation<
      { ok?: boolean },
      {
        id: string;
        patch: Partial<
          Pick<Catalog, "title" | "year" | "slug" | "isPublished">
        >;
      }
    >({
      query: ({ id, patch }) => ({
        url: `/catalogs/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["Catalogs"],
    }),

    replaceCatalogFile: builder.mutation<
      { ok?: boolean },
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const fd = new FormData();
        fd.append("file", file);
        return {
          url: `/catalogs/${id}/file`,
          method: "PUT",
          body: fd,
        };
      },
      invalidatesTags: ["Catalogs"],
    }),

    deleteCatalog: builder.mutation<{ ok?: boolean }, string>({
      query: (id) => ({
        url: `/catalogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Catalogs"],
    }),

    uploadCatalogFiles: builder.mutation<
      {
        url: string;
        publicId: string;
        bytes: number;
        contentType: string;
        provider?: "cloudinary";
      }[],
      { files: File[]; folder?: string }
    >({
      query: ({ files, folder = "catalogs" }) => {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        return {
          url: `/upload/multi?folder=${encodeURIComponent(folder)}`,
          method: "POST",
          body: fd,
        };
      },
      transformResponse: (raw: any) => {
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
                raw.contentType ||
                raw.mimeType ||
                raw.mimetype ||
                "application/pdf",
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
  useGetCatalogsAdminQuery,
  useCreateCatalogMutation,
  useUpdateCatalogMutation,
  useReplaceCatalogFileMutation,
  useDeleteCatalogMutation,
  useUploadCatalogFilesMutation,
} = adminCatalogsApi;
