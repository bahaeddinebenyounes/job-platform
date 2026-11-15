import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CandidateHome from "./CandidateHome";
import EmployerHome from "./EmployerHome";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const name = session.user.name ?? "";

  switch (session.user.role) {
    case "CANDIDATE":
      return <CandidateHome userId={session.user.id} name={name} />;
    case "EMPLOYER":
      return <EmployerHome userId={session.user.id} name={name} />;
    default:
      return (
        <main className="mx-auto max-w-2xl p-6">
          <h1 className="text-2xl font-semibold">Admin area coming soon</h1>
        </main>
      );
  }
}