import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, User as UserIcon, Lock, AlertCircle, CheckCircle2, Trash2, Mail } from "lucide-react";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { clearResult } from "@/lib/analysis-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Profile & settings — Codexa" },
      { name: "description", content: "Manage your Codexa profile, password, and account." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const [fullName, setFullName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Redirect unauthenticated users to login.
  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  // Load profile row into the name field.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const meta = (user.user_metadata?.full_name as string | undefined) ?? "";
      setFullName(meta);
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled && data?.full_name) setFullName(data.full_name);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileMsg(null);
    const parsed = z.string().trim().min(1, "Name is required").max(100).safeParse(fullName);
    if (!parsed.success) {
      setProfileMsg({ type: "err", text: parsed.error.issues[0]?.message ?? "Invalid name" });
      return;
    }
    setProfileLoading(true);
    const { error: dbErr } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: parsed.data }, { onConflict: "id" });
    if (!dbErr) {
      await supabase.auth.updateUser({ data: { full_name: parsed.data } });
    }
    setProfileLoading(false);
    setProfileMsg(
      dbErr
        ? { type: "err", text: dbErr.message }
        : { type: "ok", text: "Profile updated." },
    );
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    const parsed = z
      .object({
        newPass: z.string().min(8, "Password must be at least 8 characters").max(128),
        confirmPass: z.string(),
      })
      .refine((v) => v.newPass === v.confirmPass, {
        message: "Passwords don't match",
        path: ["confirmPass"],
      })
      .safeParse({ newPass, confirmPass });
    if (!parsed.success) {
      setPassMsg({ type: "err", text: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }
    setPassLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: parsed.data.newPass });
    setPassLoading(false);
    if (err) {
      setPassMsg({ type: "err", text: err.message });
      return;
    }
    setNewPass("");
    setConfirmPass("");
    setPassMsg({ type: "ok", text: "Password changed." });
  };

  const clearAnalyses = () => {
    if (!user) return;
    clearResult(user.id);
    clearResult(null); // legacy pre-per-user data
    setProfileMsg({ type: "ok", text: "Saved analyses cleared." });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-hero">
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient-brand">Profile</span> & settings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Manage your account details, password, and saved analyses.
          </p>
        </div>

        {/* Account card */}
        <section className="animate-fade-in-up mt-6 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6" style={{ animationDelay: "60ms" }}>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <UserIcon className="h-4 w-4" /> Profile
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Full name</span>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  value={user.email ?? ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-border bg-muted/50 py-3 pl-10 pr-3 text-sm text-muted-foreground outline-none"
                />
              </div>
            </label>

            {profileMsg && (
              <Message tone={profileMsg.type}>{profileMsg.text}</Message>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-smooth hover:scale-[1.02] disabled:opacity-70"
            >
              {profileLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save profile"}
            </button>
          </form>
        </section>

        {/* Password card */}
        <section className="animate-fade-in-up mt-6 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6" style={{ animationDelay: "120ms" }}>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Lock className="h-4 w-4" /> Change password
          </div>

          <form onSubmit={changePassword} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">New password</span>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="At least 8 characters"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Confirm password</span>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                autoComplete="new-password"
                required
                placeholder="Repeat the new password"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            {passMsg && <Message tone={passMsg.type}>{passMsg.text}</Message>}

            <button
              type="submit"
              disabled={passLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-smooth hover:scale-[1.02] disabled:opacity-70"
            >
              {passLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : "Update password"}
            </button>
          </form>
        </section>

        {/* Danger zone / session */}
        <section className="animate-fade-in-up mt-6 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6" style={{ animationDelay: "180ms" }}>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Account
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={clearAnalyses}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-smooth hover:bg-accent"
            >
              <Trash2 className="h-4 w-4" /> Clear saved analyses
            </button>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-smooth hover:bg-rose-500/20 dark:text-rose-400"
            >
              Sign out securely
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Message({ tone, children }: { tone: "ok" | "err"; children: React.ReactNode }) {
  const ok = tone === "ok";
  return (
    <div
      className={
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs " +
        (ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-destructive/30 bg-destructive/10 text-destructive")
      }
    >
      {ok ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}
