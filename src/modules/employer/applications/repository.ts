import { prisma } from "@/lib/prisma";
import type { ApplicationStatus } from "@/generated/prisma/client";

// Le candidat n'expose ni email ni téléphone : seulement ce qui est nécessaire.
const candidateSelect = {
  select: { id: true, headline: true, user: { select: { name: true } } },
} as const;

export const applicationRepository = {
  // Toujours filtré par job.companyId : impossible de lire les candidatures d'une autre entreprise.
  listForJob: (companyId: string, jobId: string, status?: ApplicationStatus) =>
    prisma.application.findMany({
      where: { jobId, job: { companyId }, ...(status ? { status } : {}) },
      orderBy: { createdAt: "desc" },
      include: { candidate: candidateSelect },
    }),

  findOwned: (companyId: string, id: string) =>
    prisma.application.findFirst({
      where: { id, job: { companyId } },
      include: {
        candidate: candidateSelect,
        job: { select: { id: true, title: true } },
        events: { orderBy: { createdAt: "desc" } },
      },
    }),

  changeStatus: (
    companyId: string,
    id: string,
    from: ApplicationStatus,
    to: ApplicationStatus,
    userId: string,
    message?: string,
    interviewAt?: Date,
  ) =>
    prisma.$transaction(async (tx) => {
      // La condition status: from évite deux changements simultanés contradictoires.
      const res = await tx.application.updateMany({
        where: { id, status: from, job: { companyId } },
        data: { status: to, statusUpdatedAt: new Date() },
      });
      if (res.count !== 1) return false;
      await tx.applicationStatusEvent.create({
        data: {
          applicationId: id, fromStatus: from, toStatus: to,
          changedById: userId, messageToCandidate: message, interviewAt,
        },
      });
      return true;
    }),

  setNote: (companyId: string, id: string, note: string | null) =>
    prisma.application.updateMany({
      where: { id, job: { companyId } },
      data: { internalNote: note },
    }),
};