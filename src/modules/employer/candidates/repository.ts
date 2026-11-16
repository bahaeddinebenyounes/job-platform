import { prisma } from "@/lib/prisma";

export type CandidateFilters = {
  professionId?: string;
  placeId?: string;
  skillIds: string[];
  minYears?: number;
};

// Vue publique minimale : AUCUN email, téléphone ni CV.
const publicSelect = {
  id: true,
  headline: true,
  yearsExperience: true,
  educationLevel: true,
  profession: { select: { nameFr: true } },
  place: { select: { name: true } },
  skills: { select: { skill: { select: { name: true } } } },
} as const;

export const candidateRepository = {
  search: (f: CandidateFilters) =>
    prisma.candidateProfile.findMany({
      where: {
        profileVisibility: "SEARCHABLE", // seuls les profils qui ont accepté
        ...(f.professionId ? { professionId: f.professionId } : {}),
        ...(f.placeId ? { placeId: f.placeId } : {}),
        ...(f.minYears != null ? { yearsExperience: { gte: f.minYears } } : {}),
        // le candidat doit avoir TOUTES les compétences demandées
        ...(f.skillIds.length
          ? { AND: f.skillIds.map((id) => ({ skills: { some: { skillId: id } } })) }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: publicSelect,
    }),

  findSearchable: (id: string) =>
    prisma.candidateProfile.findFirst({
      where: { id, profileVisibility: "SEARCHABLE" },
      select: publicSelect,
    }),

  // Un candidat qui a postulé chez l'employeur peut être vu même s'il n'est pas SEARCHABLE.
  hasAppliedTo: async (companyId: string, candidateId: string) =>
    (await prisma.application.count({ where: { candidateId, job: { companyId } } })) > 0,

  referentials: async () => {
    const [professions, places, skills] = await Promise.all([
      prisma.profession.findMany({ orderBy: { nameFr: "asc" } }),
      prisma.place.findMany({ orderBy: { name: "asc" } }),
      prisma.skill.findMany({ orderBy: { name: "asc" } }),
    ]);
    return { professions, places, skills };
  },
};