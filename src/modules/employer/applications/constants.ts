export const APPLICATION_STATUSES = [
  "PENDING", "REVIEWING", "SHORTLISTED", "INTERVIEW", "ACCEPTED", "REJECTED", "WITHDRAWN",
] as const;

export const APPLICATION_LABELS = {
  PENDING: "En attente",
  REVIEWING: "En étude",
  SHORTLISTED: "Présélectionné",
  INTERVIEW: "Entretien",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  WITHDRAWN: "Retirée par le candidat",
} as const;

// Transitions autorisées pour l'employeur (WITHDRAWN appartient au candidat)
export const TRANSITIONS: Record<string, readonly string[]> = {
  PENDING: ["REVIEWING", "REJECTED"],
  REVIEWING: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["ACCEPTED", "REJECTED"],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};