import Link from "next/link";
import { logout } from "@/lib/actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="flex items-center gap-5 py-4 text-sm border-b border-neutral-200 dark:border-neutral-800 mb-6">
        <Link href="/">Ce mois</Link>
        <Link href="/patrimoine">Patrimoine</Link>
        <Link href="/journal">Journal</Link>
        <form action={logout} className="ml-auto"><button className="bg-transparent text-neutral-500 dark:bg-transparent dark:text-neutral-400 px-0">Sortir</button></form>
      </nav>
      {children}
    </>
  );
}
