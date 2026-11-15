"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addExperienceAction, type CvState } from "./actions";

const initialState: CvState = {};

export default function ExperienceForm() {
  const [state, formAction, pending] = useActionState(
    addExperienceAction,
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
      <input
        name="title"
        type="text"
        placeholder="Job title"
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="companyName"
          type="text"
          placeholder="Company"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <input
          name="location"
          type="text"
          placeholder="Location (optional)"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

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
        I currently work here
      </label>

      <textarea
        name="description"
        rows={3}
        placeholder="What did you do? (optional)"
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-50 sm:self-start"
      >
        {pending ? "Adding..." : "Add experience"}
      </button>
    </form>
  );
}