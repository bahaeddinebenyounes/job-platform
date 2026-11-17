import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getEmployerContext } from "@/lib/authz/employer";
import { logoUrl } from "@/lib/storage/logo";
import { getMyCompany } from "@/modules/employer/company/service";
import { HIRING_LABELS } from "@/modules/employer/company/constants";
import { HiringStatusForm } from "@/components/employer/HiringStatusForm";

const BADGE = {
  ACTIVELY_HIRING: "bg-brand-soft text-brand",
  OPEN_TO_APPLICATIONS: "bg-accent-soft text-amber-800",
  NOT_HIRING: "bg-page text-muted",
} as const;

export default async function CompanyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "EMPLOYER") redirect("/");

  const { companyId } = await getEmployerContext();
  if (!companyId) redirect("/employer/company/new");

  const c = await getMyCompany(companyId);
  const logo = logoUrl(c.logoKey);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-center gap-4">
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={`Logo ${c.name}`}
              className="h-20 w-20 rounded-xl border border-line object-cover"
            />
          )}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">{c.name}</h1>
            <span
              className={`inline-block self-start rounded-full px-3 py-1 text-xs font-medium ${BADGE[c.hiringStatus]}`}
            >
              {HIRING_LABELS[c.hiringStatus]}
            </span>
          </div>
        </div>
        {c.hiringNote && <p className="text-sm text-muted">{c.hiringNote}</p>}
        <p className="text-sm text-muted">
          {[c.industry, c.employeeCount && `${c.employeeCount} employés`, c.place?.name]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {c.description && <p className="whitespace-pre-line text-sm">{c.description}</p>}
      </header>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-3 text-lg font-semibold">Informations</h2>
        <ul className="flex flex-col gap-1.5 text-sm">
          <li>
            <span className="text-muted">Patente : </span>
            {c.patenteNumber}
          </li>
          {c.phone && (
            <li>
              <span className="text-muted">Téléphone : </span>
              {c.phone}
            </li>
          )}
          {c.contactEmail && (
            <li>
              <span className="text-muted">Email : </span>
              {c.contactEmail}
            </li>
          )}
          {c.website && (
            <li>
              <span className="text-muted">Site : </span>
              {c.website}
            </li>
          )}
          {c.address && (
            <li>
              <span className="text-muted">Adresse : </span>
              {c.address}
            </li>
          )}
        </ul>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold">Statut de recrutement</h2>
        <HiringStatusForm defaultStatus={c.hiringStatus} defaultNote={c.hiringNote ?? ""} />
      </section>
    </main>
  );
}