import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Finishing sign in — Codexa" },
      { name: "description", content: "Finishing your secure Codexa sign in." },
    ],
  }),
  component: AuthCallback,
});

function safeNext(value: string | null): "/" | "/dashboard" {
  return value === "/" || value === "/dashboard" ? value : "/dashboard";
}

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const next = useMemo(() => {
    if (typeof window === "undefined") return "/dashboard";
    return safeNext(new URLSearchParams(window.location.search).get("next"));
  }, []);

  useEffect(() => {
    let active = true;

    const finishAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else {
          const { error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
        }

        if (!active) return;
        navigate({ to: next, replace: true });
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
      }
    };

    finishAuth();

    return () => {
      active = false;
    };
  }, [navigate, next]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <img
          src="/codexa-logo.png"
          alt="Codexa"
          width={48}
          height={48}
          className="mx-auto h-12 w-12 rounded-xl shadow-brand"
        />
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Finishing sign in</h1>

        {error ? (
          <>
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-left text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-brand px-4 py-3 text-sm font-semibold text-white shadow-brand transition-smooth hover:scale-[1.01]"
            >
              Back to login
            </Link>
          </>
        ) : (
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Securing your session…
          </div>
        )}
      </div>
    </div>
  );
}