"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileState } from "./actions";

type Props = {
  profile: {
    phone: string | null;
    location: string | null;
    headline: string | null;
    bio: string | null;
  };
};

const initialState: ProfileState = {};

export default function ProfileForm({ profile }: Props) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Headline
        <input
          name="headline"
          type="text"
          placeholder="e.g. Full Stack Developer"
          defaultValue={profile.headline ?? ""}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm font-normal outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Location
          <input
            name="location"
            type="text"
            placeholder="City, Country"
            defaultValue={profile.location ?? ""}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm font-normal outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Phone
          <input
            name="phone"
            type="tel"
            placeholder="Phone number"
            defaultValue={profile.phone ?? ""}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm font-normal outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        About you
        <textarea
          name="bio"
          rows={5}
          placeholder="Tell employers who you are"
          defaultValue={profile.bio ?? ""}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm font-normal outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600">Profile saved.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}