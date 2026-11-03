import type { ReactNode } from "react";

export function Field({ label, error, children }: { label: string; error?: string[]; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error?.[0] && <p className="text-sm text-red-600">{error[0]}</p>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";