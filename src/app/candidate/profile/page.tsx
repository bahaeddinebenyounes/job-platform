import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">My profile</h1>
      <ProfileForm
        profile={{
          phone: profile.phone,
          location: profile.location,
          headline: profile.headline,
          bio: profile.bio,
        }}
      />
    </main>
  );
}