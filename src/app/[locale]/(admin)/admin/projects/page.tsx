/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Project } from "@/types/content";
import {
  useGetProjectsAdminQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUploadProjectImagesMutation,
  useLazyCheckProjectSlugQuery,
  useLazySlugifyProjectQuery,
  useRegenerateProjectSlugMutation,
  useBackfillProjectSlugsMutation,
} from "@/services/admin.projects";
import { MoreVertical } from "lucide-react";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  process.env.API_BASE_URL?.replace(/\/$/, "") ||
  process.env.API_BASE?.replace(/\/$/, "") ||
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

type Editable = {
  project: string;
  scope: string;
  client: string;
  year: number;
  slug?: string;
  isPublished?: boolean;
  images?: { url: string; alt?: string }[];
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
          <div className="mt-1 text-xs line-clamp-1">{img.alt || "—"}</div>
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

export default function ProjectsAdminPage() {
  const params = useParams();
  const locale = String(params?.locale || "vi");

  // Query state
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [q, setQ] = React.useState("");
  const [year, setYear] = React.useState<string>("");

  const { data, isFetching, refetch } = useGetProjectsAdminQuery({
    page,
    limit,
    q: q.trim() || undefined,
    year: year ? Number(year) : undefined,
    sort: "-year,-createdAt",
  });

  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [uploadImages, { isLoading: uploading }] =
    useUploadProjectImagesMutation();
  const [checkSlugTrigger] = useLazyCheckProjectSlugQuery();
  const [slugifyTrigger] = useLazySlugifyProjectQuery();
  const [regenSlug] = useRegenerateProjectSlugMutation();
  const [backfillSlugs] = useBackfillProjectSlugsMutation();

  // -------- Create form state --------
  const [cProject, setCProject] = React.useState("");
  const [cScope, setCScope] = React.useState("");
  const [cClient, setCClient] = React.useState("");
  const [cYear, setCYear] = React.useState<number>(new Date().getFullYear());
  const [cIsPublished, setCIsPublished] = React.useState(true);
  const [cSlug, setCSlug] = React.useState("");
  const [cFiles, setCFiles] = React.useState<File[]>([]);
  const [cSlugOk, setCSlugOk] = React.useState<boolean | null>(null);

  const canCreate =
    !!cProject &&
    !!cScope &&
    !!cClient &&
    !!cYear &&
    !!cSlug &&
    cSlugOk !== false &&
    !creating &&
    !uploading;

  React.useEffect(() => {
    // auto gợi ý slug
    const next = slugifyLocal(cProject);
    setCSlug(next);
    setCSlugOk(null);
  }, [cProject]);

  async function handleCheckSlug(slug: string) {
    try {
      const res = await checkSlugTrigger({ slug }).unwrap();
      setCSlugOk(!res.exists);
      if (res.exists) toast.error("Slug đã tồn tại");
      else toast.success("Slug khả dụng");
    } catch (e: any) {
      toast.error(rtqErrMsg(e));
    }
  }

  async function handleCreate() {
    try {
      let images: { url: string; alt?: string }[] = [];
      if (cFiles.length) {
        const uploaded = await uploadImages({
          files: cFiles,
          folder: "projects",
        }).unwrap();
        images = uploaded.map((u) => ({ url: u.url, alt: "" }));
      }
      await createProject({
        project: cProject,
        scope: cScope,
        client: cClient,
        year: Number(cYear),
        slug: cSlug,
        isPublished: cIsPublished,
        images,
      }).unwrap();

      // reset
      setCProject("");
      setCScope("");
      setCClient("");
      setCYear(new Date().getFullYear());
      setCIsPublished(true);
      setCSlug("");
      setCFiles([]);
      setCSlugOk(null);

      refetch();
      toast.success("Tạo project thành công");
    } catch (e: any) {
      console.error("CREATE_PROJECT_ERROR", e);
      toast.error(rtqErrMsg(e));
    }
  }

  // -------- Edit dialog state --------
  const [editing, setEditing] = React.useState<Project | null>(null);
  const [editState, setEditState] = React.useState<Editable | null>(null);
  const [editFiles, setEditFiles] = React.useState<File[]>([]);
  const [editSlugOk, setEditSlugOk] = React.useState<boolean | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Project | null>(
    null
  );

  function openEdit(p: Project) {
    setEditing(p);
    setEditState({
      project: p.project,
      scope: p.scope,
      client: p.client,
      year: p.year,
      slug: p.slug,
      isPublished: p.isPublished,
      images: p.images || [],
    });
    setEditFiles([]);
    setEditSlugOk(null);
  }

  async function addImagesToEdit() {
    if (!editFiles.length || !editState) return;
    try {
      const up = await uploadImages({
        files: editFiles,
        folder: "projects",
      }).unwrap();
      const more = up.map((u) => ({ url: u.url, alt: "" }));
      setEditState({
        ...editState,
        images: [...(editState.images || []), ...more],
      });
      setEditFiles([]);
      toast.success("Đã thêm ảnh");
    } catch (e: any) {
      toast.error(rtqErrMsg(e));
    }
  }

  async function saveEdit() {
    if (!editing || !editState) return;
    try {
      await updateProject({ id: editing._id, patch: editState }).unwrap();
      setEditing(null);
      refetch();
      toast.success("Đã cập nhật project");
    } catch (e: any) {
      toast.error(rtqErrMsg(e));
    }
  }

  async function removeRow(p: Project) {
    if (!confirm(`Xoá "${p.project}"?`)) return;
    try {
      await deleteProject(p._id).unwrap();
      refetch();
      toast.success("Đã xoá project");
    } catch (e: any) {
      toast.error(rtqErrMsg(e));
    }
  }

  async function togglePublish(row: Project, v: boolean) {
    try {
      await updateProject({ id: row._id, patch: { isPublished: v } }).unwrap();
      refetch();
      toast.success("Đã cập nhật hiển thị");
    } catch (e: any) {
      toast.error(rtqErrMsg(e));
    }
  }

  async function doRegenSlug(p: Project) {
    try {
      const r = await regenSlug({ id: p._id }).unwrap();
      toast.success(`Đã tạo slug mới: ${r.slug}`);
      refetch();
    } catch (e: any) {
      toast.error(rtqErrMsg(e));
    }
  }

  async function doBackfillSlugs() {
    try {
      const r = await backfillSlugs().unwrap();
      toast.success(`Backfill xong ${r.updated} slug`);
      refetch();
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
        <h1 className="text-xl font-semibold">Quản lý Projects</h1>
        <p className="text-sm text-muted-foreground">
          Tạo/sửa/xoá dự án, upload nhiều ảnh, kiểm tra slug, bật/tắt hiển thị.
        </p>
      </div>

      <Separator />

      {/* Tạo mới */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="pname">Tên dự án</Label>
          <Input
            id="pname"
            value={cProject}
            onChange={(e) => setCProject(e.target.value)}
            placeholder="Ngọc Long"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pscope">Phạm vi</Label>
          <Input
            id="pscope"
            value={cScope}
            onChange={(e) => setCScope(e.target.value)}
            placeholder="Cung cấp và lắp đặt"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pclient">Khách hàng</Label>
          <Input
            id="pclient"
            value={cClient}
            onChange={(e) => setCClient(e.target.value)}
            placeholder="Vincom Thủ Đức, TPHCM, Việt Nam"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pyear">Năm</Label>
          <Input
            id="pyear"
            type="number"
            value={cYear}
            onChange={(e) => setCYear(Number(e.target.value || 0))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pslug">Slug</Label>
          <div className="flex gap-2">
            <Input
              id="pslug"
              value={cSlug}
              onChange={(e) => {
                setCSlug(e.target.value);
                setCSlugOk(null);
              }}
              placeholder="ngoc-long"
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => handleCheckSlug(cSlug)}
            >
              Check
            </Button>
          </div>
          {cSlugOk === true && (
            <div className="text-xs text-green-600">Slug khả dụng</div>
          )}
          {cSlugOk === false && (
            <div className="text-xs text-red-600">Slug đã tồn tại</div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-7">
          <Switch checked={cIsPublished} onCheckedChange={setCIsPublished} />
          <span>Published</span>
        </div>
        <div className="grid gap-2 lg:col-span-3">
          <Label>Ảnh (có thể chọn nhiều)</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setCFiles(Array.from(e.target.files || []))}
          />
          <div className="text-xs text-muted-foreground">
            {cFiles.length ? `${cFiles.length} file đã chọn` : "Chưa chọn file"}
          </div>
        </div>
        <div>
          <Button onClick={handleCreate} disabled={!canCreate}>
            {busyCreate ? "Đang tạo..." : "Tạo project"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filter + Tools */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm">Tìm kiếm</Label>
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="tên dự án / phạm vi / khách hàng"
            className="w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Năm</Label>
          <Input
            type="number"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            className="w-32"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={doBackfillSlugs}>
            Backfill slugs
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dự án</TableHead>
              <TableHead>Phạm vi</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Năm</TableHead>
              <TableHead>Slug</TableHead>
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
                  <TableCell className="font-medium">{row.project}</TableCell>
                  <TableCell className="max-w-[280px] truncate">
                    {row.scope}
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate">
                    {row.client}
                  </TableCell>
                  <TableCell>{row.year}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.slug}
                  </TableCell>
                  <TableCell>{row.images?.length || 0}</TableCell>
                  <TableCell>
                    <Switch
                      checked={row.isPublished}
                      onCheckedChange={(v) => togglePublish(row, v)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Desktop: inline actions with wrap */}
                    <div className="hidden md:flex flex-wrap justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(row)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => doRegenSlug(row)}
                      >
                        Regen slug
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`${BASE}/projects/by-slug/${row.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Xem API
                        </a>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setPendingDelete(row)}
                      >
                        Xoá
                      </Button>
                    </div>
                    {/* Mobile: collapsed into a menu */}
                    <div className="md:hidden flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label="Thao tác"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(row)}>
                            Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => doRegenSlug(row)}>
                            Regen slug
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={`${BASE}/projects/by-slug/${row.slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Xem API
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => removeRow(row)}
                          >
                            Xoá
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>Chưa có project</TableCell>
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
              Sửa project
            </Dialog.Title>
            {editState && (
              <div className="mt-4 max-h-[65vh] overflow-y-auto pr-1">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Tên dự án</Label>
                    <Input
                      value={editState.project}
                      onChange={(e) =>
                        setEditState({ ...editState, project: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phạm vi</Label>
                    <Input
                      value={editState.scope}
                      onChange={(e) =>
                        setEditState({ ...editState, scope: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Khách hàng</Label>
                    <Input
                      value={editState.client}
                      onChange={(e) =>
                        setEditState({ ...editState, client: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Năm</Label>
                    <Input
                      type="number"
                      value={editState.year}
                      onChange={(e) =>
                        setEditState({
                          ...editState,
                          year: Number(e.target.value || 0),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label>Slug</Label>
                    <div className="flex gap-2">
                      <Input
                        value={editState.slug}
                        onChange={(e) => {
                          setEditState({ ...editState, slug: e.target.value });
                          setEditSlugOk(null);
                        }}
                      />
                      <Button
                        variant="outline"
                        type="button"
                        onClick={async () => {
                          try {
                            const s = await slugifyTrigger({
                              title: editState.project,
                            }).unwrap();
                            setEditState({ ...editState, slug: s.slug });
                            setEditSlugOk(null);
                          } catch (e: any) {
                            toast.error(rtqErrMsg(e));
                          }
                        }}
                      >
                        Gợi ý
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={async () => {
                          try {
                            if (!editState.slug) {
                              toast.error("Slug trống");
                              return;
                            }
                            const r = await checkSlugTrigger({
                              slug: editState.slug,
                            }).unwrap();
                            setEditSlugOk(!r.exists);
                            if (r.exists) toast.error("Slug đã tồn tại");
                            else toast.success("Slug khả dụng");
                          } catch (e: any) {
                            toast.error(rtqErrMsg(e));
                          }
                        }}
                      >
                        Check
                      </Button>
                    </div>
                    {editSlugOk === true && (
                      <div className="text-xs text-green-600">
                        Slug khả dụng
                      </div>
                    )}
                    {editSlugOk === false && (
                      <div className="text-xs text-red-600">
                        Slug đã tồn tại
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!editState.isPublished}
                      onCheckedChange={(v) =>
                        setEditState({ ...editState, isPublished: v })
                      }
                    />
                    <span>Published</span>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Ảnh hiện có</Label>
                    <div className="mt-2">
                      <ImageGrid
                        images={editState.images || []}
                        onRemove={(idx) => {
                          const next = [...(editState.images || [])];
                          next.splice(idx, 1);
                          setEditState({ ...editState, images: next });
                        }}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 grid gap-2">
                    <Label>Thêm ảnh</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        setEditFiles(Array.from(e.target.files || []))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addImagesToEdit}
                        disabled={!editFiles.length}
                      >
                        Upload & thêm
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        {editFiles.length
                          ? `${editFiles.length} file đã chọn`
                          : "Chưa chọn file"}
                      </div>
                    </div>
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
              {pendingDelete ? ` “${pendingDelete.project}”` : " mục này"}? Thao
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
                    await deleteProject(pendingDelete._id).unwrap();
                    setPendingDelete(null);
                    refetch();
                    toast.success("Đã xoá project");
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
