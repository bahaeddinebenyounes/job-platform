import { z } from "zod";

export const postSchema = z.object({
  type: z.enum(["PROJECT", "NEWS"]),
  title: z.string().trim().min(3, "Au moins 3 caractères").max(120),
  content: z.string().trim().min(10, "Au moins 10 caractères").max(5000),
  videoUrl: z
    .string().trim().max(300).optional()
    .transform((v) => v || undefined)
    .refine(
      (v) => !v || /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)[\w-]+/.test(v),
      "Lien YouTube ou Vimeo invalide",
    ),
});
export type PostInput = z.infer<typeof postSchema>;

/** Transforme un lien YouTube/Vimeo en URL d'intégration (liste blanche). */
export function toEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,15})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}