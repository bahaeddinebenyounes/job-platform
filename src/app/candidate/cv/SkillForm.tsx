"use client";

import { useActionState, useEffect, useRef } from "react";
import { addSkillAction, type CvState } from "./actions";

const initialState: CvState = {};

export default function SkillForm() {
  const [state, formAction, pending] = useActionState(
    addSkillAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="name"
          type="text"
          placeholder="Skill (e.g. React)"
          className="w-full flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <select
          name="level"
          defaultValue="2"
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          <option value="1">Beginner</option>
          <option value="2">Intermediate</option>
          <option value="3">Advanced</option>
          <option value="4">Expert</option>
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-50 sm:self-start"
      >
        {pending ? "Adding..." : "Add skill"}
      </button>
    </form>
  );
}