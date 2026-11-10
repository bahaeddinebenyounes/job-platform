import { prisma } from "@/lib/prisma";

export async function getDashboard(companyId: string) {
  const now = new Date();
  const [company, jobsByStatus, expired, appsByStatus, recent, searchable] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, logoKey: true, hiringStatus: true },
    }),
    prisma.job.groupBy({ by: ["status"], where: { companyId }, _count: { _all: true } }),
    prisma.job.count({ where: { companyId, status: "PUBLISHED", deadline: { lt: now } } }),
    prisma.application.groupBy({
      by: ["status"],
      where: { job: { companyId } },
      _count: { _all: true },
    }),
    prisma.application.findMany({
      where: { job: { companyId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, status: true, createdAt: true,
        job: { select: { id: true, title: true } },
        candidate: { select: { user: { select: { name: true } } } },
      },
    }),
    prisma.candidateProfile.count({ where: { profileVisibility: "SEARCHABLE" } }),
  ]);

  const jobs = Object.fromEntries(jobsByStatus.map((r) => [r.status, r._count._all]));
  const apps = Object.fromEntries(appsByStatus.map((r) => [r.status, r._count._all]));
  const total = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

  return {
    company,
    jobs: { total: total(jobs), draft: jobs.DRAFT ?? 0, published: (jobs.PUBLISHED ?? 0) - expired, closed: jobs.CLOSED ?? 0, expired },
    apps: { total: total(apps), pending: apps.PENDING ?? 0, shortlisted: apps.SHORTLISTED ?? 0, interview: apps.INTERVIEW ?? 0, accepted: apps.ACCEPTED ?? 0, rejected: apps.REJECTED ?? 0 },
    recent,
    searchable,
  };
}