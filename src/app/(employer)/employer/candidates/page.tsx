import { requireEmployerCompanyPage } from "@/lib/authz/pages";
import {
  getCandidateReferentials, searchCandidates,
} from "@/modules/employer/candidates/service";
import { EDUCATION_LABELS } from "@/modules/employer/jobs/constants";

const sel = "rounded-md border border-gray-300 px-3 py-2 text-sm";

export default async function CandidatesPage({ searchParams }: {
  searchParams: Promise<{ professionId?: string; placeId?: string; years?: string; skill?: string | string[] }>;
}) {
  await requireEmployerCompanyPage();
  const sp = await searchParams;
  const skillIds = [sp.skill ?? []].flat().filter(Boolean);
  const years = sp.years ? Number(sp.years) : undefined;

  const [{ professions, places, skills }, candidates] = await Promise.all([
    getCandidateReferentials(),
    searchCandidates({
      professionId: sp.professionId || undefined,
      placeId: sp.placeId || undefined,
      skillIds,
      minYears: years != null && Number.isFinite(years) ? years : undefined,
    }),
  ]);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Rechercher des candidats</h1>

      <form className="space-y-3 rounded-md border p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <select name="professionId" defaultValue={sp.professionId ?? ""} className={sel}>
            <option value="">Tous les métiers</option>
            {professions.map((p) => <option key={p.id} value={p.id}>{p.nameFr}</option>)}
          </select>
          <select name="placeId" defaultValue={sp.placeId ?? ""} className={sel}>
            <option value="">Toutes les villes</option>
            {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input name="years" type="number" min={0} defaultValue={sp.years}
            placeholder="Expérience min. (ans)" className={sel} />
        </div>
        <div className="flex flex-wrap gap-3">
          {skills.map((s) => (
            <label key={s.id} className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="skill" value={s.id} defaultChecked={skillIds.includes(s.id)} />
              {s.name}
            </label>
          ))}
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white">Rechercher</button>
      </form>

      <p className="text-sm text-gray-600">{candidates.length} candidat(s)</p>
      <ul className="space-y-3">
        {candidates.map((c) => (
          <li key={c.id} className="rounded-md border p-4">
            <p className="font-medium">{c.headline ?? c.profession?.nameFr ?? "Candidat"}</p>
            <p className="text-sm text-gray-600">
              {[c.profession?.nameFr, c.place?.name,
                c.yearsExperience != null && `${c.yearsExperience} ans d'expérience`,
                c.educationLevel && EDUCATION_LABELS[c.educationLevel]]
                .filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1 text-sm">{c.skills.map((s) => s.skill.name).join(", ")}</p>
          </li>
        ))}
        {candidates.length === 0 && <p className="text-sm text-gray-500">Aucun candidat.</p>}
      </ul>
    </main>
  );
}