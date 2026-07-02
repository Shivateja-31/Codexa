import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Github, Loader2, Search, AlertCircle, Star, GitFork, Users, Folder, Award,
  CheckCircle2, XCircle, Lightbulb, FileText, Linkedin, Download, Copy, Sparkles, Target, MapPin, Map, Lock, Crown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { UpgradeModal } from "@/components/UpgradeModal";
import { GitScoreCard } from "@/components/GitScoreCard";
import { fetchGitHubData, parseGithubUrl, type GitHubData } from "@/lib/github-service";
import { analyzeProfile, type AIAnalysis } from "@/lib/ai-analysis";
import { saveResult, loadResult } from "@/lib/analysis-store";
import { usePlan } from "@/lib/plan";


export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Codexa" },
      { name: "description", content: "Analyze a GitHub profile and get AI-powered improvement insights." },
    ],
  }),
  component: Dashboard,
});

type StepStatus = "pending" | "active" | "done";
type Step = { key: string; label: string; status: StepStatus };

const BASE_STEPS: Omit<Step, "status">[] = [
  { key: "profile", label: "Fetching profile..." },
  { key: "repos", label: "Fetching repositories..." },
  { key: "readmes", label: "Reading README files..." },
  { key: "tech", label: "Detecting technologies..." },
  { key: "quality", label: "Analyzing code quality..." },
  { key: "complexity", label: "Measuring project complexity..." },
  { key: "docs", label: "Reviewing documentation..." },
  { key: "recruiter", label: "Generating recruiter feedback..." },
  { key: "plan", label: "Preparing improvement plan..." },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Dashboard() {
  const { isPro } = usePlan();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ data: GitHubData; analysis: AIAnalysis } | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Load any pending URL from the homepage, or the last stored analysis.
  useEffect(() => {
    const pending = sessionStorage.getItem("codexa:pending-url");
    if (pending) {
      sessionStorage.removeItem("codexa:pending-url");
      setInput(pending);
      runAnalysis(pending);
    } else {
      const stored = loadResult();
      if (stored) setResult({ data: stored.data, analysis: stored.analysis });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAnalysis(value: string) {
    const parsed = parseGithubUrl(value);
    if (!parsed.ok) { setError(parsed.error); return; }
    const { username } = parsed;
    setError(null);
    setLoading(true);
    setResult(null);

    // Initialize steps with the first one active
    const initial: Step[] = BASE_STEPS.map((s, i) => ({ ...s, status: i === 0 ? "active" : "pending" }));
    setSteps(initial);

    const completeStep = (key: string, nextLabel?: string) =>
      setSteps((prev) => {
        const idx = prev.findIndex((s) => s.key === key);
        if (idx === -1) return prev;
        const next = prev.map((s, i) => {
          if (i < idx) return s.status === "done" ? s : { ...s, status: "done" as const };
          if (i === idx) return { ...s, status: "done" as const, label: nextLabel ?? s.label };
          if (i === idx + 1) return { ...s, status: "active" as const };
          return s;
        });
        return next;
      });

    try {
      // Fire AI analysis early in the background (so total stays ~30s, not 30s + AI time)
      let analysisPromise: Promise<AIAnalysis> | null = null;
      let data: GitHubData | null = null;

      data = await fetchGitHubData(username, async (e) => {
        if (e.type === "profile") {
          await sleep(1200);
          completeStep("profile");
        } else if (e.type === "repos") {
          await sleep(1500);
          completeStep("repos", `Fetching ${e.count} repositories...`);
        } else if (e.type === "readmes") {
          await sleep(1500);
          completeStep("readmes", `Reading ${e.count} README files...`);
        }
      });

      // Kick off AI now that we have data; we'll await later
      analysisPromise = analyzeProfile(data);

      // Simulated analysis stages (timed to feel like real work)
      await sleep(2800); completeStep("tech");
      await sleep(3500); completeStep("quality");
      await sleep(3000); completeStep("complexity");
      await sleep(3200); completeStep("docs");
      await sleep(4000);
      const analysis = await analysisPromise;
      completeStep("recruiter");
      await sleep(3000); completeStep("plan");
      await sleep(400);

      saveResult({ data, analysis, generatedAt: new Date().toISOString() });
      setResult({ data, analysis });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setSteps([]);
    }
  }




  return (
    <div className="min-h-screen bg-hero">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient-brand">Analyze</span> a GitHub profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">Paste any public GitHub URL or username.</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); runAnalysis(input); }}
          className="animate-fade-in-up mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-card sm:flex-row"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex flex-1 items-center gap-2 px-3">
            <Github className="h-5 w-5 text-muted-foreground" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="github.com/yourusername"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-brand transition-smooth hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <><Search className="h-4 w-4" /> Analyze</>}
          </button>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {loading && <LoadingState steps={steps} />}

        {!loading && result && (
          <Report data={result.data} analysis={result.analysis} isPro={isPro} onUpgrade={() => setUpgradeOpen(true)} />
        )}

        {!loading && !result && !error && <Empty onTry={(u) => { setInput(u); runAnalysis(u); }} />}
      </main>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}

