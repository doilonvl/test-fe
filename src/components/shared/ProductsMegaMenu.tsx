/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/refs */
"use client";

import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  useGetProductRootQuery,
  useLazyGetProductNodeWithChildrenQuery,
} from "@/services/api";
import type { ProductNode } from "@/types/content";

export default function ProductsMegaMenu({
  label = "Products",
  tone = "255,137,5", // cam
}: {
  label?: string;
  tone?: string;
}) {
  const locale = useLocale();
  const normalizedLocale = locale?.toLowerCase().startsWith("en") ? "en" : "vi";
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const delayedClose = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, 150);
  };
  useEffect(() => () => clearCloseTimer(), []);

  // Root categories
  const { data: rootPaged } = useGetProductRootQuery();
  const categories: ProductNode[] = rootPaged?.items ?? rootPaged?.data ?? [];

  // Lazy children
  const [fetchNode] = useLazyGetProductNodeWithChildrenQuery();
  const groupsCache = useRef<Record<string, ProductNode[]>>({});
  const itemsCache = useRef<Record<string, ProductNode[]>>({});
  const [itemsLoading, setItemsLoading] = useState<Record<string, boolean>>({});

  // Có con hay không (để hiện mũi tên cạnh title đúng điều kiện)
  const [catHasChildren, setCatHasChildren] = useState<Record<string, boolean>>(
    {}
  );
  const [groupHasChildren, setGroupHasChildren] = useState<
    Record<string, boolean>
  >({});

  // Active để hiển thị cột kế tiếp
  const [activeCatPath, setActiveCatPath] = useState<string | null>(null);
  const [activeGroupSlug, setActiveGroupSlug] = useState<string | null>(null);

  // Hover để hiển thị mũi tên cạnh đúng title
  const [hoveredCatPath, setHoveredCatPath] = useState<string | null>(null);
  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null); // `${catPath}/${groupSlug}`

  // Prefetch groups khi hover category (đồng thời lưu hasChildren)
  useEffect(() => {
    if (!hoveredCatPath) return;
    if (groupsCache.current[hoveredCatPath] !== undefined) return;
    fetchNode({ path: hoveredCatPath })
      .unwrap()
      .then((res) => {
        const groups = (res.children ?? []).filter((c) => c.type === "group");
        groupsCache.current[hoveredCatPath] = groups;
        setCatHasChildren((m) => ({
          ...m,
          [hoveredCatPath]: groups.length > 0,
        }));
      })
      .catch(() => {
        groupsCache.current[hoveredCatPath] = [];
        setCatHasChildren((m) => ({ ...m, [hoveredCatPath]: false }));
      });
  }, [hoveredCatPath, fetchNode]);

  const groups = activeCatPath ? groupsCache.current[activeCatPath] ?? [] : [];

  // Prefetch items khi hover group (đồng thời lưu hasChildren)
  useEffect(() => {
    if (!hoveredGroupKey) return;
    if (itemsCache.current[hoveredGroupKey] !== undefined) return;
    setItemsLoading((m) => ({ ...m, [hoveredGroupKey]: true }));
    fetchNode({ path: hoveredGroupKey })
      .unwrap()
      .then((res) => {
        const items = (res.children ?? []).filter((c) => c.type === "item");
        itemsCache.current[hoveredGroupKey] = items;
        setGroupHasChildren((m) => ({
          ...m,
          [hoveredGroupKey]: items.length > 0,
        }));
      })
      .catch(() => {
        itemsCache.current[hoveredGroupKey] = [];
        setGroupHasChildren((m) => ({ ...m, [hoveredGroupKey]: false }));
      })
      .finally(() => {
        setItemsLoading((m) => ({ ...m, [hoveredGroupKey]: false }));
      });
  }, [hoveredGroupKey, fetchNode]);

  const activeGroupKey =
    activeCatPath && activeGroupSlug
      ? `${activeCatPath}/${activeGroupSlug}`
      : null;
  const items = activeGroupKey ? itemsCache.current[activeGroupKey] ?? [] : [];
  const isItemLoading = activeGroupKey ? !!itemsLoading[activeGroupKey] : false;

  // Khi mở menu, reset về 1 cột (Category) mỗi lần mở mới
  const handleOpenEnter = () => {
    clearCloseTimer();
    // 🔒 Chỉ reset khi từ ĐÓNG → MỞ
    if (!open) {
      setOpen(true);
      setActiveCatPath(null);
      setActiveGroupSlug(null);
      setHoveredCatPath(null);
      setHoveredGroupKey(null);
    } else {
      setOpen(true);
    }
  };

  // Chỉ coi là "có cột Group hiển thị" khi THẬT SỰ có groups
  const activeHasGroups =
    !!activeCatPath && (groupsCache.current[activeCatPath]?.length ?? 0) > 0;

  // Chỉ coi là "có cột Item hiển thị" khi THẬT SỰ có items
  const activeHasItems = items.length > 0;
  const showItemsPanel = !!activeGroupKey && (activeHasItems || isItemLoading);

  // Panel width mở rộng đúng số cột đang có
  const CAT_W = 280,
    GROUP_W = 280,
    ITEM_W = 360,
    GAP = 12,
    PAD = 8; // px
  let panelWidth = CAT_W + PAD * 2;
  if (activeHasGroups) panelWidth += GAP + GROUP_W;
  if (showItemsPanel) panelWidth += GAP + ITEM_W;

  return (
    <div
      className="relative"
      onPointerEnter={handleOpenEnter}
      onPointerLeave={delayedClose}
      style={{ ["--tone-rgb" as any]: tone }}
    >
      <Link
        href="/products"
        className={`px-3 py-2 text-sm rounded-lg transition-colors
                    hover:bg-[rgba(var(--tone-rgb),0.10)]
                    hover:shadow-[0_8px_20px_-12px_rgba(var(--tone-rgb),0.35)]`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="font-semibold">{label}</span>
        <ChevronDown
          size={15}
          className={`ml-1 inline-block align-middle opacity-70 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </Link>

      {open && (
        <div
          role="menu"
          className="absolute left-0 mt-2 rounded-xl border bg-white shadow-xl ring-1 ring-black/5 p-2 transition-[width] duration-150 ease-out"
          style={{ width: panelWidth }}
          // ✅ Giữ mở khi chuột ở trong panel, tránh đóng rồi mở lại
          onPointerEnter={clearCloseTimer}
          onPointerLeave={delayedClose}
        >
          <div className="flex items-start gap-3">
            {/* COL 1: CATEGORY */}
            <div
              className="w-[280px] max-h-[60vh] overflow-auto overscroll-contain"
              onPointerLeave={() => setHoveredCatPath(null)}
            >
              <ul className="space-y-1">
                {categories?.map((c) => {
                  const href = {
                    pathname: "/products/[[...segments]]",
                    params: { segments: c.path.split("/") },
                  } as const;
                  const localizedTitle =
                    c.title_i18n?.[normalizedLocale] || c.title;

                  const isHovered = hoveredCatPath === c.path;
                  const showArrow = !!catHasChildren[c.path] && isHovered;

                  return (
                    <li key={c._id}>
                      <div
                        className="flex items-center justify-between gap-2"
                        onPointerEnter={() => {
                          setHoveredCatPath(c.path);
                          setActiveCatPath(c.path); // mở cột group (nếu có)
                          setActiveGroupSlug(null); // reset group
                        }}
                      >
                        <Link
                          href={href}
                          className={`block rounded-md truncate px-2 py-1.5 hover:bg-gray-50 border-l-2 ${
                            activeCatPath === c.path
                              ? "bg-gray-50 font-semibold border-[#05acfb]"
                              : "border-transparent hover:border-[#05acfb]"
                          }`}
                        >
                          {localizedTitle}
                        </Link>

                        {/* mũi tên cạnh title khi có con & đang hover */}
                        <ChevronRight
                          size={14}
                          className={`shrink-0 transition-all duration-150
                                      ${
                                        showArrow
                                          ? "opacity-100 translate-x-0"
                                          : "opacity-0 -translate-x-1"
                                      }`}
                          aria-hidden
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Divider dọc giữa Category → Group (chỉ hiện khi thật sự có group) */}
            {activeHasGroups && (
              <div className="self-stretch w-px bg-gray-200/90" aria-hidden />
            )}

            {/* COL 2: GROUP (chỉ hiện khi thật sự có group) */}
            {activeHasGroups && (
              <div
                className="w-[280px] max-h-[60vh] overflow-auto overscroll-contain"
                onPointerLeave={() => setHoveredGroupKey(null)}
              >
                <ul className="space-y-1">
                  {groups.map((g) => {
                    const href = {
                      pathname: "/products/[[...segments]]",
                      params: { segments: g.path.split("/") },
                    } as const;
                    const localizedTitle =
                      g.title_i18n?.[normalizedLocale] || g.title;

                    const key = `${activeCatPath}/${g.slug}`;
                    const isHovered = hoveredGroupKey === key;
                    const showArrow = !!groupHasChildren[key] && isHovered;

                    return (
                      <li key={g._id}>
                        <div
                          className="flex items-center justify-between gap-2"
                          onPointerEnter={() => {
                            setHoveredGroupKey(key);
                            setActiveGroupSlug(g.slug); // mở cột item (nếu có)
                          }}
                        >
                          <Link
                            href={href}
                            className={`block rounded-md truncate px-2 py-1.5 hover:bg-gray-50 border-l-2 ${
                              activeGroupSlug === g.slug
                                ? "bg-gray-50 font-semibold border-[#05acfb]"
                                : "border-transparent hover:border-[#05acfb]"
                            }`}
                          >
                            {localizedTitle}
                          </Link>

                          {/* mũi tên cạnh title khi group có items & đang hover */}
                          <ChevronRight
                            size={14}
                            className={`shrink-0 transition-all duration-150
                                        ${
                                          showArrow
                                            ? "opacity-100 translate-x-0"
                                            : "opacity-0 -translate-x-1"
                                        }`}
                            aria-hidden
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Divider dọc giữa Group → Item (chỉ hiện khi thật sự có item) */}
            {showItemsPanel && (
              <div className="self-stretch w-px bg-gray-200/90" aria-hidden />
            )}

            {/* COL 3: ITEM (chỉ hiện khi thật sự có item) */}
            {showItemsPanel && (
              <div className="w-[360px] max-h-[60vh] overflow-auto overscroll-contain">
                {activeHasItems ? (
                  <ul className="space-y-1">
                  {items.map((it) => (
                    <li key={it._id}>
                      <Link
                        href={{
                          pathname: "/products/[[...segments]]",
                          params: { segments: it.path.split("/") },
                        }}
                        className="block rounded-md truncate px-2 py-1.5 hover:bg-gray-50 border-l-2 border-transparent hover:border-[#05acfb]"
                      >
                        {it.title_i18n?.[normalizedLocale] || it.title}
                      </Link>
                    </li>
                  ))}
                  </ul>
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Loading items...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
