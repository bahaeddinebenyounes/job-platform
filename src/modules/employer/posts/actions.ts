"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AppError } from "@/lib/errors";
import { requireCompany } from "@/lib/authz/employer";
import { deletePostImages, savePostImages } from "@/lib/storage/post-images";
import type { FormState } from "@/modules/employer/company/types";
import { postSchema } from "./schemas";
import * as service from "./service";

export async function createPostAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = postSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  let keys: string[] = [];
  try {
    const { companyId } = await requireCompany();
    const files = fd.getAll("images").filter((f): f is File => f instanceof File);
    keys = await savePostImages(files);
    await service.createPost(companyId, parsed.data, keys);
  } catch (e) {
    await deletePostImages(keys);
    if (e instanceof AppError) return { message: e.message };
    console.error(e);
    return { message: "Une erreur est survenue" };
  }
  revalidatePath("/employer/posts");
  return { ok: true, message: "Publication ajoutée" };
}

export async function deletePostAction(fd: FormData) {
  const { companyId } = await requireCompany();
  await service.deletePost(companyId, String(fd.get("postId") ?? ""));
  revalidatePath("/employer/posts");
}