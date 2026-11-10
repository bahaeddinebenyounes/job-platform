import { prisma } from "@/lib/prisma";
import { notFound } from "@/lib/errors";
import { deletePostImages } from "@/lib/storage/post-images";
import type { PostInput } from "./schemas";

export const listPosts = (companyId: string) =>
  prisma.companyPost.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 50 });

export const createPost = (companyId: string, data: PostInput, imageKeys: string[]) =>
  prisma.companyPost.create({ data: { ...data, companyId, imageKeys } });

export async function deletePost(companyId: string, id: string) {
  const post = await prisma.companyPost.findFirst({ where: { id, companyId } });
  if (!post) throw notFound(); // inexistant OU d'une autre entreprise
  await prisma.companyPost.delete({ where: { id } });
  await deletePostImages(post.imageKeys);
}