function Empty({ onTry }: { onTry: (u: string) => void }) {
  const samples = ["torvalds", "gaearon", "sindresorhus"];
  return (
    <div className="mt-16 rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-brand">
        <Sparkles className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Try it on a sample profile</h3>
      <p className="mt-1 text-sm text-muted-foreground">Or paste your own GitHub URL above.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {samples.map((s) => (
          <button key={s} onClick={() => onTry(s)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition-smooth hover:bg-accent">
            @{s}
          </button>
        ))}
      </div>
    </div>
  );
}

function LoadingState({ steps }: { steps: Step[] }) {
  const total = steps.length || 1;
  const done = steps.filter((s) => s.status === "done").length;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="mt-10 rounded-2xl border border-border bg-card p-8 shadow-card sm:p-10">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 h-12 w-12 animate-spin-slow rounded-full border-4 border-transparent border-t-primary" />
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold">Analyzing profile...</p>
          <p className="text-xs text-muted-foreground">{done} of {total} steps complete</p>
        </div>
        <span className="text-sm font-mono text-muted-foreground">{pct}%</span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-brand transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-6 space-y-2.5">
        {steps.map((s) => (
          <li
            key={s.key}
            className={
              "flex items-center gap-3 text-sm transition-colors " +
              (s.status === "done"
                ? "text-foreground"
                : s.status === "active"
                  ? "text-foreground"
                  : "text-muted-foreground/60")
            }
          >
            <span className="flex h-5 w-5 items-center justify-center">
              {s.status === "done" ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : s.status === "active" ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              )}
            </span>
            <span className={s.status === "active" ? "font-medium" : ""}>{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Report({ data, analysis, isPro, onUpgrade }: { data: GitHubData; analysis: AIAnalysis; isPro: boolean; onUpgrade: () => void }) {
  const { profile, repos, totalStars, totalForks, languages, commitActivity } = data;
  const langPie = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#a78bfa", "#60a5fa", "#c084fc"];
  const basicSuggestions = analysis.suggestions.slice(0, 3);

  return (
    <div className="mt-10 space-y-6">
      {/* Profile header */}
      <section className="animate-fade-in-up flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:gap-5 sm:p-6">
        <img src={profile.avatar_url} alt={profile.login} className="h-16 w-16 shrink-0 rounded-2xl ring-2 ring-primary/30 sm:h-20 sm:w-20" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-words text-xl font-bold sm:text-2xl">{profile.name ?? profile.login}</h2>
            {isPro ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <Crown className="h-3 w-3" /> Pro
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Free</span>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">@{profile.login}</p>
          {profile.bio && <p className="mt-1 text-sm">{profile.bio}</p>}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {profile.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {profile.location}</span>}
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {profile.followers} followers</span>
            <span className="inline-flex items-center gap-1"><Folder className="h-3 w-3" /> {profile.public_repos} repos</span>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            onClick={() => downloadReport(profile.login, analysis, data, isPro)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-smooth hover:scale-[1.03] sm:w-auto"
          >
            <Download className="h-4 w-4" /> Download PDF report
          </button>
        </div>
      </section>

      {/* GitScore — 700 points, live from GitHub */}
      <GitScoreCard data={data} />

      {/* Top stats — FREE */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total stars" value={totalStars} icon={<Star className="h-4 w-4" />} />
        <StatCard label="Total forks" value={totalForks} icon={<GitFork className="h-4 w-4" />} />
        <StatCard label="Public repos" value={profile.public_repos} icon={<Folder className="h-4 w-4" />} />
      </section>

      {/* Charts — FREE */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Commit activity (last 12 weeks)" icon={<Sparkles className="h-4 w-4" />}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commitActivity}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
                <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="commits" fill="url(#brandGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Language breakdown" icon={<Folder className="h-4 w-4" />}>
          <div className="h-56">
            {langPie.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No language data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={langPie} dataKey="value" nameKey="name" outerRadius={80} innerRadius={45} paddingAngle={2}>
                    {langPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {langPie.map((l, i) => (
              <span key={l.name} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {l.name}
              </span>
            ))}
          </div>
        </Card>
      </section>

      {/* Basic suggestions — FREE */}
      <Card title="Basic suggestions" icon={<Lightbulb className="h-4 w-4 text-amber-500" />}>
        <ul className="space-y-2 text-sm">
          {basicSuggestions.map((s, i) => (
            <li key={i} className="flex gap-2"><span className="text-primary">{i + 1}.</span><span>{s}</span></li>
          ))}
        </ul>
        {!isPro && (
          <p className="mt-3 text-xs text-muted-foreground">
            {analysis.suggestions.length - basicSuggestions.length}+ more personalized suggestions in Pro.
          </p>
        )}
      </Card>

      {/* ============ FREE INSIGHTS (always visible) ============ */}
      {!isPro && (
        <>
          <Card title="Recruiter first impression" icon={<Award className="h-4 w-4 text-primary" />}>
            <p className="text-sm leading-relaxed italic">"{analysis.recruiterFirstImpression}"</p>
            <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">— simulated senior recruiter, 8 sec profile scan</p>
          </Card>

          <section className="grid gap-4 sm:grid-cols-2">
            <ScoreCard label="Career readiness" value={analysis.careerReadinessScore} />
            <Card title="Biggest career mistake" icon={<AlertCircle className="h-4 w-4 text-rose-500" />}>
              <p className="text-sm leading-relaxed">{analysis.biggestCareerMistake}</p>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <ListCard title="Top 5 strengths" icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} items={analysis.top5Strengths} />
            <ListCard title="Top 5 weaknesses" icon={<XCircle className="h-4 w-4 text-rose-500" />} items={analysis.top5Weaknesses} />
          </section>

          {analysis.bestRepository && (
            <Card title="Best repository" icon={<Star className="h-4 w-4 text-amber-500" />}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <a
                    href={analysis.bestRepository.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {analysis.bestRepository.name}
                  </a>
                  <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    {analysis.bestRepository.language && (
                      <span className="rounded-full bg-muted px-2 py-0.5">{analysis.bestRepository.language}</span>
                    )}
                    <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> {analysis.bestRepository.stars}</span>
                    <span className="inline-flex items-center gap-1"><GitFork className="h-3 w-3" /> {analysis.bestRepository.forks}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{analysis.bestRepository.reason}</p>
                </div>
                <RepoScoreDial score={analysis.bestRepository.score} />
              </div>
            </Card>
          )}

          <BlurredPremiumPreview analysis={analysis} onUpgrade={onUpgrade} />
        </>
      )}

      {/* ============ PRO SECTION (unchanged) ============ */}
      {isPro && (
        <>
          <Card title="Recruiter impression" icon={<Award className="h-4 w-4" />}>
            <p className="text-sm leading-relaxed">{analysis.recruiterImpression}</p>
          </Card>

          <section className="grid gap-4 sm:grid-cols-3">
            <RadialScore label="Profile completeness" value={analysis.profileCompleteness} />
            <RadialScore label="Documentation" value={analysis.documentationQuality} />
            <RadialScore label="Consistency" value={analysis.codingConsistency} />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <ListCard title="Strengths" icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} items={analysis.strengths} />
            <ListCard title="Weaknesses" icon={<XCircle className="h-4 w-4 text-rose-500" />} items={analysis.weaknesses} />
            <ListCard title="Missing skills" icon={<Target className="h-4 w-4 text-amber-500" />} items={analysis.missingSkills} />
          </section>

          <Card title="Repository ratings" icon={<Star className="h-4 w-4" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {analysis.repoRatings.map((r) => (
                <div key={r.name} className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{r.name}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreColor(r.score)}`}>{r.score}/100</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.notes}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="All personalized improvement suggestions" icon={<Lightbulb className="h-4 w-4 text-amber-500" />}>
            <ul className="space-y-2 text-sm">
              {analysis.suggestions.map((s, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">{i + 1}.</span><span>{s}</span></li>
              ))}
            </ul>
          </Card>

          <section className="grid gap-4 lg:grid-cols-2">
            <CopyCard title="Rewritten GitHub bio" icon={<Github className="h-4 w-4" />} content={analysis.rewrittenBio} />
            <CopyCard title="LinkedIn headline" icon={<Linkedin className="h-4 w-4" />} content={analysis.linkedinHeadline} />
          </section>

          <CopyCard title="LinkedIn About section" icon={<Linkedin className="h-4 w-4" />} content={analysis.linkedinAbout} multiline />
          <CopyCard title="GitHub profile README" icon={<FileText className="h-4 w-4" />} content={analysis.githubReadme} multiline mono />

          <Card title="30-day improvement roadmap" icon={<Map className="h-4 w-4" />}>
            <ol className="space-y-3">
              {analysis.projectRoadmap.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-white">{i + 1}</div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Analysis of {repos.length} repositories · Generated by Codexa
      </p>
    </div>
  );
}

/* ------- Blurred premium preview (free plan teaser) ------- */

function BlurredPremiumPreview({ analysis, onUpgrade }: { analysis: AIAnalysis; onUpgrade: () => void }) {
  const teasers = [
    { label: "Recruiter deep-dive", body: analysis.recruiterImpression },
    { label: "Missing skills", body: analysis.missingSkills.slice(0, 3).join(" · ") },
    { label: "AI-rewritten GitHub bio", body: analysis.rewrittenBio },
    { label: "LinkedIn headline", body: analysis.linkedinHeadline },
    { label: "Top repo rankings", body: analysis.repoRatings.slice(0, 3).map((r) => `${r.name} ${r.score}/100`).join(" · ") },
    { label: "30-day roadmap · Week 1", body: analysis.projectRoadmap[0]?.description ?? "" },
  ];

  return (
    <div className="animate-fade-in-up relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
            Premium report preview
          </h3>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          {analysis.lockedInsightsCount}+ more insights available
        </span>
      </div>

      <div className="relative">
        <div className="grid gap-3 select-none sm:grid-cols-2" aria-hidden="true" style={{ filter: "blur(6px)" }}>
          {teasers.map((t, i) => (
            <div key={i} className="rounded-xl border border-border bg-background/60 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">{t.label}</p>
              <p className="mt-1 line-clamp-3 text-sm text-foreground">{t.body || "Detailed personalized analysis..."}</p>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-card/60 to-card" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-4 text-center">
          <p className="max-w-md text-sm font-medium">
            Your profile has <span className="text-primary font-bold">{analysis.improvementOpportunities} improvement opportunities</span>.
            Unlock the full recruiter report.
          </p>
          <button
            onClick={onUpgrade}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-smooth hover:scale-[1.03]"
          >
            <Crown className="h-4 w-4" /> Unlock full report
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------- Small UI ------- */


function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
        {icon} {label}
      </div>
      <div className="mt-2 text-2xl font-bold sm:text-3xl">{value.toLocaleString()}</div>
    </div>
  );
}

function ScoreCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border p-4 shadow-card sm:p-5 ${accent ? "bg-gradient-brand text-white" : "bg-card"}`}>
      <div className={`text-[11px] font-medium uppercase tracking-wide sm:text-xs ${accent ? "text-white/80" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-2 text-3xl font-bold sm:text-4xl">{value}<span className={`text-base ${accent ? "text-white/70" : "text-muted-foreground"}`}>/100</span></div>
      <Award className={`absolute -bottom-3 -right-3 h-20 w-20 ${accent ? "text-white/10" : "text-primary/10"}`} />
    </div>
  );
}

function RadialScore({ label, value }: { label: string; value: number }) {
  const data = [{ name: label, value, fill: "url(#radGrad)" }];
  return (
    <Card title={label}>
      <div className="relative h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <defs>
              <linearGradient id="radGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "var(--muted)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold">{value}<span className="text-sm text-muted-foreground">%</span></span>
        </div>
      </div>
    </Card>
  );
}

function ListCard({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <Card title={title} icon={icon}>
      <ul className="space-y-2 text-sm">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>{s}</span></li>
        ))}
      </ul>
    </Card>
  );
}

function CopyCard({ title, icon, content, multiline, mono }: { title: string; icon: React.ReactNode; content: string; multiline?: boolean; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
        </div>
        <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium transition-smooth hover:bg-accent">
          <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {multiline ? (
        <pre className={`max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-xs ${mono ? "font-mono" : ""}`}>{content}</pre>
      ) : (
        <p className="text-sm leading-relaxed">{content}</p>
      )}
    </div>
  );
}

function scoreColor(s: number) {
  if (s >= 80) return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  if (s >= 60) return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
  if (s >= 40) return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-rose-500/15 text-rose-600 dark:text-rose-400";
}

function RepoScoreDial({ score }: { score: number }) {
  const size = 110;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * C;
  const tone =
    score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#f43f5e";
  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Strong" : score >= 40 ? "Decent" : "Needs work";
  return (
    <div className="relative mx-auto shrink-0 sm:mx-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeOpacity={0.12} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${C - dash}`}
          style={{ transition: "stroke-dasharray 900ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black leading-none" style={{ color: tone }}>{score}</span>
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">/ 100</span>
        <span className="mt-0.5 text-[10px] font-medium" style={{ color: tone }}>{label}</span>
      </div>
    </div>
  );
}

async function downloadReport(username: string, a: AIAnalysis, data: GitHubData, isPro: boolean) {
  const { jsPDF } = await import("jspdf");
  const { computeGitScore } = await import("@/lib/git-score");
  const { profile, totalStars, totalForks, languages, commitActivity, repos } = data;
  const gitScore = computeGitScore(data);
  const langPie = Object.entries(languages).sort((x, z) => z[1] - x[1]).slice(0, 6);
  const totalCommits12w = commitActivity.reduce((s, w) => s + (w.commits || 0), 0);
  const activeWeeks = commitActivity.filter((w) => (w.commits || 0) > 0).length;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > pageH - margin) { doc.addPage(); y = margin; }
  };
  const heading = (text: string, size = 18) => {
    ensureSpace(size + 20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(size); doc.setTextColor(30, 30, 60);
    doc.text(text, margin, y); y += size + 8;
    doc.setDrawColor(139, 92, 246); doc.setLineWidth(1.2);
    doc.line(margin, y, margin + 60, y); y += 12;
    doc.setTextColor(20, 20, 20);
  };
  const subheading = (text: string) => {
    ensureSpace(20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(59, 130, 246);
    doc.text(text, margin, y); y += 16;
    doc.setTextColor(20, 20, 20);
  };
  const para = (text: string, size = 11) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxW) as string[];
    for (const ln of lines) { ensureSpace(size + 4); doc.text(ln, margin, y); y += size + 4; }
  };
  const bullet = (text: string) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    const lines = doc.splitTextToSize(text, maxW - 16) as string[];
    ensureSpace(16);
    doc.setTextColor(139, 92, 246); doc.text("•", margin, y); doc.setTextColor(20, 20, 20);
    doc.text(lines[0], margin + 14, y); y += 15;
    for (let i = 1; i < lines.length; i++) { ensureSpace(15); doc.text(lines[i], margin + 14, y); y += 15; }
    y += 2;
  };
  const kv = (k: string, v: string) => {
    ensureSpace(16);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(80, 80, 100);
    doc.text(k, margin, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(20, 20, 20);
    const wrapped = doc.splitTextToSize(v, maxW - 130) as string[];
    doc.text(wrapped[0], margin + 130, y); y += 15;
    for (let i = 1; i < wrapped.length; i++) { ensureSpace(15); doc.text(wrapped[i], margin + 130, y); y += 15; }
  };
  const spacer = (h = 8) => { y += h; };
  const progressBar = (label: string, value: number, max: number) => {
    ensureSpace(30);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(40, 40, 60);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 120);
    doc.text(`${value} / ${max}`, margin + maxW, y, { align: "right" });
    y += 6;
    doc.setFillColor(235, 232, 250);
    doc.roundedRect(margin, y, maxW, 8, 4, 4, "F");
    const pct = Math.max(0, Math.min(1, value / max));
    if (pct > 0) {
      doc.setFillColor(139, 92, 246);
      doc.roundedRect(margin, y, maxW * pct, 8, 4, 4, "F");
    }
    y += 18;
    doc.setTextColor(20, 20, 20);
  };

  // Title banner
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageW, 80, "F");
  doc.setFillColor(139, 92, 246);
  doc.rect(0, 0, pageW / 2, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold"); doc.setFontSize(22);
  doc.text("Codexa", margin, 38);
  doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  doc.text(`${isPro ? "Pro" : "Free"} report · @${username} · ${new Date().toLocaleDateString()}`, margin, 60);
  doc.setTextColor(20, 20, 20);
  y = 110;

  // GitScore banner /700
  ensureSpace(90);
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(margin, y, maxW, 80, 8, 8, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(32); doc.setTextColor(99, 102, 241);
  doc.text(`${gitScore.total}`, margin + 20, y + 46);
  const totalW = doc.getTextWidth(`${gitScore.total}`);
  doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(120, 120, 140);
  doc.text(`/ 700`, margin + 20 + totalW + 6, y + 46);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(80, 80, 100);
  doc.text("GitScore · live from GitHub", margin + 20, y + 64);
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(30, 30, 60);
  doc.text(gitScore.tier.title, margin + maxW - 20, y + 30, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(90, 90, 110);
  const tierBlurb = doc.splitTextToSize(gitScore.tier.blurb, 260) as string[];
  doc.text(tierBlurb, margin + maxW - 20, y + 48, { align: "right" });
  doc.setTextColor(20, 20, 20);
  y += 96;

  // GitScore category breakdown
  heading("GitScore breakdown");
  gitScore.categories.forEach((c) => {
    progressBar(c.label, c.score, c.max);
    if (c.detail) {
      doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(110, 110, 130);
      const dl = doc.splitTextToSize(c.detail, maxW) as string[];
      for (const ln of dl) { ensureSpace(11); doc.text(ln, margin, y); y += 11; }
      doc.setTextColor(20, 20, 20);
      y += 4;
    }
  });
  spacer();

  heading("Profile snapshot");
  kv("Name", profile.name ?? profile.login);
  kv("Username", `@${profile.login}`);
  if (profile.location) kv("Location", profile.location);
  if (profile.bio) kv("Bio", profile.bio);
  kv("Followers", `${profile.followers}`);
  kv("Public repos", `${profile.public_repos}`);
  kv("Total stars", `${totalStars}`);
  kv("Total forks", `${totalForks}`);
  spacer();

  heading("Activity & languages");
  kv("Commits (last 12 weeks)", `${totalCommits12w}`);
  kv("Active weeks (of 12)", `${activeWeeks}`);
  if (langPie.length) {
    spacer(4);
    subheading("Top languages");
    const langTotal = langPie.reduce((s, [, v]) => s + v, 0) || 1;
    langPie.forEach(([name, value]) => {
      const pct = Math.round((value / langTotal) * 100);
      progressBar(name, pct, 100);
    });
  }
  spacer();

  heading("Basic suggestions");
  a.suggestions.slice(0, 3).forEach((s, i) => bullet(`${i + 1}. ${s}`));
  spacer();

  heading("Recruiter first impression");
  para(`"${a.recruiterFirstImpression}"`);
  doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(120);
  ensureSpace(12); doc.text("— simulated senior recruiter, 8 sec profile scan", margin, y); y += 14;
  doc.setTextColor(20, 20, 20);
  spacer();

  heading("Career readiness & health");
  progressBar("Career readiness", a.careerReadinessScore, 100);
  progressBar("Profile completeness", a.profileCompleteness, 100);
  progressBar("Documentation quality", a.documentationQuality, 100);
  progressBar("Coding consistency", a.codingConsistency, 100);
  spacer();

  heading("Biggest career mistake");
  para(a.biggestCareerMistake);
  spacer();

  heading("Top 5 strengths");
  a.top5Strengths.forEach((s, i) => bullet(`${i + 1}. ${s}`));
  spacer();

  heading("Top 5 weaknesses");
  a.top5Weaknesses.forEach((s, i) => bullet(`${i + 1}. ${s}`));
  spacer();

  if (a.bestRepository) {
    heading("Best repository");
    subheading(a.bestRepository.name);
    para(a.bestRepository.url, 10);
    const meta: string[] = [];
    if (a.bestRepository.language) meta.push(a.bestRepository.language);
    meta.push(`${a.bestRepository.stars} stars`);
    meta.push(`${a.bestRepository.forks} forks`);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(110, 110, 130);
    ensureSpace(12); doc.text(meta.join("  ·  "), margin, y); y += 14;
    doc.setTextColor(20, 20, 20);
    progressBar("Repo score", a.bestRepository.score, 100);
    para(a.bestRepository.reason);
    spacer();
  }

  if (isPro) {
    heading("Recruiter impression (Pro)");
    para(a.recruiterImpression);
    spacer();

    heading("Strengths"); a.strengths.forEach(bullet);
    heading("Weaknesses"); a.weaknesses.forEach(bullet);
    heading("Missing skills"); a.missingSkills.forEach(bullet);
    heading("Repository ratings");
    a.repoRatings.forEach((r) => bullet(`${r.name} — ${r.score}/100 · ${r.notes}`));
    heading("All improvement suggestions");
    a.suggestions.forEach((s, i) => bullet(`${i + 1}. ${s}`));
    heading("Rewritten GitHub bio"); para(a.rewrittenBio);
    heading("LinkedIn headline"); para(a.linkedinHeadline);
    subheading("LinkedIn About"); para(a.linkedinAbout);
    heading("GitHub profile README"); para(a.githubReadme, 9);
    heading("30-day project roadmap");
    a.projectRoadmap.forEach((r, i) => { subheading(`${i + 1}. ${r.title}`); para(r.description); });
  } else {
    spacer(14);
    doc.setDrawColor(220); doc.line(margin, y, margin + maxW, y); y += 14;
    para(`Your profile has ${a.improvementOpportunities} improvement opportunities and ${a.lockedInsightsCount}+ locked insights. Upgrade to Pro to unlock the full recruiter review, all repo ratings, rewritten bio, LinkedIn copy, profile README, and a 30-day personalized roadmap.`, 10);
  }

  // Footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(150);
    doc.text(`Codexa · @${username} · ${repos.length} repos analyzed · Page ${i} of ${pages}`, pageW / 2, pageH - 20, { align: "center" });
  }

  doc.save(`codexa-${username}${isPro ? "-pro" : "-free"}.pdf`);
}

