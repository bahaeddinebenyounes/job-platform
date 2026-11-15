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
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">My profile</h1>
        <p className="text-sm text-muted">
          This is what employers see first.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
        <ProfileForm
          profile={{
            phone: profile.phone,
            location: profile.location,
            headline: profile.headline,
            bio: profile.bio,
          }}
        />
      </div>
    </main>
  );
}