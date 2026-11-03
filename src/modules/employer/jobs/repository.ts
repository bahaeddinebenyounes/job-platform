import { prisma } from "@/lib/prisma";
import type { JobStatus } from "@/generated/prisma/client";
import type { JobInput } from "./schemas";

const include = {
  place: true,
  profession: true,
  skills: { include: { skill: true } },
} as const;

export const jobRepository = {
  list: (companyId: string, f: { q?: string; status?: JobStatus }) =>
    prisma.job.findMany({
      where: {
        companyId,
        ...(f.status ? { status: f.status } : {}),
        ...(f.q ? { title: { contains: f.q, mode: "insensitive" } } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
      include,
    }),

  // Toujours filtré par companyId : une offre d'une autre entreprise donne null.
  findOwned: (companyId: string, id: string) =>
    prisma.job.findFirst({ where: { id, companyId }, include }),

  create: (companyId: string, data: JobInput) => {
    const { skillIds, ...rest } = data;
    return prisma.job.create({
      data: { ...rest, companyId, skills: { create: skillIds.map((skillId) => ({ skillId })) } },
    });
  },

  update: (companyId: string, id: string, data: JobInput) =>
    prisma.$transaction(async (tx) => {
      const owned = await tx.job.findFirst({ where: { id, companyId }, select: { id: true } });
      if (!owned) return null;
      const { skillIds, ...d } = data;
      return tx.job.update({
        where: { id },
        data: {
          ...d,
          // null = effacer la valeur (undefined = ne pas toucher)
          professionId: d.professionId ?? null,
          experienceMinYears: d.experienceMinYears ?? null,
          educationLevel: d.educationLevel ?? null,
          salaryMin: d.salaryMin ?? null,
          salaryMax: d.salaryMax ?? null,
          placeId: d.placeId ?? null,
          deadline: d.deadline ?? null,
          skills: { deleteMany: {}, create: skillIds.map((skillId) => ({ skillId })) },
        },
      });
    }),

  setStatus: (companyId: string, id: string, status: JobStatus, publishedAt?: Date) =>
    prisma.job.updateMany({
      where: { id, companyId },
      data: { status, ...(publishedAt ? { publishedAt } : {}) },
    }),

  delete: (companyId: string, id: string) => prisma.job.deleteMany({ where: { id, companyId } }),

  countApplications: (companyId: string, id: string) =>
    prisma.application.count({ where: { jobId: id, job: { companyId } } }),

  placeExists: async (id: string) => (await prisma.place.count({ where: { id } })) > 0,
  professionExists: async (id: string) => (await prisma.profession.count({ where: { id } })) > 0,
  countSkills: (ids: string[]) => prisma.skill.count({ where: { id: { in: ids } } }),
  referentials: async () => {
    const [places, professions, skills] = await Promise.all([
      prisma.place.findMany({ orderBy: [{ governorate: "asc" }, { name: "asc" }] }),
      prisma.profession.findMany({ orderBy: { nameFr: "asc" } }),
      prisma.skill.findMany({ orderBy: { name: "asc" } }),
    ]);
    return { places, professions, skills };
  },
};