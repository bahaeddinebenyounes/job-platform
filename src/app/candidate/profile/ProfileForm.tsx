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
      <input
        name="headline"
        type="text"
        placeholder="Headline (e.g. Full Stack Developer)"
        defaultValue={profile.headline ?? ""}
        className="rounded border p-2"
      />
      <input
        name="location"
        type="text"
        placeholder="Location"
        defaultValue={profile.location ?? ""}
        className="rounded border p-2"
      />
      <input
        name="phone"
        type="tel"
        placeholder="Phone"
        defaultValue={profile.phone ?? ""}
        className="rounded border p-2"
      />
      <textarea
        name="bio"
        rows={5}
        placeholder="About you"
        defaultValue={profile.bio ?? ""}
        className="rounded border p-2"
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">Profile saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black p-2 text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}