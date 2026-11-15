"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CvState = { error?: string; success?: boolean };

const CV_PATH = "/candidate/cv";
const clean = (value: string) => value.trim() || null;

async function getCandidateId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") return null;
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  return profile?.id ?? null;
}

function parsePeriod(startRaw: string, endRaw: string, isCurrent: boolean) {
  const startDate = new Date(startRaw);
  if (!startRaw || isNaN(startDate.getTime())) {
    return { error: "Start date is invalid" } as const;
  }
  if (isCurrent) return { startDate, endDate: null } as const;

  const endDate = new Date(endRaw);
  if (!endRaw || isNaN(endDate.getTime())) {
    return { error: "End date is required unless this is current" } as const;
  }
  if (endDate < startDate) {
    return { error: "End date must be after start date" } as const;
  }
  return { startDate, endDate } as const;
}

/* ---------- Skills ---------- */

const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Skill name is required")
    .max(50, "Skill name is too long"),
  level: z.coerce.number().int().min(1).max(4),
});

export async function addSkillAction(
  _prev: CvState,
  formData: FormData
): Promise<CvState> {
  const candidateId = await getCandidateId();
  if (!candidateId) return { error: "Unauthorized" };

  const parsed = skillSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    level: String(formData.get("level") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const name = parsed.data.name.replace(/\s+/g, " ");

  // Case-insensitive lookup so "React" and "react" share one Skill row
  const skill =
    (await prisma.skill.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    })) ?? (await prisma.skill.create({ data: { name } }));

  await prisma.candidateSkill.upsert({
    where: { candidateId_skillId: { candidateId, skillId: skill.id } },
    update: { level: parsed.data.level },
    create: { candidateId, skillId: skill.id, level: parsed.data.level },
  });

  revalidatePath(CV_PATH);
  return { success: true };
}

export async function removeSkillAction(formData: FormData): Promise<void> {
  const candidateId = await getCandidateId();
  if (!candidateId) return;

  const skillId = String(formData.get("skillId") ?? "");
  await prisma.candidateSkill.deleteMany({ where: { candidateId, skillId } });

  revalidatePath(CV_PATH);
}

/* ---------- Experience ---------- */

const experienceSchema = z.object({
  title: z.string().trim().min(1, "Job title is required").max(100),
  companyName: z.string().trim().min(1, "Company is required").max(100),
  location: z.string().trim().max(100),
  description: z.string().trim().max(2000, "Description is too long"),
});

export async function addExperienceAction(
  _prev: CvState,
  formData: FormData
): Promise<CvState> {
  const candidateId = await getCandidateId();
  if (!candidateId) return { error: "Unauthorized" };

  const parsed = experienceSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    companyName: String(formData.get("companyName") ?? ""),
    location: String(formData.get("location") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const period = parsePeriod(
    String(formData.get("startDate") ?? ""),
    String(formData.get("endDate") ?? ""),
    formData.get("isCurrent") === "on"
  );
  if ("error" in period) return { error: period.error };

  await prisma.experience.create({
    data: {
      candidateId,
      title: parsed.data.title,
      companyName: parsed.data.companyName,
      location: clean(parsed.data.location),
      description: clean(parsed.data.description),
      startDate: period.startDate,
      endDate: period.endDate,
      isCurrent: period.endDate === null,
    },
  });

  revalidatePath(CV_PATH);
  return { success: true };
}

export async function deleteExperienceAction(formData: FormData): Promise<void> {
  const candidateId = await getCandidateId();
  if (!candidateId) return;

  const id = String(formData.get("id") ?? "");
  await prisma.experience.deleteMany({ where: { id, candidateId } });

  revalidatePath(CV_PATH);
}

/* ---------- Education ---------- */

const educationSchema = z.object({
  degree: z.string().trim().min(1, "Degree is required").max(100),
  field: z.string().trim().max(100),
  school: z.string().trim().min(1, "School is required").max(100),
  description: z.string().trim().max(2000, "Description is too long"),
});

export async function addEducationAction(
  _prev: CvState,
  formData: FormData
): Promise<CvState> {
  const candidateId = await getCandidateId();
  if (!candidateId) return { error: "Unauthorized" };

  const parsed = educationSchema.safeParse({
    degree: String(formData.get("degree") ?? ""),
    field: String(formData.get("field") ?? ""),
    school: String(formData.get("school") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const period = parsePeriod(
    String(formData.get("startDate") ?? ""),
    String(formData.get("endDate") ?? ""),
    formData.get("isCurrent") === "on"
  );
  if ("error" in period) return { error: period.error };

  await prisma.education.create({
    data: {
      candidateId,
      degree: parsed.data.degree,
      field: clean(parsed.data.field),
      school: parsed.data.school,
      description: clean(parsed.data.description),
      startDate: period.startDate,
      endDate: period.endDate,
      isCurrent: period.endDate === null,
    },
  });

  revalidatePath(CV_PATH);
  return { success: true };
}

export async function deleteEducationAction(formData: FormData): Promise<void> {
  const candidateId = await getCandidateId();
  if (!candidateId) return;

  const id = String(formData.get("id") ?? "");
  await prisma.education.deleteMany({ where: { id, candidateId } });

  revalidatePath(CV_PATH);
}