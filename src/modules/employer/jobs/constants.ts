export const CONTRACT_TYPES = ["CDI", "CDD", "INTERNSHIP", "FREELANCE", "PART_TIME", "APPRENTICESHIP"] as const;
export const WORK_MODES = ["ONSITE", "HYBRID", "REMOTE"] as const;
export const EDUCATION_LEVELS = ["NONE", "BAC", "BAC_PLUS_2", "LICENCE", "MASTER", "ENGINEER", "DOCTORATE"] as const;

export const CONTRACT_LABELS: Record<(typeof CONTRACT_TYPES)[number], string> = {
  CDI: "CDI", CDD: "CDD", INTERNSHIP: "Stage", FREELANCE: "Freelance",
  PART_TIME: "Temps partiel", APPRENTICESHIP: "Alternance",
};
export const WORK_MODE_LABELS: Record<(typeof WORK_MODES)[number], string> = {
  ONSITE: "Sur site", HYBRID: "Hybride", REMOTE: "Télétravail",
};
export const EDUCATION_LABELS: Record<(typeof EDUCATION_LEVELS)[number], string> = {
  NONE: "Aucun diplôme requis", BAC: "Bac", BAC_PLUS_2: "Bac+2", LICENCE: "Licence",
  MASTER: "Master", ENGINEER: "Ingénieur", DOCTORATE: "Doctorat",
};
export const STATUS_LABELS = {
  DRAFT: "Brouillon", PUBLISHED: "Publiée", CLOSED: "Clôturée", EXPIRED: "Expirée",
} as const;