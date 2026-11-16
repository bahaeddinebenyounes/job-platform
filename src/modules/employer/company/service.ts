import { randomBytes } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { AppError, notFound } from "@/lib/errors";
import { companyRepository as repo } from "./repository";
import type { CompanyInput , HiringStatusInput} from "./schemas";

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "entreprise";

async function uniqueSlug(name: string) {
  const base = slugify(name);
  return (await repo.slugExists(base)) ? `${base}-${randomBytes(3).toString("hex")}` : base;
}

export async function createCompany(userId: string, input: CompanyInput, logoKey: string | null) {
  const { firstName, lastName, jobTitle, ...company } = input;

  if (company.placeId && !(await repo.placeExists(company.placeId)))
    throw new AppError(400, "INVALID_PLACE", "Localisation invalide");

  try {
    return await repo.createForEmployer(
      userId,
      { firstName, lastName, jobTitle },
      { ...company, slug: await uniqueSlug(company.name), logoKey },
    );
  } catch (e) {
    // P2002 = contrainte d'unicité violée (ici : la patente)
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      throw new AppError(409, "DUPLICATE", "Ce numéro de patente est déjà enregistré");
    throw e;
  }
}

export async function getMyCompany(companyId: string) {
  const company = await repo.findById(companyId);
  if (!company) throw notFound();
  return company;
}
export const updateHiringStatus = (companyId: string, input: HiringStatusInput) =>
  repo.updateHiring(companyId, input);