import type { JobStatus } from "@/generated/prisma/client";
import { AppError, notFound } from "@/lib/errors";
import { jobRepository as repo } from "./repository";
import type { JobInput } from "./schemas";

async function validateRefs(d: JobInput) {
  if (d.placeId && !(await repo.placeExists(d.placeId)))
    throw new AppError(400, "INVALID_PLACE", "Localisation invalide");
  if (d.professionId && !(await repo.professionExists(d.professionId)))
    throw new AppError(400, "INVALID_PROFESSION", "Métier invalide");
  const ids = [...new Set(d.skillIds)];
  if (ids.length && (await repo.countSkills(ids)) !== ids.length)
    throw new AppError(400, "INVALID_SKILL", "Compétence invalide");
}

const dedupe = (d: JobInput): JobInput => ({ ...d, skillIds: [...new Set(d.skillIds)] });

export const listJobs = (companyId: string, f: { q?: string; status?: JobStatus }) =>
  repo.list(companyId, f);
export const getReferentials = () => repo.referentials();

export async function getJob(companyId: string, id: string) {
  const job = await repo.findOwned(companyId, id);
  if (!job) throw notFound(); // inexistante OU appartenant à une autre entreprise
  return job;
}

export async function createJob(companyId: string, input: JobInput) {
  await validateRefs(input);
  return repo.create(companyId, dedupe(input));
}

export async function updateJob(companyId: string, id: string, input: JobInput) {
  await validateRefs(input);
  const job = await repo.update(companyId, id, dedupe(input));
  if (!job) throw notFound();
  return job;
}

export async function changeJobStatus(
  companyId: string,
  id: string,
  intent: "publish" | "unpublish" | "close",
) {
  const job = await getJob(companyId, id);
  if (intent === "publish") {
    if (job.deadline && job.deadline < new Date())
      throw new AppError(400, "DEADLINE_PASSED", "La date limite est dépassée : modifiez-la avant de publier");
    return repo.setStatus(companyId, id, "PUBLISHED", job.publishedAt ?? new Date());
  }
  return repo.setStatus(companyId, id, intent === "unpublish" ? "DRAFT" : "CLOSED");
}

export async function deleteJob(companyId: string, id: string) {
  if ((await repo.countApplications(companyId, id)) > 0)
    throw new AppError(409, "HAS_APPLICATIONS", "Cette offre a des candidatures : clôturez-la au lieu de la supprimer");
  const res = await repo.delete(companyId, id);
  if (res.count === 0) throw notFound();
}