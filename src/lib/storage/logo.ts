import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { AppError } from "@/lib/errors";

const DIR = path.join(process.cwd(), "public", "uploads", "logos");
const MAX_BYTES = 2 * 1024 * 1024;

// On vérifie le contenu réel du fichier, pas seulement son extension.
function detectExt(b: Buffer): "png" | "jpg" | "webp" | null {
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

/** Retourne la clé du fichier, ou null si aucun logo n'a été envoyé. */
export async function saveLogo(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_BYTES) throw new AppError(400, "LOGO_TOO_BIG", "Logo trop lourd (2 Mo maximum)");

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectExt(buf);
  if (!ext) throw new AppError(400, "LOGO_TYPE", "Format accepté : PNG, JPG ou WEBP");

  const key = `${randomUUID()}.${ext}`; // nom généré, jamais celui de l'utilisateur
  await mkdir(DIR, { recursive: true });
  await writeFile(path.join(DIR, key), buf);
  return key;
}

export const logoUrl = (key?: string | null) => (key ? `/uploads/logos/${key}` : null);

export async function deleteLogo(key: string) {
  await unlink(path.join(DIR, path.basename(key))).catch(() => {});
}