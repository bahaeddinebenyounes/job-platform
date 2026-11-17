import { requireEmployerCompanyPage } from "@/lib/authz/pages";
import {
  getCandidateReferentials, searchCandidates,
} from "@/modules/employer/candidates/service";
import { EDUCATION_LABELS } from "@/modules/employer/jobs/constants";

const field =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

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
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Rechercher des candidats</h1>

      <form className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <select name="professionId" defaultValue={sp.professionId ?? ""} className={field}>
            <option value="">Tous les métiers</option>
            {professions.map((p) => <option key={p.id} value={p.id}>{p.nameFr}</option>)}
          </select>
          <select name="placeId" defaultValue={sp.placeId ?? ""} className={field}>
            <option value="">Toutes les villes</option>
            {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input
            name="years"
            type="number"
            min={0}
            defaultValue={sp.years}
            placeholder="Expérience min. (ans)"
            className={field}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <label
              key={s.id}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm"
            >
              <input
                type="checkbox"
                name="skill"
                value={s.id}
                defaultChecked={skillIds.includes(s.id)}
                className="accent-brand"
              />
              {s.name}
            </label>
          ))}
        </div>

        <button className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-hover sm:self-start">
          Rechercher
        </button>
      </form>

      <p className="text-sm text-muted">{candidates.length} candidat(s)</p>

      {candidates.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          Aucun candidat.
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {candidates.map((c) => (
          <li key={c.id} className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-medium">
              {c.headline ?? c.profession?.nameFr ?? "Candidat"}
            </p>
            <p className="text-sm text-muted">
              {[c.profession?.nameFr, c.place?.name,
                c.yearsExperience != null && `${c.yearsExperience} ans d'expérience`,
                c.educationLevel && EDUCATION_LABELS[c.educationLevel]]
                .filter(Boolean).join(" · ")}
            </p>
            {c.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {c.skills.map((s) => (
                  <span
                    key={s.skill.name}
                    className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand"
                  >
                    {s.skill.name}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}