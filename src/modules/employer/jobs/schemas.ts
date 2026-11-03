import { z } from "zod";
import { CONTRACT_TYPES, EDUCATION_LEVELS, WORK_MODES } from "./constants";

const optText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => v || undefined);
const optInt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number({ message: "Nombre invalide" }).int().min(0).max(10_000_000).optional(),
);
const optEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), z.enum(values).optional());

export const jobSchema = z
  .object({
    title: z.string().trim().min(3, "Au moins 3 caractères").max(120),
    description: z.string().trim().min(30, "Au moins 30 caractères").max(10000),
    professionId: optText(50),
    experienceMinYears: optInt,
    educationLevel: optEnum(EDUCATION_LEVELS),
    contractType: z.enum(CONTRACT_TYPES),
    workMode: z.enum(WORK_MODES).default("ONSITE"),
    salaryMin: optInt,
    salaryMax: optInt,
    placeId: optText(50),
    deadline: optText(10)
      .transform((v) => (v ? new Date(`${v}T23:59:59`) : undefined))
      .refine((d) => !d || !Number.isNaN(d.getTime()), "Date invalide"),
    skillIds: z.array(z.string().min(1)).max(30).default([]),
  })
  .refine((d) => d.salaryMin == null || d.salaryMax == null || d.salaryMax >= d.salaryMin, {
    message: "Le salaire max doit être supérieur ou égal au min",
    path: ["salaryMax"],
  });

export type JobInput = z.infer<typeof jobSchema>;

// FormData -> objet (les cases à cocher multiples exigent getAll)
export const parseJobForm = (fd: FormData) =>
  jobSchema.safeParse({ ...Object.fromEntries(fd), skillIds: fd.getAll("skillIds") });