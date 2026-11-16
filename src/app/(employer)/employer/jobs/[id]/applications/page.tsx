import Link from "next/link";
import { notFound } from "next/navigation";
import type { ApplicationStatus } from "@/generated/prisma/client";
import { requireEmployerCompanyPage } from "@/lib/authz/pages";
import { AppError } from "@/lib/errors";
import { getJob } from "@/modules/employer/jobs/service";
import { listApplications } from "@/modules/employer/applications/service";
import { changeStatusAction } from "@/modules/employer/applications/actions";
import {
  APPLICATION_LABELS, APPLICATION_STATUSES, TRANSITIONS,
} from "@/modules/employer/applications/constants";

const BADGE: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  REVIEWING: "bg-blue-100 text-blue-800",
  SHORTLISTED: "bg-purple-100 text-purple-800",
  INTERVIEW: "bg-amber-100 text-amber-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-gray-100 text-gray-500",
};

const ACTION_LABELS: Record<string, string> = {
  REVIEWING: "Mettre en étude",
  SHORTLISTED: "Présélectionner",
  INTERVIEW: "Proposer un entretien",
  ACCEPTED: "Accepter",
  REJECTED: "Refuser",
};

export default async function JobApplicationsPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const { companyId } = await requireEmployerCompanyPage();
  const { id } = await params;
  const sp = await searchParams;

  const job = await getJob(companyId, id).catch((e) => {
    if (e instanceof AppError && e.status === 404) return null;
    throw e;
  });
  if (!job) notFound();

  const status = (APPLICATION_STATUSES as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as ApplicationStatus) : undefined;
  const apps = await listApplications(companyId, id, status);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <Link href="/employer/jobs" className="text-sm text-blue-600 hover:underline">← Mes offres</Link>
        <h1 className="mt-2 text-2xl font-semibold">Candidatures : {job.title}</h1>
      </div>

      {sp.error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{sp.error}</p>}

      <form className="flex gap-2">
        <select name="status" defaultValue={sp.status ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="">Tous les statuts</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{APPLICATION_LABELS[s]}</option>
          ))}
        </select>
        <button className="rounded-md border px-3 py-2 text-sm">Filtrer</button>
      </form>

      <ul className="space-y-4">
        {apps.map((a) => (
          <li key={a.id} className="space-y-3 rounded-md border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{a.candidate.user.name}</p>
                <p className="text-sm text-gray-600">{a.candidate.headline}</p>
                <p className="text-xs text-gray-500">
                  Reçue le {a.createdAt.toLocaleDateString("fr-FR")}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${BADGE[a.status]}`}>
                {APPLICATION_LABELS[a.status]}
              </span>
            </div>

            {a.coverLetter && <p className="whitespace-pre-line text-sm">{a.coverLetter}</p>}

            {(TRANSITIONS[a.status] ?? []).length > 0 && (
              <div className="flex flex-wrap items-end gap-3">
                {(TRANSITIONS[a.status] ?? []).map((to) => (
                  <form key={to} action={changeStatusAction} className="flex items-end gap-2">
                    <input type="hidden" name="applicationId" value={a.id} />
                    <input type="hidden" name="jobId" value={id} />
                    <input type="hidden" name="toStatus" value={to} />
                    {to === "INTERVIEW" && (
                      <input type="datetime-local" name="interviewAt" required
                        className="rounded-md border border-gray-300 px-2 py-1 text-sm" />
                    )}
                    <button className={`rounded-md px-3 py-1.5 text-sm text-white ${
                      to === "REJECTED" ? "bg-red-600" : "bg-blue-600"}`}>
                      {ACTION_LABELS[to]}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </li>
        ))}
        {apps.length === 0 && <p className="text-sm text-gray-500">Aucune candidature.</p>}
      </ul>
    </main>
  );
}