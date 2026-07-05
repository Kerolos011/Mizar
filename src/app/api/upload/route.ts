import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".bmp",
  ".ico",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
]);

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "image/bmp",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/tiff",
  "image/heic",
  "image/heif",
]);

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
  "image/bmp": ".bmp",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
  "image/tiff": ".tiff",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function sanitizeFolder(value: FormDataEntryValue | null) {
  const raw = String(value || "products/images").trim();

  const clean = raw
    .replace(/\\/g, "/")
    .replace(/\.\./g, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/g, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "");

  return clean || "products/images";
}

function getSafeExtension(file: File) {
  const originalName = file.name || "";
  const extFromName = path.extname(originalName).toLowerCase();
  const extFromMime = MIME_TO_EXTENSION[file.type] || "";

  const finalExt = extFromName || extFromMime;

  if (!finalExt || !ALLOWED_EXTENSIONS.has(finalExt)) {
    return "";
  }

  return finalExt;
}

function isAllowedImage(file: File, extension: string) {
  const mime = String(file.type || "").toLowerCase();

  if (mime && ALLOWED_MIME_TYPES.has(mime)) {
    return true;
  }

  if (!mime && ALLOWED_EXTENSIONS.has(extension)) {
    return true;
  }

  if (mime.startsWith("image/") && ALLOWED_EXTENSIONS.has(extension)) {
    return true;
  }

  return false;
}

function sanitizeSvg(svgText: string) {
  return svgText
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileValue = formData.get("file");

    if (!(fileValue instanceof File)) {
      return jsonResponse(
        {
          success: false,
          message: "لم يتم إرسال صورة صالحة",
        },
        400
      );
    }

    const file = fileValue;

    if (file.size <= 0) {
      return jsonResponse(
        {
          success: false,
          message: "الصورة فارغة",
        },
        400
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonResponse(
        {
          success: false,
          message: "حجم الصورة أكبر من المسموح. الحد الأقصى 10MB",
        },
        400
      );
    }

    const extension = getSafeExtension(file);

    if (!extension || !isAllowedImage(file, extension)) {
      return jsonResponse(
        {
          success: false,
          message:
            "امتداد الصورة غير مدعوم. الامتدادات المدعومة: JPG, PNG, WEBP, GIF, SVG, AVIF, BMP, ICO, TIFF, HEIC, HEIF",
        },
        400
      );
    }

    const folder = sanitizeFolder(formData.get("folder"));
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    if (extension === ".svg") {
      const svgText = await file.text();
      const safeSvg = sanitizeSvg(svgText);

      await writeFile(filePath, safeSvg, "utf8");
    } else {
      const buffer = Buffer.from(await file.arrayBuffer());

      await writeFile(filePath, buffer);
    }

    const url = `/uploads/${folder}/${fileName}`;

    return jsonResponse({
      success: true,
      message: "تم رفع الصورة بنجاح",
      url,
      type: "IMAGE",
      file: {
        name: fileName,
        originalName: file.name,
        mimeType: file.type || null,
        extension,
        sizeBytes: file.size,
        url,
      },
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);

    return jsonResponse(
      {
        success: false,
        message: "حدث خطأ أثناء رفع الصورة",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}