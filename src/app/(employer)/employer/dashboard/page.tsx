import Link from "next/link";
import { requireEmployerCompanyPage } from "@/lib/authz/pages";
import { getDashboard } from "@/modules/employer/dashboard/service";
import { APPLICATION_LABELS } from "@/modules/employer/applications/constants";
import { HIRING_LABELS } from "@/modules/employer/company/constants";
import { logoUrl } from "@/lib/storage/logo";

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const body = (
    <div className="rounded-md border bg-white p-4">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

const FEATURES = [
  { done: true, label: "Création du compte entreprise (patente, logo, effectif)" },
  { done: true, label: "Statut de recrutement modifiable" },
  { done: true, label: "Publications de l'entreprise (texte, images, vidéo)" },
  { done: true, label: "Offres : création, modification, publication, dépublication, clôture" },
  { done: true, label: "Candidatures : filtre, présélection, entretien, acceptation, refus" },
  { done: true, label: "Recherche de candidats avec règles de confidentialité" },
  { done: true, label: "Tableau de bord et navigation employeur" },
  { done: false, label: "Services / Professionnels" },
  { done: false, label: "Matching IA candidats ↔ offres" },
];

export default async function DashboardPage() {
  const { companyId } = await requireEmployerCompanyPage();
  const d = await getDashboard(companyId);
  const logo = logoUrl(d.company?.logoKey);

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="flex items-center gap-4">
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="Logo" className="h-16 w-16 rounded-md border object-cover" />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{d.company?.name}</h1>
          {d.company && <p className="text-sm text-gray-600">{HIRING_LABELS[d.company.hiringStatus]}</p>}
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Offres</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Publiées" value={d.jobs.published} href="/employer/jobs?status=PUBLISHED" />
          <Stat label="Brouillons" value={d.jobs.draft} href="/employer/jobs?status=DRAFT" />
          <Stat label="Clôturées" value={d.jobs.closed} href="/employer/jobs?status=CLOSED" />
          <Stat label="Expirées" value={d.jobs.expired} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Candidatures ({d.apps.total})</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="En attente" value={d.apps.pending} />
          <Stat label="Présélectionnés" value={d.apps.shortlisted} />
          <Stat label="Entretiens" value={d.apps.interview} />
          <Stat label="Acceptés" value={d.apps.accepted} />
          <Stat label="Refusés" value={d.apps.rejected} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Dernières candidatures</h2>
        <ul className="space-y-2">
          {d.recent.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-md border bg-white p-3 text-sm">
              <span>
                <strong>{a.candidate.user.name}</strong> · {a.job.title}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-gray-500">{a.createdAt.toLocaleDateString("fr-FR")}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{APPLICATION_LABELS[a.status]}</span>
                <Link href={`/employer/jobs/${a.job.id}/applications`} className="text-blue-600 hover:underline">
                  Voir
                </Link>
              </span>
            </li>
          ))}
          {d.recent.length === 0 && <p className="text-sm text-gray-500">Aucune candidature pour le moment.</p>}
        </ul>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Stat label="Candidats visibles dans la recherche" value={d.searchable} href="/employer/candidates" />
        <Link href="/employer/jobs/new" className="flex items-center justify-center rounded-md bg-blue-600 p-4 text-white">
          Publier une nouvelle offre
        </Link>
      </section>

      <section className="space-y-2 rounded-md border bg-white p-4">
        <h2 className="text-lg font-medium">Avancement du module Employer</h2>
        <ul className="space-y-1 text-sm">
          {FEATURES.map((f) => (
            <li key={f.label}>{f.done ? "✅" : "⏳"} {f.label}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}