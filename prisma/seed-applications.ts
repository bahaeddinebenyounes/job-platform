import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const passwordHash = "$2b$10$elgXH2On.ax0uLA1SebyquzM2PR66.d7trhQRsYyzhdvJTpqdSxji";

const candidates = [
  { email: "cand1@test.local", name: "Sara Ben Ali", headline: "Développeuse React" },
  { email: "cand2@test.local", name: "Ahmed Trabelsi", headline: "Développeur Node.js" },
  { email: "cand3@test.local", name: "Mariem Gharbi", headline: "Designer UI" },
];

async function main() {
  const job = await prisma.job.findFirst({ orderBy: { createdAt: "asc" } });
  if (!job) throw new Error("Aucune offre n'existe. Créez d'abord une offre dans /employer/jobs/new.");

  for (const c of candidates) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: { name: c.name, passwordHash, role: "CANDIDATE" },
      create: { email: c.email, name: c.name, passwordHash, role: "CANDIDATE" },
    });
    const profile = await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: { headline: c.headline },
      create: { userId: user.id, headline: c.headline },
    });
    await prisma.application.upsert({
      where: { candidateId_jobId: { candidateId: profile.id, jobId: job.id } },
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