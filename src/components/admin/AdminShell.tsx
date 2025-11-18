/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Boxes,
  Newspaper,
  FolderKanban,
  FileText,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "products", label: "Quản lý Sản phẩm", icon: Boxes, slug: "products" },
  { key: "news", label: "Quản lý Tin tức", icon: Newspaper, slug: "news" },
  {
    key: "projects",
    label: "Quản lý Dự án",
    icon: FolderKanban,
    slug: "projects",
  },
  {
    key: "catalogs",
    label: "Quản lý Danh mục",
    icon: FileText,
    slug: "catalogs",
  },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = String(params?.locale || "vi");

  // --- Collapsible sidebar state (persist to localStorage)
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("admin.sidebar") === "collapsed";
  });
  React.useEffect(() => {
    if (collapsed) localStorage.setItem("admin.sidebar", "collapsed");
    else localStorage.removeItem("admin.sidebar");
  }, [collapsed]);

  async function handleLogout() {
    try {
      const base = (
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_BASE ||
        "http://localhost:5001/api/v1"
      ).replace(/\/$/, "");

      await fetch(`${base}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      router.replace(`/${locale}/login`);
    } catch {
      router.replace(`/${locale}/login`);
    }
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* SIDEBAR */}
      <aside
        className={[
          "hidden md:flex shrink-0 border-r bg-card transition-[width] duration-200",
          collapsed ? "w-16" : "w-64",
        ].join(" ")}
      >
        <div className="flex h-dvh flex-col w-full">
          {/* Header */}
          <div className="px-3 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!collapsed && (
                  <div>
                    <p className="text-sm font-semibold">Hasake Admin</p>
                    <p className="text-xs text-muted-foreground">
                      Control Panel
                    </p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1"
                onClick={() => setCollapsed((v) => !v)}
                aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                title={collapsed ? "Mở rộng" : "Thu gọn"}
              >
                {collapsed ? (
                  <ChevronsRight className="size-4" />
                ) : (
                  <ChevronsLeft className="size-4" />
                )}
              </Button>
            </div>
          </div>
          <Separator />

          {/* Nav */}
          <ScrollArea className="flex-1">
            <nav className="px-2 py-3 space-y-1">
              {NAV_ITEMS.map((it) => {
                // ⚠️ Không chèn locale ở đây, Link sẽ tự thêm → tránh /en/en/...
                const href = `/admin/${it.slug}`;
                const active =
                  pathname === `/${locale}/admin/${it.slug}` ||
                  pathname.startsWith(`/${locale}/admin/${it.slug}/`);
                const Icon = it.icon;

                return (
                  <Link
                    key={it.key}
                    href={href as any}
                    className={[
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted",
                    ].join(" ")}
                    title={collapsed ? it.label : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="size-4 opacity-80 group-hover:opacity-100" />
                    {!collapsed && <span className="truncate">{it.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <Separator />

          {/* Footer: Avatar + Logout */}
          <div className="p-3">
            <div
              className={[
                "flex items-center gap-3 px-2 py-2 rounded-md",
                collapsed ? "justify-center" : "",
              ].join(" ")}
            >
              <Avatar className="size-8">
                <AvatarImage src="" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-5 truncate">
                    Admin
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    admin@hasakeplay.com.vn
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              className={[
                "w-full justify-start gap-2",
                collapsed ? "justify-center" : "",
              ].join(" ")}
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="size-4" />
              {!collapsed && "Logout"}
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        {/* Topbar (mobile) */}
        <div className="md:hidden sticky top-0 z-10 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold">Hasake Admin</span>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
