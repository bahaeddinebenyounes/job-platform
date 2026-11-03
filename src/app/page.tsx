import Link from "next/link";
import { auth } from "@/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function HomePage() {
  const session = await auth();

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