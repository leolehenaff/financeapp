"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-radial-gold relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-gold/40 animate-pulse-gold" />
      <div className="absolute top-40 right-32 w-1.5 h-1.5 rounded-full bg-gold/30 animate-pulse-gold" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-32 left-40 w-1 h-1 rounded-full bg-gold/50 animate-pulse-gold" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo and branding */}
        <div className="text-center mb-8 opacity-0 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold via-gold-light to-gold-dark mb-6 glow-gold animate-float">
            <Sparkles className="h-8 w-8 text-background" />
          </div>
          <h1 className="font-display text-4xl font-semibold text-gradient-gold mb-2">
            Portfolio Tracker
          </h1>
          <p className="text-muted-foreground text-sm">
            Votre patrimoine, en un coup d&apos;oeil
          </p>
        </div>

        {/* Login card */}
        <div className="stat-card p-8 opacity-0 animate-fade-up stagger-1">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-gold/10">
                <Lock className="h-4 w-4 text-gold" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Accès sécurisé
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-rose/10 border-rose/30 text-rose animate-scale-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez le mot de passe"
                  autoFocus
                  className="h-12 bg-input border-border/50 focus:border-gold/50 input-glow transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 btn-gold text-background font-semibold group"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8 opacity-0 animate-fade-up stagger-2">
          Midnight Luxe Design System
        </p>
      </div>
    </div>
  );
}
