"use client";

import { useActionState } from "react";
import { updateHiringStatusAction } from "@/modules/employer/company/actions";
import { HIRING_LABELS, HIRING_STATUSES } from "@/modules/employer/company/constants";
import { inputClass } from "./Field";

export function HiringStatusForm({
  defaultStatus,
  defaultNote,
}: {
  defaultStatus: (typeof HIRING_STATUSES)[number];
  defaultNote: string;
}) {
  const [state, action, pending] = useActionState(updateHiringStatusAction, {});

  return (
    <form action={action} className="space-y-3">
      {HIRING_STATUSES.map((s) => (
        <label key={s} className="flex items-center gap-2 text-sm">
          <input type="radio" name="hiringStatus" value={s} defaultChecked={s === defaultStatus} />
          {HIRING_LABELS[s]}
        </label>
      ))}
      <input
        name="hiringNote"
        maxLength={200}
        defaultValue={defaultNote}
        placeholder="Précision (ex. : 3 postes ouverts)"
        className={inputClass}
      />
      <button
        disabled={pending}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
      {state.message && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</p>
      )}
    </form>
  );
}