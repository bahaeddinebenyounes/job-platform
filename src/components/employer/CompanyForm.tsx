"use client";

import { useActionState, useState } from "react";
import { createCompanyAction } from "@/modules/employer/company/actions";
import { HIRING_LABELS, HIRING_STATUSES } from "@/modules/employer/company/constants";
import { Field, inputClass } from "./Field";

type Place = { id: string; name: string; governorate: string };

export function CompanyForm({ places }: { places: Place[] }) {
  const [state, action, pending] = useActionState(createCompanyAction, {});
  const [preview, setPreview] = useState<string | null>(null);
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-6">
      {state.message && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.message}</p>}

      <fieldset className="space-y-4">
        <legend className="text-lg font-medium">Responsable du compte</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom *" error={e.firstName}>
            <input name="firstName" required maxLength={60} className={inputClass} />
          </Field>
          <Field label="Nom *" error={e.lastName}>
            <input name="lastName" required maxLength={60} className={inputClass} />
          </Field>
        </div>
        <Field label="Votre poste" error={e.jobTitle}>
          <input name="jobTitle" placeholder="ex. Responsable RH" className={inputClass} />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-medium">Entreprise</legend>

        <div className="flex items-center gap-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Aperçu du logo" className="h-20 w-20 rounded-md border object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed text-xs text-gray-400">
              Logo
            </div>
          )}
          <Field label="Logo (PNG, JPG ou WEBP, 2 Mo max)">
            <input
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="text-sm"
              onChange={(ev) => {
                const f = ev.target.files?.[0];
                setPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
          </Field>
        </div>

        <Field label="Nom de l'entreprise *" error={e.name}>
          <input name="name" required maxLength={100} className={inputClass} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Numéro de patente *" error={e.patenteNumber}>
            <input name="patenteNumber" required maxLength={30} className={inputClass} />
          </Field>
          <Field label="Nombre d'employés" error={e.employeeCount}>
            <input name="employeeCount" type="number" min={1} className={inputClass} />
          </Field>
          <Field label="Téléphone *" error={e.phone}>
            <input name="phone" type="tel" required className={inputClass} />
          </Field>
          <Field label="Email professionnel" error={e.contactEmail}>
            <input name="contactEmail" type="email" className={inputClass} />
          </Field>
          <Field label="Secteur d'activité" error={e.industry}>
            <input name="industry" maxLength={100} className={inputClass} />
          </Field>
          <Field label="Ville" error={e.placeId}>
            <select name="placeId" defaultValue="" className={inputClass}>
              <option value="">Non précisée</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.governorate})</option>
              ))}
            </select>
          </Field>
          <Field label="Adresse" error={e.address}>
            <input name="address" maxLength={200} className={inputClass} />
          </Field>
          <Field label="Site web" error={e.website}>
            <input name="website" placeholder="https://" className={inputClass} />
          </Field>
        </div>

        <Field label="Description" error={e.description}>
          <textarea name="description" rows={4} maxLength={2000} className={inputClass} />
        </Field>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-lg font-medium">Statut de recrutement</legend>
        {HIRING_STATUSES.map((s) => (
          <label key={s} className="flex items-center gap-2 text-sm">
            <input type="radio" name="hiringStatus" value={s} defaultChecked={s === "NOT_HIRING"} />
            {HIRING_LABELS[s]}
          </label>
        ))}
        <input name="hiringNote" maxLength={200} placeholder="Précision (ex. : 3 postes ouverts)" className={inputClass} />
      </fieldset>
{Object.keys(e).length > 0 && (
  <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
    Corrigez les champs signalés en rouge ({Object.keys(e).join(", ")}).
  </p>
)}
      <button
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Création…" : "Créer mon entreprise"}
      </button>
    </form>
  );
}