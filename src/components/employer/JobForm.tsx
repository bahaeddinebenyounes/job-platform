"use client";

import { useActionState } from "react";
import { saveJobAction } from "@/modules/employer/jobs/actions";
import {
  CONTRACT_LABELS, CONTRACT_TYPES, EDUCATION_LABELS, EDUCATION_LEVELS,
  WORK_MODES, WORK_MODE_LABELS,
} from "@/modules/employer/jobs/constants";
import { Field, inputClass } from "./Field";

type Ref = { id: string; name: string };
export type JobFormDefaults = {
  id?: string; title?: string; description?: string; professionId?: string | null;
  experienceMinYears?: number | null; educationLevel?: string | null;
  contractType?: string; workMode?: string; salaryMin?: number | null;
  salaryMax?: number | null; placeId?: string | null; deadline?: string;
  skillIds?: string[];
};

export function JobForm({ defaults = {}, places, professions, skills }: {
  defaults?: JobFormDefaults; places: Ref[]; professions: Ref[]; skills: Ref[];
}) {
  const [state, action, pending] = useActionState(saveJobAction, {});
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-5">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      {state.message && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.message}</p>}

      <Field label="Titre *" error={e.title}>
        <input name="title" required maxLength={120} defaultValue={defaults.title} className={inputClass} />
      </Field>
      <Field label="Description *" error={e.description}>
        <textarea name="description" required rows={8} defaultValue={defaults.description} className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Métier" error={e.professionId}>
          <select name="professionId" defaultValue={defaults.professionId ?? ""} className={inputClass}>
            <option value="">Non précisé</option>
            {professions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Type de contrat *" error={e.contractType}>
          <select name="contractType" defaultValue={defaults.contractType ?? "CDI"} className={inputClass}>
            {CONTRACT_TYPES.map((c) => <option key={c} value={c}>{CONTRACT_LABELS[c]}</option>)}
          </select>
        </Field>
        <Field label="Mode de travail" error={e.workMode}>
          <select name="workMode" defaultValue={defaults.workMode ?? "ONSITE"} className={inputClass}>
            {WORK_MODES.map((w) => <option key={w} value={w}>{WORK_MODE_LABELS[w]}</option>)}
          </select>
        </Field>
        <Field label="Localisation" error={e.placeId}>
          <select name="placeId" defaultValue={defaults.placeId ?? ""} className={inputClass}>
            <option value="">Non précisée</option>
            {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Expérience minimale (années)" error={e.experienceMinYears}>
          <input name="experienceMinYears" type="number" min={0} defaultValue={defaults.experienceMinYears ?? ""} className={inputClass} />
        </Field>
        <Field label="Diplôme" error={e.educationLevel}>
          <select name="educationLevel" defaultValue={defaults.educationLevel ?? ""} className={inputClass}>
            <option value="">Non précisé</option>
            {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{EDUCATION_LABELS[l]}</option>)}
          </select>
        </Field>
        <Field label="Salaire min (TND)" error={e.salaryMin}>
          <input name="salaryMin" type="number" min={0} defaultValue={defaults.salaryMin ?? ""} className={inputClass} />
        </Field>
        <Field label="Salaire max (TND)" error={e.salaryMax}>
          <input name="salaryMax" type="number" min={0} defaultValue={defaults.salaryMax ?? ""} className={inputClass} />
        </Field>
        <Field label="Date limite" error={e.deadline}>
          <input name="deadline" type="date" defaultValue={defaults.deadline} className={inputClass} />
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Compétences demandées</legend>
        <div className="flex flex-wrap gap-3">
          {skills.map((s) => (
            <label key={s.id} className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="skillIds" value={s.id} defaultChecked={defaults.skillIds?.includes(s.id)} />
              {s.name}
            </label>
          ))}
        </div>
      </fieldset>

      {Object.keys(e).length > 0 && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          Corrigez les champs signalés ({Object.keys(e).join(", ")}).
        </p>
      )}

      <button disabled={pending} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        {pending ? "Enregistrement…" : defaults.id ? "Enregistrer" : "Créer l'offre (brouillon)"}
      </button>
    </form>
  );
}