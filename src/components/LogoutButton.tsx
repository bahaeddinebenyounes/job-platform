import { signOut } from "@/auth";

export default function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button type="submit" className="rounded border px-3 py-1 text-sm">
        Log out
      </button>
    </form>
  );
}