import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";
import { requireEmployerCompanyPage } from "@/lib/authz/pages";
import { getDashboard } from "@/modules/employer/dashboard/service";
import { APPLICATION_LABELS } from "@/modules/employer/applications/constants";
import { HIRING_LABELS } from "@/modules/employer/company/constants";
import { logoUrl } from "@/lib/storage/logo";

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const body = (
    <div
      className={`rounded-2xl border border-line bg-surface p-4 ${
        href ? "transition hover:border-brand" : ""
      }`}
    >
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
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
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <header className="flex items-center gap-4 rounded-2xl bg-brand p-6 text-white">
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt="Logo"
            className="h-16 w-16 rounded-xl border-2 border-white/30 bg-white object-cover"
          />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{d.company?.name}</h1>
          {d.company && (
            <p className="text-sm text-white/80">{HIRING_LABELS[d.company.hiringStatus]}</p>
          )}
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Offres</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Publiées" value={d.jobs.published} href="/employer/jobs?status=PUBLISHED" />
          <Stat label="Brouillons" value={d.jobs.draft} href="/employer/jobs?status=DRAFT" />
          <Stat label="Clôturées" value={d.jobs.closed} href="/employer/jobs?status=CLOSED" />
          <Stat label="Expirées" value={d.jobs.expired} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Candidatures ({d.apps.total})</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="En attente" value={d.apps.pending} />
          <Stat label="Présélectionnés" value={d.apps.shortlisted} />
          <Stat label="Entretiens" value={d.apps.interview} />
          <Stat label="Acceptés" value={d.apps.accepted} />
          <Stat label="Refusés" value={d.apps.rejected} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Dernières candidatures</h2>
        {d.recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
            Aucune candidature pour le moment.
          </div>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {d.recent.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
              >
                <span>
                  <strong className="font-medium">{a.candidate.user.name}</strong>
                  <span className="text-muted"> · {a.job.title}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-muted">{a.createdAt.toLocaleDateString("fr-FR")}</span>
                  <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand">
                    {APPLICATION_LABELS[a.status]}
                  </span>
                  <Link
                    href={`/employer/jobs/${a.job.id}/applications`}
                    className="font-medium text-brand hover:text-brand-hover"
                  >
                    Voir
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Stat
          label="Candidats visibles dans la recherche"
          value={d.searchable}
          href="/employer/candidates"
        />
        <Link
          href="/employer/jobs/new"
          className="flex items-center justify-center rounded-2xl bg-brand p-4 font-medium text-white transition hover:bg-brand-hover"
        >
          Publier une nouvelle offre
        </Link>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-3 text-lg font-semibold">Avancement du module Employer</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {FEATURES.map((f) => (
            <li key={f.label} className="flex items-center gap-2">
              {f.done ? (
                <CheckCircle2 size={18} className="shrink-0 text-brand" />
              ) : (
                <Clock3 size={18} className="shrink-0 text-muted" />
              )}
              <span className={f.done ? "" : "text-muted"}>{f.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}