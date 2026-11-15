import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { withdrawApplicationAction } from "./actions";

const STATUS_LABELS = {
  PENDING: { text: "Pending", className: "bg-page text-muted" },
  REVIEWED: { text: "Reviewed", className: "bg-sky-50 text-sky-700" },
  SHORTLISTED: { text: "Shortlisted", className: "bg-accent-soft text-amber-800" },
  REJECTED: { text: "Rejected", className: "bg-red-50 text-red-700" },
  ACCEPTED: { text: "Accepted", className: "bg-brand-soft text-brand" },
} as const;

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) redirect("/");

  const applications = await prisma.application.findMany({
    where: { candidateId: profile.id },
    include: { job: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">My applications</h1>
        <p className="text-sm text-muted">
          Follow where each application stands.
        </p>
      </div>

      {applications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-medium">No applications yet</p>
          <p className="mt-1 text-sm text-muted">
            Jobs you apply to will show up here with their status.
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {applications.map((app) => {
          const status = STATUS_LABELS[app.status];
          return (
            <li
              key={app.id}
              className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-4"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft font-semibold text-brand">
                {app.job.company.name.charAt(0).toUpperCase()}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{app.job.title}</p>
                    <p className="truncate text-sm text-muted">
                      {app.job.company.name}
                      {app.job.location ? `, ${app.job.location}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.text}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                  <span>
                    Applied{" "}
                    {app.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {app.status === "PENDING" && (
                    <form action={withdrawApplicationAction}>
                      <input type="hidden" name="id" value={app.id} />
                      <button
                        type="submit"
                        className="font-medium transition hover:text-red-600"
                      >
                        Withdraw
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}