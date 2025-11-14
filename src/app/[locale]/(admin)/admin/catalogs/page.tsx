/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useParams } from "next/navigation";
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

import {
  useGetCatalogsAdminQuery,
  useCreateCatalogMutation,
  useUpdateCatalogMutation,
  useReplaceCatalogFileMutation,
  useDeleteCatalogMutation,
  useUploadCatalogFilesMutation,
} from "@/services/admin.catalogs";
import type { Catalog } from "@/types/content";
import { toast } from "sonner";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  process.env.API_BASE_URL?.replace(/\/$/, "") ||
  process.env.API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function CatalogsAdminPage() {
  const params = useParams();
  const locale = String(params?.locale || "vi");

  const { data, isFetching, refetch } = useGetCatalogsAdminQuery();

  const [createCatalog, { isLoading: creating }] = useCreateCatalogMutation();
  const [updateCatalog] = useUpdateCatalogMutation();
  const [replaceCatalogFile] = useReplaceCatalogFileMutation();
  const [deleteCatalog] = useDeleteCatalogMutation();
  const [uploadCatalogFiles, { isLoading: uploading }] =
    useUploadCatalogFilesMutation();

  const [title, setTitle] = React.useState("");
  const [year, setYear] = React.useState<number>(new Date().getFullYear());
  const [isPublished, setIsPublished] = React.useState(true);
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const busy = creating || uploading;
  const canCreate = !!title && !!pdfFile && !busy;
  const [pendingDelete, setPendingDelete] = React.useState<Catalog | null>(
    null
  );

  function rtqErrMsg(err: any) {
    // RTK Query error shape
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

  async function handleCreate() {
    if (!pdfFile) return;

    try {
      // 1) Upload 1 file
      const uploaded = await uploadCatalogFiles({
        files: [pdfFile],
        folder: "catalogs",
      }).unwrap();
      const raw = uploaded?.[0];
      if (!raw) throw new Error("Upload không trả về file");

      // 2) Chuẩn hoá object pdf cho đúng BE
      const pdf = {
        url: raw.url || (raw as any).secure_url,
        provider: "cloudinary" as const,
        publicId: raw.publicId || (raw as any).public_id,
        bytes:
          typeof raw.bytes === "number" ? raw.bytes : (raw as any).size ?? 0,
        contentType:
          raw.contentType ||
          (raw as any).mimeType ||
          (raw as any).mimetype ||
          "application/pdf",
      };
      if (!pdf.url || !pdf.publicId) {
        console.error("Uploaded payload:", raw);
        throw new Error("Thiếu url/publicId từ upload");
      }

      // 3) Gọi tạo catalog
      await createCatalog({
        title,
        year: Number(year),
        slug: slugify(title),
        isPublished,
        pdf,
      }).unwrap();

      // 4) Reset + reload
      setTitle("");
      setYear(new Date().getFullYear());
      setIsPublished(true);
      setPdfFile(null);
      refetch();
      toast.success("Tạo catalog thành công");
    } catch (e: any) {
      console.error("CREATE_CATALOG_ERROR", e);
      toast.error(rtqErrMsg(e)); // dùng toast shadcn hiển thị lỗi BE (VD: 401, 409 slug trùng…)
    }
  }

  async function togglePublish(row: Catalog, v: boolean) {
    try {
      await updateCatalog({ id: row._id, patch: { isPublished: v } }).unwrap();
      refetch();
      toast.success("Đã cập nhật hiển thị");
    } catch {
      toast.error("Cập nhật hiển thị thất bại");
    }
  }

  async function replaceFile(row: Catalog, file: File | null) {
    if (!file) return;
    try {
      await replaceCatalogFile({ id: row._id, file }).unwrap();
      refetch();
      toast.success("Đã thay file PDF");
    } catch {
      toast.error("Thay file thất bại");
    }
  }

  async function remove(row: Catalog) {
    if (!confirm(`Xoá "${row.title}"?`)) return;
    try {
      await deleteCatalog(row._id).unwrap();
      refetch();
      toast.success("Đã xoá catalog");
    } catch {
      toast.error("Xoá thất bại");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteCatalog(pendingDelete._id).unwrap();
      setPendingDelete(null);
      refetch();
      toast.success("Đã xoá catalog");
    } catch {
      toast.error("Xoá thất bại");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Quản lý Catalog</h1>
        <p className="text-sm text-muted-foreground">
          Upload PDF qua endpoint chung, tạo/ cập nhật danh mục. Nội dung hiển
          thị ở panel bên phải sidebar.
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="title">Tiêu đề</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Hasake Essential Series"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="year">Năm</Label>
          <Input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value || 0))}
          />
        </div>
        <div className="flex items-center gap-2 mt-7">
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          <span>Published</span>
        </div>
        <div className="grid gap-2 lg:col-span-3">
          <Label>File PDF</Label>
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          />
        </div>
        <div>
          <Button onClick={handleCreate} disabled={!canCreate}>
            {busy ? "Đang tạo..." : "Tạo catalog"}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Năm</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>PDF</TableHead>
              <TableHead>Hiển thị</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={6}>Đang tải…</TableCell>
              </TableRow>
            ) : data?.items?.length ? (
              data.items.map((row) => (
                <TableRow key={row._id}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell>{row.year}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.slug}
                  </TableCell>
                  <TableCell>
                    <a
                      className="text-primary underline"
                      href={`${BASE}/catalogs/${row.slug}/open`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      mở PDF
                    </a>
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          replaceFile(row, e.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={row.isPublished}
                      onCheckedChange={(v) => togglePublish(row, v)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
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
                <TableCell colSpan={6}>Chưa có catalog</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
              <Button variant="destructive" onClick={confirmDelete}>
                Xoá
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
