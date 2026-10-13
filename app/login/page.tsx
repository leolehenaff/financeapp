import Image from "next/image";
import { login } from "@/lib/actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="min-h-dvh grid place-items-center px-4">
      <form action={login} className="panel w-full max-w-sm p-7 flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          <Image src="/remco-renard.png" alt="" width={56} height={56} className="rounded-full" />
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.01em]">Remco</h1>
            <p className="text-[14px] text-ink-2 mt-0.5">Le gestionnaire de patrimoine de Julie et Léo.</p>
          </div>
        </div>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-2">
          Mot de passe
          <input type="password" name="password" className="field" autoFocus required autoComplete="current-password" />
        </label>
        {error && <p className="text-[13px] text-down" role="alert">Mot de passe incorrect, réessaie.</p>}
        <button type="submit" className="btn btn-primary">Entrer</button>
      </form>
    </main>
  );
}
