/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ProductNode } from "@/types/content";
import {
  useGetProductsAdminQuery,
  useGetRootCategoriesQuery,
  useGetChildrenQuery,
  useCreateProductNodeMutation,
  useUpdateProductNodeMutation,
  useDeleteProductNodeMutation,
  useUploadProductImagesMutation,
} from "@/services/admin.products";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

const slugifyLocal = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ä‘/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function rtqErrMsg(err: any) {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as any).status;
    const data = (err as any).data;
    const detail =
      typeof data === "string"
        ? data
        : data?.message || data?.error || JSON.stringify(data);
    return `(${status}) ${detail || "Request failed"}`;
  }
  return err?.message || "Unknown error";
}

type NodeType = "category" | "group" | "item";

type Editable = Partial<
  Pick<
    ProductNode,
    | "title"
    | "slug"
    | "type"
    | "parent"
    | "tagline"
    | "description"
    | "thumbnail"
    | "images"
    | "order"
    | "isPublished"
    | "specs"
  >
> & {
  // allow i18n fields used when creating/updating nodes
  title_i18n?:
    | { vi?: string; en?: string }
    | Record<string, string | undefined>;
  tagline_i18n?:
    | { vi?: string; en?: string }
    | Record<string, string | undefined>;
  description_i18n?:
    | { vi?: string; en?: string }
    | Record<string, string | undefined>;
};

