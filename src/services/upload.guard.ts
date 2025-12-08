export type UploadGuardOptions = {
  allowedTypes?: string[];
  maxBytes?: number;
  maxFiles?: number;
};

const DEFAULT_ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
  "application/pdf",
];

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10MB per file
const DEFAULT_MAX_FILES = 10;

let lastUploadAt = 0;

const matchesType = (type: string, pattern: string) => {
  if (!type || !pattern) return false;
  if (pattern.endsWith("/*")) {
    return type.startsWith(pattern.slice(0, -1));
  }
  return type === pattern;
};

export const guardUploadFiles = (
  files: File[],
  options: UploadGuardOptions = {}
) => {
  if (!files || files.length === 0) {
    throw new Error("Chưa chọn file để upload");
  }

  const now = Date.now();
  if (now - lastUploadAt < 500) {
    throw new Error("Upload quá nhanh, vui lòng thử lại sau");
  }
  lastUploadAt = now;

  const allowed = options.allowedTypes ?? DEFAULT_ALLOWED;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;

  if (files.length > maxFiles) {
    throw new Error(`Chỉ cho phép tối đa ${maxFiles} file mỗi lần upload`);
  }

  files.forEach((file) => {
    if (file.size > maxBytes) {
      const limitMb = Math.round((maxBytes / (1024 * 1024)) * 10) / 10;
      throw new Error(`${file.name} vượt quá giới hạn ${limitMb}MB`);
    }
    const ok = allowed.some((t) => matchesType(file.type, t));
    if (!ok) {
      throw new Error(`${file.name} không thuộc định dạng cho phép`);
    }
  });
};
