import { Nav } from "@/components/nav";
import { logout } from "@/lib/actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4 md:gap-6">
          <span className="font-bold tracking-[-0.02em] text-[17px] whitespace-nowrap hidden sm:inline">Carnet de bord</span>
          <Nav />
          <form action={logout} className="ml-auto"><button className="btn btn-ghost btn-sm gap-1.5" aria-label="Se déconnecter" title="Se déconnecter"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2H3.5A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14H6M10.5 11.5 14 8l-3.5-3.5M14 8H6" /></svg><span className="hidden sm:inline">Déconnexion</span></button></form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pt-6 pb-24">{children}</main>
    </>
  );
}
