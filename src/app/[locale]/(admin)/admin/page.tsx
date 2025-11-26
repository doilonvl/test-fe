/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Boxes,
  FileText,
  FolderKanban,
  Newspaper,
  RefreshCw,
} from "lucide-react";
import { useGetCatalogsAdminQuery } from "@/services/admin.catalogs";
import { useGetNewsAdminQuery } from "@/services/admin.news";
import { useGetProductsAdminQuery } from "@/services/admin.products";
import { useGetProjectsAdminQuery } from "@/services/admin.projects";

function formatNumber(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "0";
  return value.toLocaleString("vi-VN");
}

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
}

export default function AdminHome() {
  const {
    data: newsData,
    isFetching: loadingNews,
    refetch: refetchNews,
  } = useGetNewsAdminQuery({ page: 1, limit: 5, sort: "-publishedAt" });
  const {
    data: catalogsData,
    isFetching: loadingCatalogs,
    refetch: refetchCatalogs,
  } = useGetCatalogsAdminQuery();
  const {
    data: projectsData,
    isFetching: loadingProjects,
    refetch: refetchProjects,
  } = useGetProjectsAdminQuery({ page: 1, limit: 5, sort: "-year" });
  const {
    data: productsData,
    isFetching: loadingProducts,
    refetch: refetchProducts,
  } = useGetProductsAdminQuery({ page: 1, limit: 5, sort: "order,title" });

  const stats = [
    {
      key: "news",
      label: "Tin tức",
      description: "Bài viết và thông báo",
      total: newsData?.total ?? newsData?.items?.length ?? 0,
      loading: loadingNews,
      href: "/admin/news",
      icon: Newspaper,
    },
    {
      key: "products",
      label: "Sản phẩm",
      description: "Danh mục, nhóm và item",
      total: productsData?.total ?? productsData?.items?.length ?? 0,
      loading: loadingProducts,
      href: "/admin/products",
      icon: Boxes,
    },
    {
      key: "projects",
      label: "Dự án",
      description: "Case study đã thực hiện",
      total: projectsData?.total ?? projectsData?.items?.length ?? 0,
      loading: loadingProjects,
      href: "/admin/projects",
      icon: FolderKanban,
    },
    {
      key: "catalogs",
      label: "Catalogs",
      description: "Tài liệu PDF",
      total: catalogsData?.total ?? catalogsData?.items?.length ?? 0,
      loading: loadingCatalogs,
      href: "/admin/catalogs",
      icon: FileText,
    },
  ];

  const refreshing =
    loadingNews || loadingCatalogs || loadingProjects || loadingProducts;

  const refreshAll = () => {
    refetchNews();
    refetchCatalogs();
    refetchProjects();
    refetchProducts();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Hasake Admin
          </p>
          <h1 className="text-3xl font-semibold">Tổng quan nội dung</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Số liệu tổng hợp cho News, Catalogs, Projects và Products để xem
            nhanh tình trạng mới nhất của các module.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={refreshAll}
          disabled={refreshing}
        >
          <RefreshCw
            className={["size-4", refreshing ? "animate-spin" : ""].join(" ")}
          />
          Làm mới
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className="border border-border/70">
              <CardHeader className="flex items-start justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-muted p-2 shadow-sm">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <CardTitle className="text-base">{item.label}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {item.loading ? "Dang tai" : "San sang"}
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-4xl font-semibold leading-tight">
                  {item.loading ? "..." : formatNumber(item.total)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Tổng mục {item.label.toLowerCase()} đang quản lý.
                </p>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={item.href as any}>Mở quản lý</Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => {
                      switch (item.key) {
                        case "news":
                          refetchNews();
                          break;
                        case "products":
                          refetchProducts();
                          break;
                        case "projects":
                          refetchProjects();
                          break;
                        case "catalogs":
                          refetchCatalogs();
                          break;
                        default:
                          break;
                      }
                    }}
                    aria-label={`Lam moi ${item.label}`}
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Tin tức mới</CardTitle>
            <CardDescription>
              Top 5 bài viết sắp xếp theo ngày mới nhất.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(newsData?.items || []).slice(0, 5).map((n) => (
              <div
                key={n._id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-tight">{n.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.slug} • {formatDate(n.publishedAt || n.createdAt)}
                  </p>
                </div>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium",
                    n.isPublished
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                  ].join(" ")}
                >
                  {n.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            ))}
            {!newsData?.items?.length && (
              <p className="text-sm text-muted-foreground">Chưa có bài viết.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Sản phẩm cập nhật</CardTitle>
            <CardDescription>5 node gần nhất theo order/title.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(productsData?.items || []).slice(0, 5).map((p) => (
              <div
                key={p._id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-tight">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.slug} • {p.type} •{" "}
                    {formatDate(p.updatedAt || p.createdAt)}
                  </p>
                </div>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium",
                    p.isPublished
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                  ].join(" ")}
                >
                  {p.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            ))}
            {!productsData?.items?.length && (
              <p className="text-sm text-muted-foreground">Chưa có sản phẩm.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Dự án gần đây</CardTitle>
            <CardDescription>5 project mới nhất theo năm.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(projectsData?.items || []).slice(0, 5).map((p) => (
              <div
                key={p._id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-tight">
                    {p.project || p.slug}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.client || "Unknown client"} • {p.year || "?"} •{" "}
                    {formatDate(p.updatedAt || p.createdAt)}
                  </p>
                </div>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium",
                    p.isPublished
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                  ].join(" ")}
                >
                  {p.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            ))}
            {!projectsData?.items?.length && (
              <p className="text-sm text-muted-foreground">Chưa có dự án.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Catalogs</CardTitle>
            <CardDescription>
              Thông tin PDF và trạng thái công bố.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(catalogsData?.items || []).slice(0, 5).map((c) => (
              <div
                key={c._id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-tight">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Năm {c.year} • {c.slug}
                  </p>
                </div>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium",
                    c.isPublished
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                  ].join(" ")}
                >
                  {c.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            ))}
            {!catalogsData?.items?.length && (
              <p className="text-sm text-muted-foreground">Chưa có catalog.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