function ImageGrid({
  images,
  onRemove,
  onAltChange,
}: {
  images: { url: string; alt?: string }[];
  onRemove?: (idx: number) => void;
  onAltChange?: (idx: number, alt: string) => void;
}) {
  if (!images?.length)
    return <div className="text-sm text-muted-foreground">ChÆ°a cÃ³ áº£nh</div>;
  return (
    <div className="grid grid-cols-3 gap-3">
      {images.map((img, idx) => (
        <div key={idx} className="relative border rounded-md p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.alt || ""}
            className="h-24 w-full object-cover rounded"
          />
          <input
            className="mt-1 w-full rounded border px-2 py-1 text-xs"
            placeholder="alt..."
            value={img.alt || ""}
            onChange={(e) => onAltChange?.(idx, e.target.value)}
          />
          {onRemove && (
            <button
              type="button"
              className="absolute right-1 top-1 rounded bg-white/80 px-1.5 text-xs shadow hover:bg-white"
              onClick={() => onRemove(idx)}
            >
              X
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ProductsAdminPage() {
  // -------- List filters --------
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(12);
  const [q, setQ] = React.useState("");
  const [fType, setFType] = React.useState<NodeType | "all">("all");
  const [fParent, setFParent] = React.useState<string>("");

  const { data, isFetching, refetch } = useGetProductsAdminQuery({
    page,
    limit,
    q: q.trim() || undefined,
    type: fType === "all" ? undefined : (fType as any),
    parent: fParent || undefined,
    sort: "order,title",
  });

  const total = data?.total ?? 0;
  const hasPrev = page > 1;
  const hasNext = page * limit < total;

  // -------- Parent sources for create/edit --------
  const { data: rootCats } = useGetRootCategoriesQuery();
  const [catForGroup, setCatForGroup] = React.useState<string>("");
  const [catForItem, setCatForItem] = React.useState<string>("");
  const { data: groupsOfCat } = useGetChildrenQuery(
    { parent: catForItem || "none", type: "group" },
    { skip: !catForItem }
  );
  // Fallback via list API in case /products/children is unavailable
  const { data: groupsList } = useGetProductsAdminQuery(
    {
      parent: catForItem || undefined,
      type: "group",
      limit: 200,
      sort: "order",
    },
    { skip: !catForItem }
  );

  // -------- Mutations --------
  const [createNode, { isLoading: creating }] = useCreateProductNodeMutation();
  const [updateNode] = useUpdateProductNodeMutation();
  const [deleteNode] = useDeleteProductNodeMutation();
  const [uploadImages, { isLoading: uploading }] =
    useUploadProductImagesMutation();

  // -------- Create form --------
  const [cType, setCType] = React.useState<NodeType>("category");
  const [titleVi, setTitleVi] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [order, setOrder] = React.useState<number>(0);
  const [isPublished, setIsPublished] = React.useState(true);
  const [taglineVi, setTaglineVi] = React.useState("");
  const [taglineEn, setTaglineEn] = React.useState("");
  const [descVi, setDescVi] = React.useState("");
  const [descEn, setDescEn] = React.useState("");

  const [thumbFile, setThumbFile] = React.useState<File | null>(null);
  const [thumbUrl, setThumbUrl] = React.useState("");
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [gallery, setGallery] = React.useState<{ url: string; alt?: string }[]>(
    []
  );

  const [specs, setSpecs] = React.useState<{
    material?: string;
    dimensions_cm?: string;
    usable_depth_cm?: string;
    weight_kg?: string;
  }>({});

  React.useEffect(() => {
    const source = titleVi || titleEn || "";
    setSlug(slugifyLocal(source));
  }, [titleVi, titleEn]);

  // For item parent group selection
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("");

  const baseCreateTitle = titleVi || titleEn;
  const canCreate =
    !!baseCreateTitle &&
    !!(slug?.trim() || slugifyLocal(baseCreateTitle)) &&
    (cType === "category" ||
      (cType === "group" && !!catForGroup) ||
      (cType === "item" && !!catForItem && !!selectedGroupId)) &&
    !creating &&
    !uploading;

  async function uploadThumbIfNeeded() {
    if (!thumbFile) return thumbUrl || undefined;
    const up = await uploadImages({
      files: [thumbFile],
      folder: "products",
    }).unwrap();
    const first = up?.[0]?.url;
    if (!first) throw new Error("Upload thumbnail thất bại");
    setThumbUrl(first);
    return first;
  }
  async function uploadGalleryIfNeeded() {
    if (!galleryFiles.length) return gallery;
    const selected = [...galleryFiles];
    const up = await uploadImages({
      files: selected,
      folder: "products",
    }).unwrap();
    const more = up.map((u, i) => {
      const name = selected[i]?.name || "";
      const base = name.replace(/\.[^.]+$/, "");
      return { url: u.url, alt: base || titleVi || titleEn || "" };
    });
    setGallery((g) => [...g, ...more]);
    setGalleryFiles([]);
    return [...gallery, ...more];
  }

  async function handleCreate() {
    try {
      const baseTitle = titleVi || titleEn || "";
      const finalSlug = (slug?.trim() || slugifyLocal(baseTitle)).toLowerCase();
      const finalThumb = await uploadThumbIfNeeded();
      const finalGallery = await uploadGalleryIfNeeded();

      let parent: string | null | undefined = null;
      if (cType === "group") parent = catForGroup;
      if (cType === "item") parent = selectedGroupId;

      const title_i18n =
        titleVi || titleEn
          ? { vi: titleVi || undefined, en: titleEn || undefined }
          : undefined;

      const tagline_i18n =
        taglineVi || taglineEn
          ? { vi: taglineVi || undefined, en: taglineEn || undefined }
          : undefined;

      const description_i18n =
        descVi || descEn
          ? { vi: descVi || undefined, en: descEn || undefined }
          : undefined;

      await createNode({
        title: baseTitle,
        title_i18n,
        type: cType,
        slug: finalSlug,
        parent: parent || null,
        // KHÔNG gửi field thường tagline/description nữa
        tagline_i18n,
        description_i18n,
        thumbnail: finalThumb || undefined,
        images: finalGallery || undefined,
        order,
        isPublished,
        specs: cType === "item" ? specs : undefined,
      } as any).unwrap();

      // reset
      setTitleVi("");
      setTitleEn("");
      setSlug("");
      setTaglineVi("");
      setTaglineEn("");
      setDescVi("");
      setDescEn("");
      setOrder(0);
      setIsPublished(true);
      setThumbFile(null);
      setThumbUrl("");
      setGalleryFiles([]);
      setGallery([]);
      setSpecs({});
      setCatForGroup("");
      setCatForItem("");
      setSelectedGroupId("");
      refetch();
      toast.success("Tạo node sản phẩm thành công");
    } catch (e: any) {
      console.error("CREATE_PRODUCT_ERROR", e);
      toast.error(rtqErrMsg(e));
    }
  }

  // -------- Edit dialog --------
  const [editing, setEditing] = React.useState<ProductNode | null>(null);
  const [edit, setEdit] = React.useState<Editable | null>(null);
  const [editThumbFile, setEditThumbFile] = React.useState<File | null>(null);
  const [editGalleryFiles, setEditGalleryFiles] = React.useState<File[]>([]);
  const [pendingDelete, setPendingDelete] = React.useState<ProductNode | null>(
    null
  );
  const [editTitleVi, setEditTitleVi] = React.useState("");
  const [editTitleEn, setEditTitleEn] = React.useState("");
  const [editTaglineVi, setEditTaglineVi] = React.useState("");
  const [editTaglineEn, setEditTaglineEn] = React.useState("");
  const [editDescVi, setEditDescVi] = React.useState("");
  const [editDescEn, setEditDescEn] = React.useState("");

  function openEdit(n: ProductNode) {
    setEditing(n);
    const titleViValue = (n as any)?.title_i18n?.vi ?? n.title ?? "";
    const titleEnValue = (n as any)?.title_i18n?.en ?? "";
    setEdit({
      title: titleViValue || titleEnValue || n.title,
      slug: n.slug,
      type: n.type,
      parent: (n as any).parent || null,
      // KHÔNG dùng n.tagline / n.description làm nguồn chính
      thumbnail: n.thumbnail,
      images: n.images || [],
      order: (n as any).order ?? 0,
      isPublished: n.isPublished,
      specs: n.specs,
    });

    const tVi = (n as any)?.tagline_i18n?.vi ?? (n as any).tagline ?? "";
    const tEn = (n as any)?.tagline_i18n?.en ?? "";
    const dVi =
      (n as any)?.description_i18n?.vi ?? (n as any).description ?? "";
    const dEn = (n as any)?.description_i18n?.en ?? "";

    setEditTitleVi(titleViValue);
    setEditTitleEn(titleEnValue);
    setEditTaglineVi(tVi);
    setEditTaglineEn(tEn);
    setEditDescVi(dVi);
    setEditDescEn(dEn);

    setEditThumbFile(null);
    setEditGalleryFiles([]);
  }

  async function applyEditUploads() {
    if (!edit) return;
    if (editThumbFile) {
      const up = await uploadImages({
        files: [editThumbFile],
        folder: "products",
      }).unwrap();
      const first = up?.[0]?.url;
      if (!first) throw new Error("Upload thumbnail thất bại");
      setEdit({ ...edit, thumbnail: first });
      setEditThumbFile(null);
      toast.success("Đã cập nhật thumbnail");
    }
    if (editGalleryFiles.length) {
      const selected = [...editGalleryFiles];
      const up = await uploadImages({
        files: selected,
        folder: "products",
      }).unwrap();
      const more = up.map((u, i) => {
        const name = selected[i]?.name || "";
        const base = name.replace(/\.[^.]+$/, "");
        const fallback = (edit.title as string) || "";
        return { url: u.url, alt: base || fallback };
      });
      setEdit({ ...edit, images: [...(edit.images || []), ...more] });
      setEditGalleryFiles([]);
      toast.success("Đã thêm ảnh");
    }
  }

  async function saveEdit() {
    if (!editing || !edit) return;
    try {
      const title_i18n =
        editTitleVi || editTitleEn
          ? { vi: editTitleVi || undefined, en: editTitleEn || undefined }
          : undefined;
      const baseTitle =
        editTitleVi ||
        editTitleEn ||
        (edit.title as string) ||
        editing.title ||
        "";
      const tagline_i18n =
        editTaglineVi || editTaglineEn
          ? { vi: editTaglineVi || undefined, en: editTaglineEn || undefined }
          : undefined;

      const description_i18n =
        editDescVi || editDescEn
          ? { vi: editDescVi || undefined, en: editDescEn || undefined }
          : undefined;

      const patch: Editable = {
        ...edit,
        title: baseTitle,
        slug: (edit.slug?.trim() || slugifyLocal(baseTitle)).toLowerCase(),
        title_i18n,
        tagline_i18n,
        description_i18n,
      };
      await updateNode({ id: editing._id, patch }).unwrap();

      setEditing(null);
      refetch();
      toast.success("Đã cập nhật sản phẩm");
    } catch (e) {
      toast.error(rtqErrMsg(e));
    }
  }

  async function removeRow(n: ProductNode) {
    setPendingDelete(n);
  }

  async function togglePublish(row: ProductNode, v: boolean) {
    try {
      await updateNode({ id: row._id, patch: { isPublished: v } }).unwrap();
      refetch();
      toast.success("Đã cập nhật hiển thị");
    } catch (e: any) {
      toast.error(rtqErrMsg(e));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Quản lý Products</h1>
        <p className="text-sm text-muted-foreground">
          Phân cấp category → group → item. Tạo/sửa/xoá, upload thumbnail &
          gallery, specs cho item.
        </p>
      </div>

      <Separator />

      {/* Create */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="grid gap-2">
          <Label>Loại node</Label>
          <Select
            value={cType}
            onValueChange={(v: string) => {
              setCType(v as NodeType);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">category</SelectItem>
              <SelectItem value="group">group</SelectItem>
              <SelectItem value="item">item</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {cType === "group" && (
          <div className="grid gap-2">
            <Label>Thêm category</Label>
            <Select value={catForGroup} onValueChange={setCatForGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn category" />
              </SelectTrigger>
              <SelectContent>
                {(rootCats || []).map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {cType === "item" && (
          <>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={catForItem}
                onValueChange={(v: string) => {
                  setCatForItem(v);
                  setSelectedGroupId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn category" />
                </SelectTrigger>
                <SelectContent>
                  {(rootCats || []).map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {catForItem
              ? (() => {
                  const availableGroups = (
                    groupsOfCat && groupsOfCat.length
                      ? groupsOfCat
                      : ((groupsList?.items || []) as any[]).filter(
                          (g: any) => (g as any).parent === catForItem
                        )
                  ) as any[];

                  if (!availableGroups.length) {
                    return (
                      <div className="grid gap-1">
                        <Label>Group</Label>
                        <div className="text-sm text-muted-foreground">
                          Chưa có group cho category đã chọn
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="grid gap-2">
                      <Label>Group</Label>
                      <Select
                        value={selectedGroupId}
                        onValueChange={setSelectedGroupId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn group" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableGroups.map((g) => (
                            <SelectItem key={g._id} value={g._id}>
                              {g.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })()
              : null}
          </>
        )}

        <div className="grid gap-2">
          <Label>Slug</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="green-play / dong-gpjp / dong-kidzone"
          />
        </div>
        <div className="grid gap-2">
          <Label>Order</Label>
          <Input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value || 0))}
          />
        </div>
        <div className="flex items-center gap-2 mt-7">
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          <span>Published</span>
        </div>

        <div className="grid gap-3 lg:col-span-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-base font-semibold">
              Title, Tagline & Description
            </Label>
            <span className="text-xs text-muted-foreground">
              Gồm 2 ngôn ngữ EN & VI
            </span>
          </div>
          <Tabs defaultValue="vi" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>
            <TabsContent value="vi" className="mt-3 space-y-3">
              <div className="grid gap-1.5">
                <Label>Tiêu đề (VI)</Label>
                <Input
                  value={titleVi}
                  onChange={(e) => setTitleVi(e.target.value)}
                  placeholder="Green Play / Dòng GPJP / Kidzone..."
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Tagline (VI)</Label>
                <Input
                  value={taglineVi}
                  onChange={(e) => setTaglineVi(e.target.value)}
                  placeholder="Giải pháp thiết bị sân chơi toàn diện"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Mô tả (VI)</Label>
                <textarea
                  value={descVi}
                  onChange={(e) => setDescVi(e.target.value)}
                  className="min-h-28 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Mô tả dài bằng tiếng Việt…"
                />
              </div>
            </TabsContent>
            <TabsContent value="en" className="mt-3 space-y-3">
              <div className="grid gap-1.5">
                <Label>Title (EN)</Label>
                <Input
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Green Play / GPJP line / Kidzone..."
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Tagline (EN)</Label>
                <Input
                  value={taglineEn}
                  onChange={(e) => setTaglineEn(e.target.value)}
                  placeholder="Integrated playground solutions"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Description (EN)</Label>
                <textarea
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  className="min-h-28 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Long description in Englishâ€¦"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="grid gap-2">
          <Label>Thumbnail</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
          />
          {thumbFile ? (
            <div className="text-xs text-muted-foreground mt-1">
              Đã chọn: {thumbFile.name}
            </div>
          ) : null}
        </div>
        <div className="grid gap-2 lg:col-span-2">
          <Label>Gallery (nhiều ảnh)</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
          />
          <div className="text-xs text-muted-foreground">
            {galleryFiles.length
              ? `${galleryFiles.length} file đã chọn`
              : "Chưa chọn file"}
          </div>
        </div>

        {cType === "item" && (
          <div className="grid gap-2 lg:col-span-3">
            <Label>Specs</Label>
            <div className="grid gap-3 md:grid-cols-4">
              <Input
                placeholder="Material"
                value={specs.material || ""}
                onChange={(e) =>
                  setSpecs({ ...specs, material: e.target.value })
                }
              />
              <Input
                placeholder="Dimensions (cm)"
                value={specs.dimensions_cm || ""}
                onChange={(e) =>
                  setSpecs({ ...specs, dimensions_cm: e.target.value })
                }
              />
              <Input
                placeholder="Usable depth (cm)"
                value={specs.usable_depth_cm || ""}
                onChange={(e) =>
                  setSpecs({ ...specs, usable_depth_cm: e.target.value })
                }
              />
              <Input
                placeholder="Weight (kg)"
                value={specs.weight_kg || ""}
                onChange={(e) =>
                  setSpecs({ ...specs, weight_kg: e.target.value })
                }
              />
            </div>
          </div>
        )}

        <div className="lg:col-span-3">
          <Button onClick={handleCreate} disabled={!canCreate}>
            {creating || uploading ? "Đang tạo..." : "Tạo node"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm">Loại</Label>
          <Select
            value={fType}
            onValueChange={(v: any) => {
              setFType(v as any);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Loáº¡i" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="category">category</SelectItem>
              <SelectItem value="group">group</SelectItem>
              <SelectItem value="item">item</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Tìm kiếm</Label>
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="title / slug / descriptionâ€¦"
            className="w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Parent ID</Label>
          <Input
            value={fParent}
            onChange={(e) => {
              setFParent(e.target.value);
              setPage(1);
            }}
            placeholder="(tùy chọn) lọc theo parent ObjectId"
            className="w-64"
          />
        </div>
      </div>

      {/* List */}
      <div className="rounded-md border mt-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Ảnh</TableHead>
              <TableHead>Hiển thị</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={8}>Đang tải…</TableCell>
              </TableRow>
            ) : data?.items?.length ? (
              data.items.map((row) => (
                <TableRow key={row._id}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell className="uppercase text-xs">
                    {row.type}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.slug}
                  </TableCell>
                  <TableCell className="text-xs">
                    {(row as any).path || "—"}
                  </TableCell>
                  <TableCell>{(row as any).order ?? 0}</TableCell>
                  <TableCell>{row.images?.length || 0}</TableCell>
                  <TableCell>
                    <Switch
                      checked={row.isPublished}
                      onCheckedChange={(v) => togglePublish(row, v)}
                    />
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(row)}
                    >
                      Sửa
                    </Button>
                    <a
                      className="text-primary underline text-sm ml-2"
                      href={`${BASE}/products/${row.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      xem API
                    </a>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRow(row)}
                    >
                      Xoá
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>Chưa có node</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Tổng: {total} — Trang {page}/
          {Math.max(1, Math.ceil((total || 0) / (limit || 1)))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trang trước
          </Button>
          <Button
            variant="outline"
            disabled={!hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
          </Button>
          <Input
            type="number"
            value={limit}
            onChange={(e) => {
              setLimit(Math.max(1, Number(e.target.value) || 1));
              setPage(1);
            }}
            className="w-20"
          />
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog.Root
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[94vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-5 shadow-2xl max-h-[85vh] overflow-hidden">
            <Dialog.Title className="text-base font-semibold">
              Cập nhật sản phẩm
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Cập nhật thông tin chi tiết cho sản phẩm đang chọn.
            </Dialog.Description>

            {edit && (
              <div className="mt-4 max-h-[65vh] overflow-y-auto pr-1">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Tiêu đề</Label>
                    <Input
                      value={edit.title || ""}
                      onChange={(e) =>
                        setEdit({ ...edit, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Slug</Label>
                    <Input
                      value={edit.slug || ""}
                      onChange={(e) =>
                        setEdit({ ...edit, slug: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={Number((edit.order as any) ?? 0)}
                      onChange={(e) =>
                        setEdit({ ...edit, order: Number(e.target.value || 0) })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!edit.isPublished}
                      onCheckedChange={(v) =>
                        setEdit({ ...edit, isPublished: v })
                      }
                    />
                    <span>Published</span>
                  </div>

                  {/* Title, Tagline & description i18n */}
                  <div className="grid gap-3 md:col-span-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <Label className="text-base font-semibold">
                        Title, Tagline & Description
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        2 ngôn ngữ
                      </span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Tiếng Việt - Tiêu đề
                        </Label>
                        <Input
                          value={editTitleVi}
                          onChange={(e) => setEditTitleVi(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          English - Title
                        </Label>
                        <Input
                          value={editTitleEn}
                          onChange={(e) => setEditTitleEn(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Tiếng Việt - Tagline
                        </Label>
                        <Input
                          value={editTaglineVi}
                          onChange={(e) => setEditTaglineVi(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          English - Tagline
                        </Label>
                        <Input
                          value={editTaglineEn}
                          onChange={(e) => setEditTaglineEn(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Tiếng Việt - Mô tả
                        </Label>
                        <textarea
                          value={editDescVi}
                          onChange={(e) => setEditDescVi(e.target.value)}
                          className="min-h-28 w-full rounded-md border px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          English - Description
                        </Label>
                        <textarea
                          value={editDescEn}
                          onChange={(e) => setEditDescEn(e.target.value)}
                          className="min-h-28 w-full rounded-md border px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail & Gallery */}
                  <div className="grid gap-2">
                    <Label>Thumbnail hiện tại</Label>
                    {edit.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={edit.thumbnail}
                        alt="thumb"
                        className="h-24 w-36 object-cover rounded border"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">â€”</div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setEditThumbFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                  <div className="md:col-span-1" />

                  <div className="md:col-span-2">
                    <Label>Gallery</Label>
                    <div className="mt-2">
                      <ImageGrid
                        images={edit.images || []}
                        onRemove={(idx) => {
                          const next = [...(edit.images || [])];
                          next.splice(idx, 1);
                          setEdit({ ...edit, images: next });
                        }}
                        onAltChange={(idx, alt) => {
                          const next = [...(edit.images || [])];
                          if (next[idx])
                            next[idx] = { ...next[idx], alt } as any;
                          setEdit({ ...edit, images: next });
                        }}
                      />
                    </div>
                    <div className="mt-2 grid gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          setEditGalleryFiles(Array.from(e.target.files || []))
                        }
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={applyEditUploads}
                          disabled={!editThumbFile && !editGalleryFiles.length}
                        >
                          Upload thumbnail / ảnh mới
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          {editThumbFile
                            ? `Thumb: ${editThumbFile.name}`
                            : null}
                          {editGalleryFiles.length
                            ? ` | ${editGalleryFiles.length} áº£nh`
                            : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specs (chá»‰ há»¯u Ã­ch cho item) */}
                  {edit.type === "item" && (
                    <div className="grid gap-2 md:col-span-2">
                      <Label>Specs</Label>
                      <div className="grid gap-3 md:grid-cols-4">
                        <Input
                          placeholder="Material"
                          value={edit.specs?.material || ""}
                          onChange={(e) =>
                            setEdit({
                              ...edit,
                              specs: {
                                ...(edit.specs || {}),
                                material: e.target.value,
                              },
                            })
                          }
                        />
                        <Input
                          placeholder="Dimensions (cm)"
                          value={edit.specs?.dimensions_cm || ""}
                          onChange={(e) =>
                            setEdit({
                              ...edit,
                              specs: {
                                ...(edit.specs || {}),
                                dimensions_cm: e.target.value,
                              },
                            })
                          }
                        />
                        <Input
                          placeholder="Usable depth (cm)"
                          value={edit.specs?.usable_depth_cm || ""}
                          onChange={(e) =>
                            setEdit({
                              ...edit,
                              specs: {
                                ...(edit.specs || {}),
                                usable_depth_cm: e.target.value,
                              },
                            })
                          }
                        />
                        <Input
                          placeholder="Weight (kg)"
                          value={edit.specs?.weight_kg || ""}
                          onChange={(e) =>
                            setEdit({
                              ...edit,
                              specs: {
                                ...(edit.specs || {}),
                                weight_kg: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">Đóng</Button>
              </Dialog.Close>
              <Button onClick={saveEdit}>Lưu thay đổi</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete confirmation dialog */}
      <Dialog.Root
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-5 shadow-2xl">
            <Dialog.Title className="text-base font-semibold">
              Xác nhận xoá
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xoá
              {pendingDelete ? ` “${pendingDelete.title}”` : " mục này"}? Thao
              tác này không thể hoàn tác.
            </Dialog.Description>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">Huỷ</Button>
              </Dialog.Close>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!pendingDelete) return;
                  try {
                    await deleteNode(pendingDelete._id).unwrap();
                    setPendingDelete(null);
                    refetch();
                    toast.success("Đã xoá");
                  } catch (e: any) {
                    toast.error(rtqErrMsg(e));
                  }
                }}
              >
                Xoá
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
