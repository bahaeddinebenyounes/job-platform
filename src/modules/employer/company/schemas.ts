import { z } from "zod";
import { HIRING_STATUSES } from "./constants";

// Un champ vide d'un <form> arrive en "" : on le convertit en undefined.
const opt = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => v || undefined);

export const companySchema = z.object({
  firstName: z.string().trim().min(2, "Prénom requis").max(60),
  lastName: z.string().trim().min(2, "Nom requis").max(60),
  jobTitle: opt(100),

  name: z.string().trim().min(2, "Nom de l'entreprise requis").max(100),
  patenteNumber: z
  .string().trim().min(3, "Numéro de patente requis").max(30)
  .regex(/^[A-Za-z0-9/ -]+$/, "Caractères autorisés : lettres, chiffres, / et -")
  .transform((v) => v.replace(/[\s-]+/g, "").toUpperCase()), // "abc 123" et "ABC-123" => "ABC123"
  employeeCount: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number({ message: "Nombre invalide" }).int().min(1, "Au moins 1").max(1_000_000).optional(),
  ),
  phone: z.string().trim().regex(/^[+0-9 ()-]{6,30}$/, "Numéro invalide"),
  contactEmail: opt(150).refine((v) => !v || z.email().safeParse(v).success, "Email invalide"),
  industry: opt(100),
  placeId: opt(50),
  address: opt(200),
  website: opt(200).refine((v) => !v || /^https?:\/\/.+\..+/.test(v), "URL invalide (http:// ou https://)"),
  description: opt(2000),

  hiringStatus: z.enum(HIRING_STATUSES).default("NOT_HIRING"),
  hiringNote: opt(200),
});

export type CompanyInput = z.infer<typeof companySchema>;
export const hiringStatusSchema = z.object({
  hiringStatus: z.enum(HIRING_STATUSES),
  hiringNote: opt(200),
});

export type HiringStatusInput = z.infer<typeof hiringStatusSchema>;