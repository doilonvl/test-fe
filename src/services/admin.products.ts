/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/services/api";
import type { ProductNode, UploadedFile, Paged } from "@/types/content";

export type ProductListResp = {
  items: ProductNode[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
};

function toListResp(raw: any): ProductListResp {
  if (!raw) return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  if (Array.isArray(raw)) {
    return {
      items: raw,
      total: raw.length,
      page: 1,
      limit: raw.length || 20,
      totalPages: 1,
    };
  }
  if (raw.items && Array.isArray(raw.items)) {
    return {
      items: raw.items,
      total:
        Number(raw.total ?? raw.pagination?.total ?? raw.items.length) || 0,
      page: Number(raw.page ?? raw.pagination?.page ?? 1) || 1,
      limit: Number(raw.limit ?? raw.pagination?.limit ?? 20) || 20,
      totalPages:
        Number(
          raw.totalPages ??
            Math.ceil((raw.total ?? raw.items.length) / (raw.limit ?? 20))
        ) || 1,
    };
  }
  if (raw.data && Array.isArray(raw.data)) {
    return {
      items: raw.data,
      total: Number(raw.total ?? raw.pagination?.total ?? raw.data.length) || 0,
      page: Number(raw.page ?? raw.pagination?.page ?? 1) || 1,
      limit: Number(raw.limit ?? raw.pagination?.limit ?? 20) || 20,
      totalPages:
        Number(
          raw.totalPages ??
            Math.ceil((raw.total ?? raw.data.length) / (raw.limit ?? 20))
        ) || 1,
    };
  }
  return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
}

export const adminProductsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // List tất cả (filter theo type/parent/q)
    getProductsAdmin: builder.query<
      ProductListResp,
      {
        page?: number;
        limit?: number;
        type?: "category" | "group" | "item";
        parent?: string | null;
        q?: string;
        sort?: string;
        isPublished?: boolean;
      } | void
    >({
      query: (arg) => ({
        url: "/products",
        params: { page: 1, limit: 20, sort: "order,title", ...(arg || {}) },
        cache: "no-store",
      }),
      transformResponse: toListResp,
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((n) => ({
                type: "Products" as const,
                id: n._id,
              })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    // Root categories (nếu BE trả theo /root)
    getRootCategories: builder.query<ProductNode[], void>({
      query: () => ({
        url: "/products/root",
        params: { type: "category", sort: "order" },
        cache: "no-store",
      }),
      transformResponse: (raw: any): ProductNode[] => {
        if (Array.isArray(raw)) return raw as ProductNode[];
        if (raw?.items && Array.isArray(raw.items)) return raw.items;
        if (raw?.data && Array.isArray(raw.data)) return raw.data;
        return [];
      },
      providesTags: [{ type: "Products", id: "ROOT" }],
    }),

    // Children của 1 node (dùng chọn parent group / item)
    getChildren: builder.query<
      ProductNode[],
      { parent: string; type?: "group" | "item" }
    >({
      query: ({ parent, type }) => ({
        url: "/products/children",
        params: { parent, ...(type ? { type } : {}), sort: "order" },
        cache: "no-store",
      }),
      transformResponse: (raw: any): ProductNode[] => {
        if (Array.isArray(raw)) return raw;
        if (raw?.items && Array.isArray(raw.items)) return raw.items;
        if (raw?.data && Array.isArray(raw.data)) return raw.data;
        return [];
      },
      providesTags: (_r, _e, arg) => [
        { type: "Products", id: `CHILDREN:${arg.parent}` },
      ],
    }),

    // CRUD
    createProductNode: builder.mutation<
      { ok?: boolean; _id?: string },
      Partial<ProductNode> & {
        title: string;
        type: "category" | "group" | "item";
        slug: string;
        parent?: string | null;
        order?: number;
        isPublished?: boolean;
      }
    >({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [
        { type: "Products", id: "LIST" },
        { type: "Products", id: "ROOT" },
      ],
    }),

    updateProductNode: builder.mutation<
      { ok?: boolean },
      { id: string; patch: Partial<ProductNode> }
    >({
      query: ({ id, patch }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
        { type: "Products", id: "ROOT" },
      ],
    }),

    deleteProductNode: builder.mutation<{ ok?: boolean }, string>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "Products", id: "LIST" },
        { type: "Products", id: "ROOT" },
      ],
    }),

    uploadProductImages: builder.mutation<
      UploadedFile[],
      { files: File[]; folder?: string }
    >({
      query: ({ files, folder = "products" }) => {
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
  useGetProductsAdminQuery,
  useGetRootCategoriesQuery,
  useGetChildrenQuery,
  useCreateProductNodeMutation,
  useUpdateProductNodeMutation,
  useDeleteProductNodeMutation,
  useUploadProductImagesMutation,
} = adminProductsApi;
