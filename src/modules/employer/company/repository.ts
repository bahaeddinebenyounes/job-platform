import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { CompanyInput , HiringStatusInput} from "./schemas";

type CreateData = Omit<CompanyInput, "firstName" | "lastName" | "jobTitle"> & {
  slug: string;
  logoKey: string | null;
};

export const companyRepository = {
  slugExists: async (slug: string) => (await prisma.company.count({ where: { slug } })) > 0,
  placeExists: async (id: string) => (await prisma.place.count({ where: { id } })) > 0,
  findById: (id: string) => prisma.company.findUnique({ where: { id }, include: { place: true } }),
    // Le companyId vient de la session, jamais du formulaire.
  updateHiring: (companyId: string, data: HiringStatusInput) =>
    prisma.company.update({
      where: { id: companyId },
      data: {
        hiringStatus: data.hiringStatus,
        hiringNote: data.hiringNote ?? null, // null = effacer la note
        hiringStatusUpdatedAt: new Date(),
      },
    }),
  createForEmployer: (
    userId: string,
    person: { firstName: string; lastName: string; jobTitle?: string },
    data: CreateData,
  ) =>
    prisma.$transaction(async (tx) => {
      const profile = await tx.employerProfile.upsert({
        where: { userId },
        update: person,
        create: { userId, ...person },
      });
      const company = await tx.company.create({ data });

      // companyId = null : empêche de créer deux entreprises (double clic).
      const linked = await tx.employerProfile.updateMany({
        where: { id: profile.id, companyId: null },
        data: { companyId: company.id },
      });
      if (linked.count !== 1) throw new AppError(409, "COMPANY_EXISTS", "Vous avez déjà une entreprise");
      return company;
    }),
};