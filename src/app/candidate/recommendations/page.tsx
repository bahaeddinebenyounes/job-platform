import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ScoreRing from "@/components/ScoreRing";
import { refreshRecommendationsAction } from "./actions";

export default async function RecommendationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, _count: { select: { skills: true } } },
  });
  if (!profile) redirect("/");

  const matches = await prisma.aIMatch.findMany({
    where: {
      candidateId: profile.id,
      job: {
         status: "PUBLISHED",
        applications: { none: { candidateId: profile.id } },
      },
    },
    include: { job: { include: { company: true, place: true } } },
    orderBy: { score: "desc" },
  });

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Job matches</h1>
          <p className="text-sm text-muted">
            Open jobs ranked by how well they fit your skills.
          </p>
        </div>
        <form action={refreshRecommendationsAction}>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-hover"
          >
            Refresh
          </button>
        </form>
      </div>

      {profile._count.skills === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-medium">Add skills to get matches</p>
          <p className="mt-1 text-sm text-muted">
            Matches are based on the skills in your CV.
          </p>
        </div>
      )}

      {profile._count.skills > 0 && matches.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-medium">No matches yet</p>
          <p className="mt-1 text-sm text-muted">
            Press Refresh to compute your matches.
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {matches.map((match) => (
          <li
            key={match.id}
            className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4"
          >
            <ScoreRing value={match.score} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{match.job.title}</p>
              <p className="truncate text-sm text-muted">
                {match.job.company.name}
              </p>
              {match.job.place && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <MapPin size={12} />
                  {match.job.place.name}, {match.job.place.governorate}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}