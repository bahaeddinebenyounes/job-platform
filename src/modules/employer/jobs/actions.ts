"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AppError } from "@/lib/errors";
import { requireCompany } from "@/lib/authz/employer";
import type { FormState } from "@/modules/employer/company/types";
import { parseJobForm } from "./schemas";
import * as service from "./service";

export async function saveJobAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = parseJobForm(fd);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const id = String(fd.get("id") ?? "");
  try {
    const { companyId } = await requireCompany(); // companyId vient de la session, jamais du formulaire
    if (id) await service.updateJob(companyId, id, parsed.data);
    else await service.createJob(companyId, parsed.data);
  } catch (e) {
    if (e instanceof AppError) return { message: e.message };
    console.error(e);
    return { message: "Une erreur est survenue" };
  }
  redirect("/employer/jobs");
}

export async function jobStatusAction(fd: FormData) {
  const id = String(fd.get("jobId") ?? "");
  const intent = String(fd.get("intent") ?? "");
  let error: string | null = null;
  try {
    const { companyId } = await requireCompany();
    if (intent === "delete") await service.deleteJob(companyId, id);
    else if (intent === "publish" || intent === "unpublish" || intent === "close")
      await service.changeJobStatus(companyId, id, intent);
    else throw new AppError(400, "BAD_INTENT", "Action inconnue");
  } catch (e) {
    if (!(e instanceof AppError)) throw e;
    error = e.message;
  }
  revalidatePath("/employer/jobs");
  if (error) redirect(`/employer/jobs?error=${encodeURIComponent(error)}`);
}