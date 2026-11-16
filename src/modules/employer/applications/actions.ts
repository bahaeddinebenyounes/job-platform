"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AppError } from "@/lib/errors";
import { requireCompany } from "@/lib/authz/employer";
import { APPLICATION_STATUSES } from "./constants";
import * as service from "./service";

const schema = z.object({
  applicationId: z.string().min(1),
  jobId: z.string().min(1),
  toStatus: z.enum(APPLICATION_STATUSES),
  message: z.string().trim().max(1000).optional(),
  interviewAt: z.string().optional(),
});

export async function changeStatusAction(fd: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return;
  const { applicationId, jobId, toStatus, message, interviewAt } = parsed.data;

  let error: string | null = null;
  try {
    const { companyId, user } = await requireCompany();
    const date = interviewAt ? new Date(interviewAt) : undefined;
    if (date && Number.isNaN(date.getTime())) throw new AppError(400, "DATE", "Date invalide");
    await service.changeApplicationStatus(
      companyId, user.id, applicationId, toStatus, message || undefined, date,
    );
  } catch (e) {
    if (!(e instanceof AppError)) throw e;
    error = e.message;
  }
  revalidatePath(`/employer/jobs/${jobId}/applications`);
  if (error)
    redirect(`/employer/jobs/${jobId}/applications?error=${encodeURIComponent(error)}`);
}