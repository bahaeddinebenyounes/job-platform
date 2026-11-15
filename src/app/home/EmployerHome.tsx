type Props = { userId: string; name: string };

export default function EmployerHome({ name }: Props) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Welcome, {name}</h1>
      <p className="text-sm text-gray-500">Employer home, to be built.</p>
    </main>
  );
}