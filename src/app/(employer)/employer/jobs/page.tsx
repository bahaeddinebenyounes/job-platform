import Link from "next/link";
import type { JobStatus } from "@/generated/prisma/client";
import { requireEmployerCompanyPage } from "@/lib/authz/pages";
import { listJobs } from "@/modules/employer/jobs/service";
import { jobStatusAction } from "@/modules/employer/jobs/actions";
import { CONTRACT_LABELS, STATUS_LABELS } from "@/modules/employer/jobs/constants";

const BADGE: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PUBLISHED: "bg-green-100 text-green-800",
  CLOSED: "bg-red-100 text-red-800",
  EXPIRED: "bg-amber-100 text-amber-800",
};

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
      <button className={`text-sm hover:underline ${danger ? "text-red-600" : "text-blue-600"}`}>
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
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mes offres ({jobs.length})</h1>
        <Link href="/employer/jobs/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white">
          Nouvelle offre
        </Link>
      </div>

      {sp.error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{sp.error}</p>}

      <form className="flex gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Rechercher un titre…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <select name="status" defaultValue={sp.status ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publiée</option>
          <option value="CLOSED">Clôturée</option>
        </select>
        <button className="rounded-md border px-3 py-2 text-sm">Filtrer</button>
      </form>

      <ul className="space-y-3">
        {jobs.map((j) => {
          const st = effectiveStatus(j) as keyof typeof STATUS_LABELS;
          return (
            <li key={j.id} className="rounded-md border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/employer/jobs/${j.id}`} className="font-medium hover:underline">
                    {j.title}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {[CONTRACT_LABELS[j.contractType], j.place?.name, j.profession?.nameFr]
                      .filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${BADGE[st]}`}>
                  {STATUS_LABELS[st]}
                </span>
              </div>
              <div className="mt-3 flex gap-4">
                <Link href={`/employer/jobs/${j.id}`} className="text-sm text-blue-600 hover:underline">
                  Modifier
                </Link>
                <Link href={`/employer/jobs/${j.id}/applications`} className="text-sm text-blue-600 hover:underline">
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
        {jobs.length === 0 && <p className="text-sm text-gray-500">Aucune offre.</p>}
      </ul>
    </main>
  );
}