"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeMatchScore } from "@/lib/matching";

export async function refreshRecommendationsAction(): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") return;

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: { skills: { include: { skill: true } } },
  });
  if (!profile) return;

  const candidateId = profile.id;
  const skillNames = profile.skills.map((cs) => cs.skill.name);

  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    select: { id: true, title: true, description: true },
  });

  const scored = jobs
    .map((job) => ({
      jobId: job.id,
      score: computeMatchScore(skillNames, `${job.title} ${job.description}`),
    }))
    .filter((item) => item.score > 0);

  await prisma.$transaction([
    // Remove matches that no longer apply
    prisma.aIMatch.deleteMany({
      where: { candidateId, jobId: { notIn: scored.map((s) => s.jobId) } },
    }),
    ...scored.map((s) =>
      prisma.aIMatch.upsert({
        where: { candidateId_jobId: { candidateId, jobId: s.jobId } },
        update: { score: s.score },
        create: { candidateId, jobId: s.jobId, score: s.score },
      })
    ),
  ]);

  revalidatePath("/candidate/recommendations");
}