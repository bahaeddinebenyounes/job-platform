import Link from "next/link";
import type { JobStatus } from "@/generated/prisma/client";
import { requireEmployerCompanyPage } from "@/lib/authz/pages";
import { listJobs } from "@/modules/employer/jobs/service";
import { jobStatusAction } from "@/modules/employer/jobs/actions";
import { CONTRACT_LABELS, STATUS_LABELS } from "@/modules/employer/jobs/constants";

const BADGE: Record<string, string> = {
  DRAFT: "bg-page text-muted",
  PUBLISHED: "bg-brand-soft text-brand",
  CLOSED: "bg-red-50 text-red-700",
  EXPIRED: "bg-accent-soft text-amber-800",
};

const field =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

// EXPIRED est calculé à la lecture : publiée + date limite dépassée
const effectiveStatus = (j: { status: string; deadline: Date | null }) =>
  j.status === "PUBLISHED" && j.deadline && j.deadline < new Date() ? "EXPIRED" : j.status;

function ActionButton({ jobId, intent, label, danger }: {
  jobId: string; intent: string; label: string; danger?: boolean;
}) {
  return (
    <form action={jobStatusAction}>
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="intent" value={intent} />
      <button
        className={`text-sm font-medium transition ${
          danger ? "text-red-600 hover:text-red-700" : "text-brand hover:text-brand-hover"
        }`}
      >
        {label}
      </button>
    </form>
  );
}

export default async function JobsPage({ searchParams }: {
  searchParams: Promise<{ q?: string; status?: string; error?: string }>;
}) {
  const { companyId } = await requireEmployerCompanyPage();
  const sp = await searchParams;
  const status = ["DRAFT", "PUBLISHED", "CLOSED"].includes(sp.status ?? "")
    ? (sp.status as JobStatus) : undefined;
  const jobs = await listJobs(companyId, { q: sp.q?.trim() || undefined, status });

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Mes offres ({jobs.length})</h1>
        <Link
          href="/employer/jobs/new"
          className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-hover"
        >
          Nouvelle offre
        </Link>
      </div>

      {sp.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{sp.error}</p>
      )}

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Rechercher un titre…"
          className={`flex-1 ${field}`}
        />
        <select name="status" defaultValue={sp.status ?? ""} className={field}>
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publiée</option>
          <option value="CLOSED">Clôturée</option>
        </select>
        <button className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium transition hover:bg-page">
          Filtrer
        </button>
      </form>

      {jobs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          Aucune offre.
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {jobs.map((j) => {
          const st = effectiveStatus(j) as keyof typeof STATUS_LABELS;
          return (
            <li key={j.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/employer/jobs/${j.id}`} className="font-medium hover:text-brand">
                    {j.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {[CONTRACT_LABELS[j.contractType], j.place?.name, j.profession?.nameFr]
                      .filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${BADGE[st]}`}
                >
                  {STATUS_LABELS[st]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 border-t border-line pt-3">
                <Link
                  href={`/employer/jobs/${j.id}`}
                  className="text-sm font-medium text-brand transition hover:text-brand-hover"
                >
                  Modifier
                </Link>
                <Link
                  href={`/employer/jobs/${j.id}/applications`}
                  className="text-sm font-medium text-brand transition hover:text-brand-hover"
                >
                  Candidatures
                </Link>
                {j.status === "PUBLISHED"
                  ? <ActionButton jobId={j.id} intent="unpublish" label="Dépublier" />
                  : <ActionButton jobId={j.id} intent="publish" label="Publier" />}
                {j.status !== "CLOSED" && <ActionButton jobId={j.id} intent="close" label="Clôturer" />}
                <ActionButton jobId={j.id} intent="delete" label="Supprimer" danger />
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}