"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ApplyState = { error?: string; success?: boolean };

const APPLICATIONS_PATH = "/candidate/applications";

async function getCandidateId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") return null;
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  return profile?.id ?? null;
}

const applySchema = z.object({
  jobId: z.string().min(1, "Job is required"),
  coverLetter: z.string().trim().max(3000, "Cover letter is too long"),
});

export async function applyToJobAction(
  _prev: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const candidateId = await getCandidateId();
  if (!candidateId) return { error: "Unauthorized" };

  const parsed = applySchema.safeParse({
    jobId: String(formData.get("jobId") ?? ""),
    coverLetter: String(formData.get("coverLetter") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const job = await prisma.job.findUnique({
    where: { id: parsed.data.jobId },
    select: { status: true },
  });
  if (!job) return { error: "Job not found" };
  if (job.status !== "OPEN") return { error: "This job is no longer open" };

  const existing = await prisma.application.findUnique({
    where: {
      candidateId_jobId: { candidateId, jobId: parsed.data.jobId },
    },
    select: { id: true },
  });
  if (existing) return { error: "You already applied to this job" };

  await prisma.application.create({
    data: {
      candidateId,
      jobId: parsed.data.jobId,
      coverLetter: parsed.data.coverLetter || null,
    },
  });

  revalidatePath(APPLICATIONS_PATH);
  return { success: true };
}

export async function withdrawApplicationAction(
  formData: FormData
): Promise<void> {
  const candidateId = await getCandidateId();
  if (!candidateId) return;

  const id = String(formData.get("id") ?? "");
  // Only the owner can withdraw, and only while still pending
  await prisma.application.deleteMany({
    where: { id, candidateId, status: "PENDING" },
  });

  revalidatePath(APPLICATIONS_PATH);
}