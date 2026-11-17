import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
  PENDING: "bg-page text-muted",
  REVIEWING: "bg-sky-50 text-sky-700",
  SHORTLISTED: "bg-accent-soft text-amber-800",
  INTERVIEW: "bg-violet-50 text-violet-700",
  ACCEPTED: "bg-brand-soft text-brand",
  REJECTED: "bg-red-50 text-red-700",
  WITHDRAWN: "bg-page text-muted",
};

const ACTION_LABELS: Record<string, string> = {
  REVIEWING: "Mettre en étude",
  SHORTLISTED: "Présélectionner",
  INTERVIEW: "Proposer un entretien",
  ACCEPTED: "Accepter",
  REJECTED: "Refuser",
};

const field =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

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
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div>
        <Link
          href="/employer/jobs"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-hover"
        >
          <ArrowLeft size={16} /> Mes offres
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Candidatures : {job.title}</h1>
      </div>

      {sp.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{sp.error}</p>
      )}

      <form className="flex gap-2">
        <select name="status" defaultValue={sp.status ?? ""} className={field}>
          <option value="">Tous les statuts</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{APPLICATION_LABELS[s]}</option>
          ))}
        </select>
        <button className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium transition hover:bg-page">
          Filtrer
        </button>
      </form>

      {apps.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          Aucune candidature.
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {apps.map((a) => (
          <li
            key={a.id}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{a.candidate.user.name}</p>
                <p className="text-sm text-muted">{a.candidate.headline}</p>
                <p className="text-xs text-muted">
                  Reçue le {a.createdAt.toLocaleDateString("fr-FR")}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${BADGE[a.status]}`}
              >
                {APPLICATION_LABELS[a.status]}
              </span>
            </div>

            {a.coverLetter && (
              <p className="whitespace-pre-line rounded-lg bg-page p-3 text-sm">
                {a.coverLetter}
              </p>
            )}

            {(TRANSITIONS[a.status] ?? []).length > 0 && (
              <div className="flex flex-wrap items-end gap-3 border-t border-line pt-3">
                {(TRANSITIONS[a.status] ?? []).map((to) => (
                  <form key={to} action={changeStatusAction} className="flex items-end gap-2">
                    <input type="hidden" name="applicationId" value={a.id} />
                    <input type="hidden" name="jobId" value={id} />
                    <input type="hidden" name="toStatus" value={to} />
                    {to === "INTERVIEW" && (
                      <input
                        type="datetime-local"
                        name="interviewAt"
                        required
                        className={field}
                      />
                    )}
                    <button
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white transition ${
                        to === "REJECTED"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-brand hover:bg-brand-hover"
                      }`}
                    >
                      {ACTION_LABELS[to]}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}