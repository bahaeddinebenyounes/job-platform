/*
  Warnings:

  - The values [PROFESSIONAL,CLIENT] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('PROJECT', 'NEWS');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('CANDIDATE', 'EMPLOYER', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CANDIDATE';
COMMIT;

-- CreateTable
CREATE TABLE "CompanyPost" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "PostType" NOT NULL DEFAULT 'PROJECT',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageKeys" TEXT[],
    "videoUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyPost_companyId_createdAt_idx" ON "CompanyPost"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "CompanyPost" ADD CONSTRAINT "CompanyPost_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
