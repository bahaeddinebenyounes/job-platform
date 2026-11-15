import Link from "next/link";
import { CheckCircle2, Circle, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ScoreRing from "@/components/ScoreRing";

type Props = { userId: string; name: string };

export default async function CandidateHome({ userId, name }: Props) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      _count: {
        select: {
          skills: true,
          experiences: true,
          educations: true,
          applications: true,
        },
      },
    },
  });
  if (!profile) {
    return <main className="p-6">Profile not found.</main>;
  }

  const [pendingCount, topMatches] = await Promise.all([
    prisma.application.count({
      where: { candidateId: profile.id, status: "PENDING" },
    }),
    prisma.aIMatch.findMany({
      where: {
        candidateId: profile.id,
        job: {
          status: "OPEN",
          applications: { none: { candidateId: profile.id } },
        },
      },
      include: { job: { include: { company: true } } },
      orderBy: { score: "desc" },
      take: 4,
    }),
  ]);

  const steps = [
    { label: "Add a headline", done: !!profile.headline, href: "/candidate/profile" },
    { label: "Add your location", done: !!profile.location, href: "/candidate/profile" },
    { label: "Write your bio", done: !!profile.bio, href: "/candidate/profile" },
    { label: "Add a skill", done: profile._count.skills > 0, href: "/candidate/cv" },
    { label: "Add an experience", done: profile._count.experiences > 0, href: "/candidate/cv" },
    { label: "Add your education", done: profile._count.educations > 0, href: "/candidate/cv" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const percent = Math.round((doneCount / steps.length) * 100);
  const nextStep = steps.find((s) => !s.done);

  const firstName = name.split(" ")[0] ?? name;
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      {/* Hero */}
      <section className="rounded-2xl bg-brand p-6 text-white sm:p-8">
        {profile.headline && (
          <p className="text-sm text-white/70">{profile.headline}</p>
        )}
        <h1 className="mt-1 text-3xl font-semibold">Hello, {displayName}</h1>

        {nextStep ? (
          <>
            <p className="mt-3 max-w-md text-white/80">
              Your profile is {percent}% complete. The more you fill in, the
              better your job matches get.
            </p>
            <div className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${percent}%` }}
              />
            </div>
            <Link
              href={nextStep.href}
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand-soft"
            >
              {nextStep.label}
            </Link>
          </>
        ) : (
          <p className="mt-3 max-w-md text-white/80">
            Your profile is complete. Here are the jobs that fit you best.
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recommendations */}
        <section className="rounded-2xl border border-line bg-surface p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recommended for you</h2>
            <Link
              href="/candidate/recommendations"
              className="text-sm font-medium text-brand hover:text-brand-hover"
            >
              See all
            </Link>
          </div>

          {topMatches.length === 0 ? (
            <div className="flex flex-col items-start gap-3 py-6">
              <p className="max-w-sm text-sm text-muted">
                No matches yet. Add skills to your CV, then refresh your
                matches.
              </p>
              <Link
                href="/candidate/recommendations"
                className="inline-flex items-center justify-center rounded-lg border border-line px-4 py-2 text-sm font-medium transition hover:bg-page"
              >
                Open matches
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {topMatches.map((match) => (
                <li key={match.id} className="flex items-center gap-4 py-4">
                  <ScoreRing value={match.score} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{match.job.title}</p>
                    <p className="truncate text-sm text-muted">
                      {match.job.company.name}
                    </p>
                    {match.job.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                        <MapPin size={12} />
                        {match.job.location}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          <Link
            href="/candidate/applications"
            className="grid grid-cols-2 divide-x divide-line rounded-2xl border border-line bg-surface p-5 transition hover:border-brand"
          >
            <div className="pr-4">
              <p className="text-3xl font-semibold">
                {profile._count.applications}
              </p>
              <p className="text-sm text-muted">Applications</p>
            </div>
            <div className="pl-4">
              <p className="text-3xl font-semibold">{pendingCount}</p>
              <p className="text-sm text-muted">Pending</p>
            </div>
          </Link>

          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-3 text-lg font-semibold">Profile checklist</h2>
            <ul className="flex flex-col gap-2">
              {steps.map((step) => (
                <li key={step.label}>
                  <Link
                    href={step.href}
                    className={`flex items-center gap-2 text-sm transition ${
                      step.done
                        ? "text-muted line-through"
                        : "hover:text-brand"
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2 size={18} className="text-brand" />
                    ) : (
                      <Circle size={18} className="text-line" />
                    )}
                    {step.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}