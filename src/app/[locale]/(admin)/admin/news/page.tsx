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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { News } from "@/types/content";
import {
  useGetNewsAdminQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  useUploadNewsImagesMutation,
} from "@/services/admin.news";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

const slugifyLocal = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
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

function isoToLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function localInputToISO(val?: string) {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

type Editable = Partial<
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
  >
> & {
  title_i18n?: Record<string, string | undefined>;
  excerpt_i18n?: Record<string, string | undefined>;
  content_i18n?: Record<string, string | undefined>;
};

function ImageGrid({
  images,
  onRemove,
}: {
  images: { url: string; alt?: string }[];
  onRemove?: (idx: number) => void;
}) {
  if (!images?.length)
    return <div className="text-sm text-muted-foreground">Chưa có ảnh</div>;
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
            onChange={(e) => {
              if (!onRemove) return;
              // we'll handle in parent via wrapping callback; here we emit none
            }}
            readOnly
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

export default function NewsAdminPage() {
  // Query state
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [q, setQ] = React.useState("");

  const { data, isFetching, refetch } = useGetNewsAdminQuery({
    page,
    limit,
    q: q.trim() || undefined,
    sort: "-publishedAt,-createdAt",
  });

  const [createNews, { isLoading: creating }] = useCreateNewsMutation();
  const [updateNews] = useUpdateNewsMutation();
  const [deleteNews] = useDeleteNewsMutation();
  const [uploadImages, { isLoading: uploading }] =
    useUploadNewsImagesMutation();

  // -------- Create form state --------
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [content, setContent] = React.useState("");
  const [titleVi, setTitleVi] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [excerptVi, setExcerptVi] = React.useState("");
  const [excerptEn, setExcerptEn] = React.useState("");
  const [contentVi, setContentVi] = React.useState("");
  const [contentEn, setContentEn] = React.useState("");
  const [author, setAuthor] = React.useState("Hasake");
  const [isPublished, setIsPublished] = React.useState(true);
  const [publishedAtLocal, setPublishedAtLocal] = React.useState<string>("");

  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [coverUrl, setCoverUrl] = React.useState<string>("");
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [gallery, setGallery] = React.useState<{ url: string; alt?: string }[]>(
    []
  );

  React.useEffect(() => {
    if (!slug) {
      setSlug(slugifyLocal(title));
    }
  }, [title, slug]);

  React.useEffect(() => {
    if (!title && !titleVi && titleEn) {
      setTitle(titleEn);
    }
  }, [titleEn, titleVi, title]);

  const baseTitleValue = (titleVi || titleEn || title || "").trim();
  const baseContentValue = (contentVi || contentEn || content || "").trim();
  const canCreate =
    !!baseTitleValue &&
    !!(slug?.trim() || slugifyLocal(baseTitleValue)) &&
    !!baseContentValue &&
    !creating &&
    !uploading;

  async function uploadCoverIfNeeded() {
    if (!coverFile) return coverUrl || undefined;
    const up = await uploadImages({
      files: [coverFile],
      folder: "news",
    }).unwrap();
    const first = up?.[0]?.url;
    if (!first) throw new Error("Upload cover thất bại");
    setCoverUrl(first);
    return first;
  }
  async function uploadGalleryIfNeeded() {
    if (!galleryFiles.length) return gallery;
    const up = await uploadImages({
      files: galleryFiles,
      folder: "news",
    }).unwrap();
    const more = up.map((u) => ({ url: u.url, alt: "" }));
    setGallery((g) => [...g, ...more]);
    setGalleryFiles([]);
    return [...gallery, ...more];
  }

  async function handleCreate() {
    try {
      const resolvedTitle = titleVi || titleEn || title;
      const resolvedExcerpt = excerptVi || excerptEn || excerpt;
      const resolvedContent = contentVi || contentEn || content;
      const finalSlug = (
        slug?.trim() || slugifyLocal(resolvedTitle || "")
      ).toLowerCase();
      const finalCover = await uploadCoverIfNeeded();
      const finalGallery = await uploadGalleryIfNeeded();

      let finalPublishedAt = localInputToISO(publishedAtLocal);
      if (isPublished && !finalPublishedAt)
        finalPublishedAt = new Date().toISOString();

      const title_i18n =
        titleVi || titleEn
          ? { vi: titleVi || undefined, en: titleEn || undefined }
          : undefined;
      const excerpt_i18n =
        excerptVi || excerptEn
          ? { vi: excerptVi || undefined, en: excerptEn || undefined }
          : undefined;
      const content_i18n =
        contentVi || contentEn
          ? { vi: contentVi || undefined, en: contentEn || undefined }
          : undefined;

      await createNews({
        title: resolvedTitle,
        slug: finalSlug,
        excerpt: resolvedExcerpt || undefined,
        content: resolvedContent,
        cover: finalCover,
        images: finalGallery,
        author: author || undefined,
        isPublished,
        publishedAt: finalPublishedAt,
        title_i18n,
        excerpt_i18n,
        content_i18n,
      }).unwrap();

      // reset
      setTitle("");
      setTitleVi("");
      setTitleEn("");
      setSlug("");
      setExcerpt("");
      setExcerptVi("");
      setExcerptEn("");
      setContent("");
      setContentVi("");
      setContentEn("");
      setAuthor("Hasake");
      setIsPublished(true);
      setPublishedAtLocal("");
      setCoverFile(null);
      setCoverUrl("");
      setGalleryFiles([]);
      setGallery([]);
      refetch();
      toast.success("Tạo bài viết thành công");
    } catch (e: any) {
      console.error("CREATE_NEWS_ERROR", e);
      toast.error(rtqErrMsg(e));
    }
  }

  // -------- Edit dialog --------
  const [editing, setEditing] = React.useState<News | null>(null);
  const [edit, setEdit] = React.useState<Editable | null>(null);
  const [editCoverFile, setEditCoverFile] = React.useState<File | null>(null);
  const [editGalleryFiles, setEditGalleryFiles] = React.useState<File[]>([]);
  const [editPublishedAtLocal, setEditPublishedAtLocal] =
    React.useState<string>("");
  const [pendingDelete, setPendingDelete] = React.useState<News | null>(null);
  const [editTitleVi, setEditTitleVi] = React.useState("");
  const [editTitleEn, setEditTitleEn] = React.useState("");
  const [editExcerptVi, setEditExcerptVi] = React.useState("");
  const [editExcerptEn, setEditExcerptEn] = React.useState("");
  const [editContentVi, setEditContentVi] = React.useState("");
  const [editContentEn, setEditContentEn] = React.useState("");

  function openEdit(n: News) {
    setEditing(n);
    const titleViValue = n.title_i18n?.vi ?? n.title ?? "";
    const titleEnValue = n.title_i18n?.en ?? "";
    const excerptViValue = n.excerpt_i18n?.vi ?? n.excerpt ?? "";
    const excerptEnValue = n.excerpt_i18n?.en ?? "";
    const contentViValue = n.content_i18n?.vi ?? n.content ?? "";
    const contentEnValue = n.content_i18n?.en ?? "";
    setEdit({
      title: titleViValue || titleEnValue || n.title,
      slug: n.slug,
      excerpt: excerptViValue || excerptEnValue || n.excerpt,
      content: contentViValue || contentEnValue || n.content,
      cover: n.cover,
      images: n.images || [],
      author: n.author,
      isPublished: n.isPublished,
      publishedAt: n.publishedAt,
    });
    setEditTitleVi(titleViValue);
    setEditTitleEn(titleEnValue);
    setEditExcerptVi(excerptViValue);
    setEditExcerptEn(excerptEnValue);
    setEditContentVi(contentViValue);
    setEditContentEn(contentEnValue);
    setEditPublishedAtLocal(isoToLocalInput(n.publishedAt));
    setEditCoverFile(null);
    setEditGalleryFiles([]);
  }

  async function applyEditUploads() {
    if (!edit) return;
    // cover
    if (editCoverFile) {
      const up = await uploadImages({
        files: [editCoverFile],
        folder: "news",
      }).unwrap();
      const first = up?.[0]?.url;
      if (!first) throw new Error("Upload cover thất bại");
      setEdit({ ...edit, cover: first });
      setEditCoverFile(null);
      toast.success("Đã cập nhật cover");
    }
    // gallery
    if (editGalleryFiles.length) {
      const up = await uploadImages({
        files: editGalleryFiles,
        folder: "news",
      }).unwrap();
      const more = up.map((u) => ({ url: u.url, alt: "" }));
      setEdit({ ...edit, images: [...(edit.images || []), ...more] });
      setEditGalleryFiles([]);
      toast.success("Đã thêm ảnh");
    }
  }

  async function saveEdit() {
    if (!editing || !edit) return;
    try {
      let publishedAtISO = localInputToISO(editPublishedAtLocal);
      if (edit.isPublished && !publishedAtISO)
        publishedAtISO = new Date().toISOString();

      const title_i18n =
        editTitleVi || editTitleEn
          ? { vi: editTitleVi || undefined, en: editTitleEn || undefined }
          : undefined;
      const excerpt_i18n =
        editExcerptVi || editExcerptEn
          ? { vi: editExcerptVi || undefined, en: editExcerptEn || undefined }
          : undefined;
      const content_i18n =
        editContentVi || editContentEn
          ? { vi: editContentVi || undefined, en: editContentEn || undefined }
          : undefined;

      const resolvedTitle = editTitleVi || editTitleEn || edit.title || "";
      const resolvedExcerpt =
        editExcerptVi || editExcerptEn || edit.excerpt || "";
      const resolvedContent =
        editContentVi || editContentEn || edit.content || "";

      const patch: Editable = {
        ...edit,
        slug: (edit.slug?.trim() || slugifyLocal(resolvedTitle)).toLowerCase(),
        publishedAt: publishedAtISO,
        title: resolvedTitle,
        excerpt: resolvedExcerpt || undefined,
        content: resolvedContent,
        title_i18n,
        excerpt_i18n,
        content_i18n,
      };
      await updateNews({ id: editing._id, patch }).unwrap();
      setEditing(null);
      refetch();
      toast.success("Da cap nhat bai viet");
    } catch (e: any) {
      toast.error(rtqErrMsg(e));
    }
  }
  async function removeRow(n: News) {
    if (!confirm(`Xoá "${n.title}"?`)) return;
    try {
      await deleteNews(n._id).unwrap();
      refetch();
      toast.success("Đã xoá bài viết");
    } catch (e: any) {
      toast.error(rtqErrMsg(e));
    }
  }

  async function togglePublish(row: News, v: boolean) {
    try {
      const patch: Editable = { isPublished: v };
      if (v && !row.publishedAt) patch.publishedAt = new Date().toISOString();
      await updateNews({ id: row._id, patch }).unwrap();
      refetch();
      toast.success("Đã cập nhật hiển thị");
    } catch (e: any) {
      toast.error(rtqErrMsg(e));
    }
  }

  const busyCreate = creating || uploading;

  const total = data?.total ?? 0;
  const hasPrev = page > 1;
  const hasNext = page * limit < total;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Quản lý News</h1>
        <p className="text-sm text-muted-foreground">
          Tạo/sửa/xoá tin tức, upload cover & gallery, bật/tắt publish, đặt ngày
          xuất bản.
        </p>
      </div>

      <Separator />

      {/* Tạo mới */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="grid gap-3 lg:col-span-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-base font-semibold">Titles & content</Label>
            <span className="text-xs text-muted-foreground">Supports VI / EN</span>
          </div>
          <Tabs defaultValue="vi" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vi">Vietnamese</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>
            <TabsContent value="vi" className="mt-3 space-y-3">
              <div className="grid gap-1.5">
                <Label>Title (VI)</Label>
                <Input
                  value={titleVi}
                  onChange={(e) => {
                    setTitleVi(e.target.value);
                    setTitle(e.target.value);
                  }}
                  placeholder="Tiêu đề tiếng Việt"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Excerpt (VI)</Label>
                <textarea
                  value={excerptVi}
                  onChange={(e) => {
                    setExcerptVi(e.target.value);
                    setExcerpt(e.target.value);
                  }}
                  className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Mô tả ngắn tiếng Việt"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Content (VI)</Label>
                <textarea
                  value={contentVi}
                  onChange={(e) => {
                    setContentVi(e.target.value);
                    setContent(e.target.value);
                  }}
                  className="min-h-32 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Nội dung tiếng Việt"
                />
              </div>
            </TabsContent>
            <TabsContent value="en" className="mt-3 space-y-3">
              <div className="grid gap-1.5">
                <Label>Title (EN)</Label>
                <Input
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Playground equipment for kids"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Excerpt (EN)</Label>
                <textarea
                  value={excerptEn}
                  onChange={(e) => setExcerptEn(e.target.value)}
                  className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Short summary in English"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Content (EN)</Label>
                <textarea
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  className="min-h-32 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Main content in English"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>{" "}
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="thiet-bi-vui-choi-danh-cho-tre-em"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="author">Tác giả</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Hasake"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="publishedAt">Ngày xuất bản</Label>
          <Input
            id="publishedAt"
            type="datetime-local"
            value={publishedAtLocal}
            onChange={(e) => setPublishedAtLocal(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 mt-7">
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          <span>Published</span>
        </div>
        <div className="grid gap-2 lg:col-span-3">
          <Label>Mô tả ngắn</Label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Với tiêu chí trẻ em làm trung tâm…"
          />
        </div>
        <div className="grid gap-2 lg:col-span-3">
          <Label>Nội dung</Label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Bạn đang mong muốn có một nơi tuyệt vời cho trẻ em của bạn…"
          />
        </div>
        <div className="grid gap-2">
          <Label>Ảnh cover</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
          {coverFile ? (
            <div className="text-xs text-muted-foreground mt-1">
              Đã chọn: {coverFile.name}
            </div>
          ) : coverUrl ? (
            <div className="text-xs text-muted-foreground mt-1">
              Đang dùng URL: {coverUrl}
            </div>
          ) : null}
        </div>
        <div className="grid gap-2 lg:col-span-2">
          <Label>Ảnh gallery (có thể chọn nhiều)</Label>
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
        <div className="lg:col-span-3">
          <Button onClick={handleCreate} disabled={!canCreate}>
            {busyCreate ? "Đang tạo..." : "Tạo bài viết"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm">Tìm kiếm</Label>
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="tiêu đề / tác giả / nội dung"
            className="w-64"
          />
        </div>
      </div>

      {/* List */}
      <div className="rounded-md border mt-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Xuất bản</TableHead>
              <TableHead>Cover</TableHead>
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
                  <TableCell className="text-xs text-muted-foreground">
                    {row.slug}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate">
                    {row.author || "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.publishedAt
                      ? new Date(row.publishedAt).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>{row.cover ? "✓" : "—"}</TableCell>
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
                      href={`${BASE}/news/${row.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      xem API
                    </a>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setPendingDelete(row)}
                    >
                      Xoá
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>Chưa có bài viết</TableCell>
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
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[94vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-5 shadow-2xl max-h-[85vh] overflow-hidden">
            <Dialog.Title className="text-base font-semibold">
              Sửa bài viết
            </Dialog.Title>
            {edit && (
              <div className="mt-4 max-h-[65vh] overflow-y-auto pr-1">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-3 md:col-span-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Label className="text-base font-semibold">
                        Tieu de & noi dung
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        Song ngu (VI / EN)
                      </span>
                    </div>
                    <Tabs defaultValue="vi" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="vi">Tieng Viet</TabsTrigger>
                        <TabsTrigger value="en">English</TabsTrigger>
                      </TabsList>
                      <TabsContent value="vi" className="mt-3 space-y-3">
                        <div className="grid gap-1.5">
                          <Label>Tieu de (VI)</Label>
                          <Input
                            value={editTitleVi}
                            onChange={(e) => {
                              setEditTitleVi(e.target.value);
                              setEdit((prev) =>
                                prev ? { ...prev, title: e.target.value } : prev
                              );
                            }}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Mo ta (VI)</Label>
                          <textarea
                            value={editExcerptVi}
                            onChange={(e) => {
                              setEditExcerptVi(e.target.value);
                              setEdit((prev) =>
                                prev
                                  ? { ...prev, excerpt: e.target.value }
                                  : prev
                              );
                            }}
                            className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Noi dung (VI)</Label>
                          <textarea
                            value={editContentVi}
                            onChange={(e) => {
                              setEditContentVi(e.target.value);
                              setEdit((prev) =>
                                prev
                                  ? { ...prev, content: e.target.value }
                                  : prev
                              );
                            }}
                            className="min-h-32 w-full rounded-md border px-3 py-2 text-sm"
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="en" className="mt-3 space-y-3">
                        <div className="grid gap-1.5">
                          <Label>Title (EN)</Label>
                          <Input
                            value={editTitleEn}
                            onChange={(e) => setEditTitleEn(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Excerpt (EN)</Label>
                          <textarea
                            value={editExcerptEn}
                            onChange={(e) => setEditExcerptEn(e.target.value)}
                            className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Content (EN)</Label>
                          <textarea
                            value={editContentEn}
                            onChange={(e) => setEditContentEn(e.target.value)}
                            className="min-h-32 w-full rounded-md border px-3 py-2 text-sm"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>{" "}
                  <div className="grid gap-2">
                    <Label>Slug</Label>
                    <Input
                      value={edit.slug || ""}
                      onChange={(e) =>
                        setEdit({ ...edit, slug: e.target.value })
                      }
                      placeholder={slugifyLocal(edit.title || "")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tác giả</Label>
                    <Input
                      value={edit.author || ""}
                      onChange={(e) =>
                        setEdit({ ...edit, author: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Ngày xuất bản</Label>
                    <Input
                      type="datetime-local"
                      value={editPublishedAtLocal}
                      onChange={(e) => setEditPublishedAtLocal(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label>Excerpt</Label>
                    <textarea
                      value={edit.excerpt || ""}
                      onChange={(e) =>
                        setEdit({ ...edit, excerpt: e.target.value })
                      }
                      className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cover hiện tại</Label>
                    {edit.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={edit.cover}
                        alt="cover"
                        className="h-24 w-40 object-cover rounded border"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">—</div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setEditCoverFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Ảnh gallery</Label>
                    <div className="mt-2">
                      <ImageGrid
                        images={edit.images || []}
                        onRemove={(idx) => {
                          const next = [...(edit.images || [])];
                          next.splice(idx, 1);
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
                          disabled={!editCoverFile && !editGalleryFiles.length}
                        >
                          Upload cover / ảnh mới
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          {editCoverFile
                            ? `Cover: ${editCoverFile.name}`
                            : null}
                          {editGalleryFiles.length
                            ? ` | ${editGalleryFiles.length} ảnh`
                            : null}
                        </div>
                      </div>
                    </div>
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
                    await deleteNews(pendingDelete._id).unwrap();
                    setPendingDelete(null);
                    refetch();
                    toast.success("Đã xoá bài viết");
                  } catch (e) {
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
