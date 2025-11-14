/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ProductNode,
  News,
  Project,
  Paged,
  ContactForm,
  ContactResponse,
} from "@/types/content";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";
// Base query with credentials
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    let locale = "vi";
    if (typeof document !== "undefined") {
      const htmlLang = document.documentElement.lang || "vi";
      locale = htmlLang.startsWith("en") ? "en" : "vi";
    }
    headers.set("Accept-Language", locale);
    return headers;
  },
});

// Wrap with refresh token logic: on 401/403, try POST /auth/refresh then retry original request
const baseQueryWithReauth: typeof rawBaseQuery = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args as any, api, extraOptions);
  const status = (result as any)?.error?.status as number | undefined;

  if (status === 401 || status === 403) {
    // Attempt to refresh access token using HttpOnly refresh cookie
    const refresh = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if ((refresh as any)?.data) {
      // Retry the original request after successful refresh
      result = await rawBaseQuery(args as any, api, extraOptions);
    } else {
      // Optional: could dispatch a logout action or redirect; leave as is to surface error
    }
  }

  return result as any;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth as any,
  tagTypes: ["Products", "News", "Projects", "Catalogs", "Contacts"],
  endpoints: (builder) => ({
    getLatestProductItems: builder.query<ProductNode[], number | void>({
      query: (limit = 8) => ({
        url: "/products",
        params: {
          type: "item",
          isPublished: true,
          limit,
          sort: "-createdAt",
        },
        cache: "no-store",
      }),
      transformResponse: (raw: any): ProductNode[] => {
        if (Array.isArray(raw)) return raw;
        if (raw?.items && Array.isArray(raw.items)) return raw.items;
        if (raw?.data && Array.isArray(raw.data)) return raw.data;
        return [];
      },
      providesTags: ["Products"],
    }),
    getProductBySlug: builder.query<ProductNode, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (_res, _err, slug) => [{ type: "Products", id: slug }],
    }),

    getLatestNews: builder.query<News[], number | void>({
      query: (limit = 3) =>
        `/news?isPublished=true&limit=${limit}&sort=-publishedAt`,
      providesTags: ["News"],
      transformResponse: (res: Paged<News> | News[]) =>
        (Array.isArray(res) ? res : res?.data) ?? [],
    }),
    getNewsBySlug: builder.query<News, string>({
      query: (slug) => `/news/${slug}`,
      providesTags: (_res, _err, slug) => [{ type: "News", id: slug }],
    }),

    getLatestProject: builder.query<Project | null, void>({
      query: () => `/projects?isPublished=true&limit=1&sort=-year,-createdAt`,
      providesTags: ["Projects"],
      transformResponse: (res: Paged<Project> | Project[]) => {
        const list = Array.isArray(res) ? res : res.data;
        return list?.[0] ?? null;
      },
    }),
    getProductRoot: builder.query<
      Paged<ProductNode>,
      {
        type?: "category" | "group" | "item";
        page?: number;
        limit?: number;
        sort?: string;
      } | void
    >({
      query: (arg) => ({
        url: "/products/root",
        params: { type: "category", sort: "order", ...(arg || {}) },
        cache: "no-store",
      }),
      transformResponse: (res: any) => res,
      providesTags: ["Products"],
    }),
    getProductNodeWithChildren: builder.query<
      {
        node: ProductNode;
        children: ProductNode[];
        breadcrumbs: { title: string; slug: string }[];
      },
      { path: string; sort?: "order" | "-order" }
    >({
      query: ({ path, sort = "order" }) => ({
        url: "/products/node",
        params: { path, sort },
        cache: "no-store",
      }),
      providesTags: (_r, _e, arg) => [
        { type: "Products", id: `node:${arg.path}` },
      ],
    }),
    searchProductNodes: builder.query<
      Paged<ProductNode>,
      { q: string; page?: number; limit?: number }
    >({
      query: ({ q, page = 1, limit = 20 }) => ({
        url: "/products/search",
        params: { q, page, limit },
        cache: "no-store",
      }),
      providesTags: (_r, _e, arg) => [
        { type: "Products", id: `search:${arg.q}` },
      ],
    }),
    sendContactForm: builder.mutation<ContactResponse, ContactForm>({
      query: (body) => ({
        url: "/contacts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contacts"],
    }),
    getCatalogs: builder.query<Paged<any>, void>({
      query: () => "/catalogs?isPublished=true&sort=-year",
      providesTags: ["Catalogs"],
    }),
  }),
});

export const {
  useGetLatestProductItemsQuery,
  useGetProductBySlugQuery,
  useGetLatestNewsQuery,
  useGetNewsBySlugQuery,
  useGetLatestProjectQuery,
  useSendContactFormMutation,
  useGetCatalogsQuery,
  useGetProductRootQuery,
  useLazyGetProductNodeWithChildrenQuery,
  useSearchProductNodesQuery,
} = api;
