import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";


type LoginSearch = { justSignedUp?: number; email?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    justSignedUp: s.justSignedUp ? Number(s.justSignedUp) : undefined,
    email: typeof s.email === "string" ? s.email : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Log in — Codexa" },
      { name: "description", content: "Log in to your Codexa account." },
    ],
  }),
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

function Login() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" }) as LoginSearch;
  const [email, setEmail] = useState(search.email ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (err) {
      setError(err.message === "Invalid login credentials" ? "Invalid email or password." : err.message);
      return;
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src="/codexa-logo.png" alt="Codexa" width={40} height={40} className="h-10 w-10 rounded-lg shadow-brand" />
          <span className="text-xl font-bold">Codexa</span>
        </Link>

        <div className="animate-fade-in-up rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Log in to continue analyzing GitHub profiles.</p>

          {search.justSignedUp ? (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>Account created. Log in to continue to your dashboard.</span>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">


            <Field icon={<Mail className="h-4 w-4" />} type="email" label="Email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Field icon={<Lock className="h-4 w-4" />} type="password" label="Password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-3 text-sm font-semibold text-white shadow-brand transition-smooth hover:scale-[1.01] disabled:opacity-70"
            >

              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="font-semibold text-gradient-brand hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, ...rest }: { icon: React.ReactNode; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input
          {...rest}
          required
          className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </label>
  );
}
