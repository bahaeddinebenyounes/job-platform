export const HIRING_STATUSES = ["ACTIVELY_HIRING", "OPEN_TO_APPLICATIONS", "NOT_HIRING"] as const;

export const HIRING_LABELS: Record<(typeof HIRING_STATUSES)[number], string> = {
  ACTIVELY_HIRING: "Recrute activement",
  OPEN_TO_APPLICATIONS: "Ouvert aux candidatures spontanées",
  NOT_HIRING: "Ne recrute pas actuellement",
};