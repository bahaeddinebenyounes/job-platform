"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { AppError } from "@/lib/errors";
import { getEmployerContext, requireCompany } from "@/lib/authz/employer";
import { deleteLogo, saveLogo } from "@/lib/storage/logo";
import { companySchema , hiringStatusSchema } from "./schemas";
import * as service from "./service";
import type { FormState } from "./types";
import { revalidatePath } from "next/cache";

export async function createCompanyAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = companySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  let logoKey: string | null = null;
  try {
    const ctx = await getEmployerContext(); // authentification + rôle EMPLOYER, côté serveur
    if (ctx.companyId) return { message: "Vous avez déjà une entreprise" };

    const file = fd.get("logo");
    logoKey = await saveLogo(file instanceof File ? file : null);
    await service.createCompany(ctx.user.id, parsed.data, logoKey);
  } catch (e) {
    if (logoKey) await deleteLogo(logoKey); // pas de fichier orphelin
    if (e instanceof AppError) return { message: e.message };
    console.error(e);
    return { message: "Une erreur est survenue" };
  }
  redirect("/employer/dashboard"); // hors du try/catch : redirect lève une exception
}
export async function updateHiringStatusAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = hiringStatusSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  try {
    const { companyId } = await requireCompany(); // authentification, rôle et entreprise
    await service.updateHiringStatus(companyId, parsed.data);
    revalidatePath("/employer/company");
    return { ok: true, message: "Statut mis à jour" };
  } catch (e) {
    if (e instanceof AppError) return { message: e.message };
    console.error(e);
    return { message: "Une erreur est survenue" };
  }
}