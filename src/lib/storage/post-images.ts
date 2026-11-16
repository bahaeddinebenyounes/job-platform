import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { AppError } from "@/lib/errors";

const DIR = path.join(process.cwd(), "public", "uploads", "posts");
const MAX_BYTES = 3 * 1024 * 1024;
export const MAX_IMAGES = 4;

function detectExt(b: Buffer): "png" | "jpg" | "webp" | null {
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

export async function savePostImages(files: File[]): Promise<string[]> {
  const valid = files.filter((f) => f.size > 0);
  if (valid.length > MAX_IMAGES) throw new AppError(400, "TOO_MANY", `${MAX_IMAGES} images maximum`);
  const keys: string[] = [];
  try {
    for (const f of valid) {
      if (f.size > MAX_BYTES) throw new AppError(400, "IMG_BIG", "Image trop lourde (3 Mo maximum)");
      const buf = Buffer.from(await f.arrayBuffer());
      const ext = detectExt(buf);
      if (!ext) throw new AppError(400, "IMG_TYPE", "Formats acceptés : PNG, JPG, WEBP");
      const key = `${randomUUID()}.${ext}`;
      await mkdir(DIR, { recursive: true });
      await writeFile(path.join(DIR, key), buf);
      keys.push(key);
    }
  } catch (e) {
    await deletePostImages(keys);
    throw e;
  }
  return keys;
}

export const postImageUrl = (key: string) => `/uploads/posts/${key}`;

export async function deletePostImages(keys: string[]) {
  await Promise.all(keys.map((k) => unlink(path.join(DIR, path.basename(k))).catch(() => {})));
}