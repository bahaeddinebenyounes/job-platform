"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addEducationAction, type CvState } from "./actions";

const initialState: CvState = {};

export default function EducationForm() {
  const [state, formAction, pending] = useActionState(
    addEducationAction,
    initialState
  );
  const [isCurrent, setIsCurrent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setIsCurrent(false);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="degree"
          type="text"
          placeholder="Degree (e.g. Engineering cycle)"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <input
          name="field"
          type="text"
          placeholder="Field of study (optional)"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <input
        name="school"
        type="text"
        placeholder="School"
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Start
          <input
            name="startDate"
            type="month"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          End
          <input
            name="endDate"
            type="month"
            disabled={isCurrent}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          name="isCurrent"
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => setIsCurrent(e.target.checked)}
          className="accent-brand"
        />
        I am currently studying here
      </label>

      <textarea
        name="description"
        rows={3}
        placeholder="Details (optional)"
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-50 sm:self-start"
      >
        {pending ? "Adding..." : "Add education"}
      </button>
    </form>
  );
}