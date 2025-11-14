/* eslint-disable @typescript-eslint/no-explicit-any */
export type NodeType = "category" | "group" | "item";

export interface Image {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ProductNode {
  _id: string;
  title: string;
  title_i18n?: Record<string, string | undefined>;
  slug: string;
  type: NodeType;
  parent?: string | null;
  ancestors?: {
    _id: string;
    slug: string;
    title: string;
    title_i18n?: Record<string, string | undefined>;
  }[];
  path: string;
  tagline?: string;
  tagline_i18n?: Record<string, string | undefined>;
  description?: string;
  description_i18n?: Record<string, string | undefined>;
  thumbnail?: string;
  images?: Image[];
  specs?: {
    material?: string;
    dimensions_cm?: string;
    usable_depth_cm?: string;
    weight_kg?: string;
  };
  order?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface News {
  _id: string;
  title: string;
  title_i18n?: Record<string, string | undefined>;
  slug: string;
  excerpt?: string;
  excerpt_i18n?: Record<string, string | undefined>;
  content: string;
  content_i18n?: Record<string, string | undefined>;
  cover?: string;
  images?: Image[];
  author?: string;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  [x: string]: unknown;
  slug: string;
  _id: string;
  project: string;
  scope: string;
  client: string;
  year: number;
  images?: Image[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  // Backward-compat fields from older APIs
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ContactForm {
  fullName: string;
  email: string;
  organisation?: string;
  phone: string;
  message: string;
  city?: string;
  country?: string;
  address?: string;
}

export interface ContactResponse {
  message: string;
  data?: any;
}

export type Catalog = {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
};

export type CatalogListResp = {
  items: Catalog[];
  total: number;
  page: number;
  limit: number;
};

export type UploadedFile = {
  url: string;
  publicId: string;
  bytes: number;
  contentType: string;
  width?: number;
  height?: number;
  provider?: "cloudinary";
};
