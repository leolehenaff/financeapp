import Image from "next/image";
import { MobileNav, Nav } from "@/components/nav";
import { logout } from "@/lib/actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2.5 whitespace-nowrap">
            <Image src="/remco-renard.png" alt="" width={34} height={34} className="rounded-full" />
            <div className="leading-tight">
              <div className="font-bold tracking-[-0.02em] text-[16px]">Remco</div>
              <div className="text-[12px] text-ink-3">Le CGP de Julie &amp; Léo</div>
            </div>
          </div>
          <Nav />
          <form action={logout} className="ml-auto"><button className="btn btn-ghost btn-sm gap-1.5" aria-label="Se déconnecter" title="Se déconnecter"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2H3.5A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14H6M10.5 11.5 14 8l-3.5-3.5M14 8H6" /></svg><span className="hidden sm:inline">Déconnexion</span></button></form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pt-2 sm:pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-24">{children}</main>
      <MobileNav />
    </>
  );
}
