import { login } from "@/lib/actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <form action={login} className="mt-32 flex flex-col gap-3 max-w-xs mx-auto">
      <h1>Patrimoine</h1>
      <input type="password" name="password" placeholder="Mot de passe" autoFocus required />
      {error && <p className="text-sm text-red-600">Mot de passe incorrect.</p>}
      <button type="submit">Entrer</button>
    </form>
  );
}
