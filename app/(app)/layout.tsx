import { Nav } from "@/components/nav";
import { logout } from "@/lib/actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 flex items-center gap-4 md:gap-6">
          <span className="font-semibold tracking-[-0.01em] text-[15px] py-3 whitespace-nowrap hidden sm:inline">Carnet de bord</span>
          <Nav />
          <form action={logout} className="ml-auto"><button className="text-[13px] text-ink-3 hover:text-ink transition-colors">Sortir</button></form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24">{children}</main>
    </>
  );
}
