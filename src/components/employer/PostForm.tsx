"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPostAction } from "@/modules/employer/posts/actions";
import { Field, inputClass } from "./Field";

export function PostForm() {
  const [state, action, pending] = useActionState(createPostAction, {});
  const ref = useRef<HTMLFormElement>(null);
  const e = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3 rounded-md border bg-white p-4">
      <Field label="Type" error={e.type}>
        <select name="type" className={inputClass}>
          <option value="PROJECT">Réalisation</option>
          <option value="NEWS">Actualité</option>
        </select>
      </Field>
      <Field label="Titre" error={e.title}>
        <input name="title" required maxLength={120} className={inputClass} />
      </Field>
      <Field label="Description" error={e.content}>
        <textarea name="content" required rows={4} className={inputClass} />
      </Field>
      <Field label="Images (4 max, PNG/JPG/WEBP, 3 Mo chacune)">
        <input name="images" type="file" multiple accept="image/png,image/jpeg,image/webp" className="text-sm" />
      </Field>
      <Field label="Vidéo (lien YouTube ou Vimeo)" error={e.videoUrl}>
        <input name="videoUrl" placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
      </Field>
      <button disabled={pending} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">
        {pending ? "Publication…" : "Publier"}
      </button>
      {state.message && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</p>
      )}
    </form>
  );
}