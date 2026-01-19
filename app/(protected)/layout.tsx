"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  History,
  DollarSign,
  LogOut,
  Menu,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Assets", href: "/assets", icon: Wallet },
  { name: "Projections", href: "/projections", icon: TrendingUp },
  { name: "Historique", href: "/history", icon: History },
  { name: "Dividendes", href: "/dividends", icon: DollarSign },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load sidebar state from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setSidebarCollapsed(saved === "true");
    }
  }, []);

  // Save sidebar state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background bg-radial-gold">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/50 glass">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <span className="font-display text-lg font-semibold text-gradient-gold">
            Portfolio
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="hover:bg-accent"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 w-72 h-full bg-sidebar border-r border-sidebar-border animate-slide-in-left flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold">
                  <Sparkles className="h-5 w-5 text-background" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-semibold text-gradient-gold">
                    Portfolio
                  </h1>
                  <p className="text-xs text-muted-foreground">Tracker</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navigation.map((item, index) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        "opacity-0 animate-fade-up",
                        isActive
                          ? "sidebar-active text-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isActive ? "text-gold" : ""
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-6 border-t border-sidebar-border/50 shrink-0">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-rose hover:bg-rose/10"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className={cn(
          "hidden lg:flex flex-col border-r border-sidebar-border h-screen bg-sidebar/50 backdrop-blur-xl shrink-0 transition-all duration-300 sticky top-0",
          sidebarCollapsed ? "w-20" : "w-72"
        )}>
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border/50">
            <div className={cn(
              "flex items-center gap-3",
              sidebarCollapsed && "justify-center"
            )}>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold via-gold-light to-gold-dark flex items-center justify-center glow-gold animate-float shrink-0">
                <Sparkles className="h-5 w-5 text-background" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="font-display text-xl font-semibold text-gradient-gold tracking-tight">
                    Portfolio
                  </h1>
                  <p className="text-xs text-muted-foreground tracking-wide">
                    Wealth Tracker
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item, index) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    "opacity-0 animate-fade-up",
                    isActive
                      ? "sidebar-active text-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                  style={{ animationDelay: `${index * 0.05 + 0.1}s` }}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-gold/20"
                        : "bg-transparent group-hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive
                          ? "text-gold"
                          : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                      )}
                    />
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span>{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Always visible action buttons */}
          <div className="p-4 border-t border-sidebar-border/50 space-y-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors",
                sidebarCollapsed ? "justify-center px-2" : "justify-start gap-3"
              )}
              onClick={toggleSidebar}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  <span className="text-sm">Réduire</span>
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "w-full gap-3 text-muted-foreground hover:text-rose hover:bg-rose/10 transition-colors",
                sidebarCollapsed ? "justify-center px-2" : "justify-start"
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {!sidebarCollapsed && <span className="text-sm">Déconnexion</span>}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen overflow-x-hidden">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
