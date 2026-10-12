import { Nav } from "@/components/nav";
import { logout } from "@/lib/actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4 md:gap-6">
          <span className="font-bold tracking-[-0.02em] text-[17px] whitespace-nowrap hidden sm:inline">Carnet de bord</span>
          <Nav />
          <form action={logout} className="ml-auto"><button className="text-[13px] text-ink-3 hover:text-ink transition-colors">Sortir</button></form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pt-6 pb-24">{children}</main>
    </>
  );
}
