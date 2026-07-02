import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Codexa" },
      { name: "description", content: "Create your free Codexa account." },
    ],
  }),
  component: Signup,
});

const schema = z.object({
  fullName: z.string().trim().min(1, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/login`,
        data: { full_name: parsed.data.fullName },
      },
    });
    if (err) {
      setLoading(false);
      setError(err.message);
      return;
    }
    // Always route users to /login after signup so they explicitly log in.
    if (data.session) {
      await supabase.auth.signOut();
    }
    setLoading(false);
    navigate({
      to: "/login",
      search: { justSignedUp: 1, email: parsed.data.email },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src="/codexa-logo.png" alt="Codexa" width={40} height={40} className="h-10 w-10 rounded-lg shadow-brand" />
          <span className="text-xl font-bold">Codexa</span>
        </Link>

        <div className="animate-fade-in-up rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start uncovering insights on any GitHub profile.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field icon={<User className="h-4 w-4" />} type="text" label="Full name" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
            <Field icon={<Mail className="h-4 w-4" />} type="email" label="Email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Field icon={<Lock className="h-4 w-4" />} type="password" label="Password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />

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
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-semibold text-gradient-brand hover:underline">Log in</Link>
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
