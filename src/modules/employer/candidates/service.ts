import { notFound } from "@/lib/errors";
import { candidateRepository as repo, type CandidateFilters } from "./repository";

export const searchCandidates = (f: CandidateFilters) => repo.search(f);
export const getCandidateReferentials = () => repo.referentials();

export async function getCandidate(companyId: string, id: string) {
  const c = await repo.findSearchable(id);
  if (!c) throw notFound(); // masqué OU inexistant : même réponse
  return c;
}