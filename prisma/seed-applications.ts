import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const candidates = [
  { email: "cand1@test.local", fullName: "Sara Ben Ali", headline: "Développeuse React" },
  { email: "cand2@test.local", fullName: "Ahmed Trabelsi", headline: "Développeur Node.js" },
  { email: "cand3@test.local", fullName: "Mariem Gharbi", headline: "Designer UI" },
];

async function main() {
  const job = await prisma.job.findFirst({ orderBy: { createdAt: "asc" } });
  if (!job) throw new Error("Crée d'abord une offre dans /employer/jobs/new");

  for (const c of candidates) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: { email: c.email, role: "CANDIDATE" },
    });
    const profile = await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, fullName: c.fullName, headline: c.headline },
    });
    await prisma.application.upsert({
      where: { jobId_candidateId: { jobId: job.id, candidateId: profile.id } },
      update: {},
      create: {
        jobId: job.id,
        candidateId: profile.id,
        coverLetter: `Bonjour, je suis intéressé(e) par le poste « ${job.title} ».`,
      },
    });
  }
  console.log(`3 candidatures créées pour l'offre « ${job.title} ».`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());