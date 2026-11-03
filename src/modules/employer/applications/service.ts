import type { ApplicationStatus } from "@/generated/prisma/client";
import { AppError, notFound } from "@/lib/errors";
import { applicationRepository as repo } from "./repository";
import { TRANSITIONS } from "./constants";

export const listApplications = (companyId: string, jobId: string, status?: ApplicationStatus) =>
  repo.listForJob(companyId, jobId, status);

export async function getApplication(companyId: string, id: string) {
  const app = await repo.findOwned(companyId, id);
  if (!app) throw notFound();
  return app;
}

export async function changeApplicationStatus(
  companyId: string,
  userId: string,
  id: string,
  to: ApplicationStatus,
  message?: string,
  interviewAt?: Date,
) {
  const app = await getApplication(companyId, id);
  if (!TRANSITIONS[app.status]?.includes(to))
    throw new AppError(400, "BAD_TRANSITION", "Changement de statut non autorisé");
  if (to === "INTERVIEW" && !interviewAt)
    throw new AppError(400, "INTERVIEW_DATE", "Indiquez la date de l'entretien");

  const ok = await repo.changeStatus(companyId, id, app.status, to, userId, message, interviewAt);
  if (!ok) throw new AppError(409, "CONFLICT", "La candidature a déjà été modifiée, rechargez la page");
}

export async function saveNote(companyId: string, id: string, note: string) {
  const res = await repo.setNote(companyId, id, note.trim() || null);
  if (res.count === 0) throw notFound();
}