import Link from "next/link";
import { auth } from "@/auth";
import LogoutButton from "@/components/LogoutButton";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
if (session?.user?.role === "EMPLOYER") redirect("/employer/dashboard");
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      {session?.user ? (
        <>
          <p>
            Logged in as <strong>{session.user.name}</strong> ({session.user.role})
          </p>
          <LogoutButton />
        </>
      ) : (
        <>
          <p>You are not logged in.</p>
          <Link href="/login" className="underline">
            Log in
          </Link>
        </>
      )}
    </main>
  );
}