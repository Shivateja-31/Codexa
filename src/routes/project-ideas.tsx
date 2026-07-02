import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lightbulb, Sparkles, Lock, Crown, Clock, Layers, TrendingUp, ChevronDown, ChevronUp, Rocket, Target, BookOpen, Wrench, MessageSquare } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { UpgradeModal } from "@/components/UpgradeModal";
import { usePlan } from "@/lib/plan";
import {
  recommendIdeas, ALL_ROLES, ALL_LEVELS, prettyRole,
  type Role, type Level, type RankedIdea,
} from "@/lib/project-ideas";

export const Route = createFileRoute("/project-ideas")({
  head: () => ({
    meta: [
      { title: "Project Ideas Lab — Codexa" },
      { name: "description", content: "Get personalized, portfolio-worthy project ideas that actually get you hired — matched to your target role and skill level." },
      { property: "og:title", content: "Project Ideas Lab — Codexa" },
      { property: "og:description", content: "Stop guessing what to build. Codexa's Project Ideas Lab matches you with recruiter-ready projects and a week-by-week plan to ship them." },
    ],
  }),
  component: ProjectIdeasPage,
});

const FREE_COUNT = 3;

function ProjectIdeasPage() {
  const { isPro } = usePlan();
  const [role, setRole] = useState<Role>("fullstack");
  const [level, setLevel] = useState<Level>("intermediate");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const ideas = useMemo(() => recommendIdeas(role, level, 10), [role, level]);
  const visible = isPro ? ideas : ideas.slice(0, FREE_COUNT);
  const locked = isPro ? [] : ideas.slice(FREE_COUNT);

  return (
    <div className="min-h-screen bg-hero">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
        {/* Hero */}
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
            <Lightbulb className="h-3.5 w-3.5 text-primary" /> Free · Solves the #1 student question
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient-brand">What should I build</span> to actually get hired?
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Pick your target role and skill level. Codexa recommends portfolio-worthy projects with recruiter-signal
            scores, tech stacks, and hiring context — so you stop building todo apps and start building interviews.
          </p>
        </div>

        {/* Selectors */}
        <section
          className="animate-fade-in-up mt-8 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6"
          style={{ animationDelay: "60ms" }}
        >
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">1. Your target role</div>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={
                  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-smooth " +
                  (role === r.value
                    ? "border-primary bg-gradient-brand text-white shadow-brand"
                    : "border-border bg-background hover:border-primary/50")
                }
              >
                <span>{r.emoji}</span> {r.label}
              </button>
            ))}
          </div>

          <div className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">2. Your current level</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {ALL_LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={
                  "rounded-xl border p-3 text-left transition-smooth " +
                  (level === l.value
                    ? "border-primary bg-primary/5 shadow-brand"
                    : "border-border bg-background hover:border-primary/50")
                }
              >
                <div className="text-sm font-semibold">{l.label}</div>
                <div className="text-[11px] text-muted-foreground">{l.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Results heading */}
        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              {ideas.length} project ideas for a{level === "advanced" ? "n" : ""} {level} {prettyRole(role).toLowerCase()}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Ranked by fit score. {isPro ? "Full blueprint unlocked on every idea." : `Free plan shows top ${FREE_COUNT} — upgrade to unlock full blueprints for all ${ideas.length}.`}
            </p>
          </div>
          {!isPro && (
            <button
              onClick={() => setUpgradeOpen(true)}
              className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-brand transition-smooth hover:scale-[1.03] sm:inline-flex"
            >
              <Crown className="h-3.5 w-3.5" /> Unlock all blueprints
            </button>
          )}
        </div>

        {/* Visible cards */}
        <section className="mt-4 space-y-4">
          {visible.map((r, i) => (
            <IdeaCard
              key={r.idea.id}
              ranked={r}
              index={i}
              expanded={openId === r.idea.id}
              onToggle={() => setOpenId(openId === r.idea.id ? null : r.idea.id)}
              isPro={isPro}
              onUpgrade={() => setUpgradeOpen(true)}
            />
          ))}
        </section>

        {/* Locked / upsell */}
        {locked.length > 0 && (
          <section className="mt-6 rounded-2xl border border-dashed border-primary/40 bg-gradient-to-br from-primary/5 to-purple-500/5 p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-brand">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold sm:text-lg">{locked.length} more matched project ideas locked</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                    Plus full blueprints on every idea: week-by-week plan, stretch goals, deploy guide, interview talking points, and README hook.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUpgradeOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-smooth hover:scale-[1.03]"
              >
                <Crown className="h-4 w-4" /> Upgrade to Pro
              </button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {locked.map((r) => (
                <div key={r.idea.id} className="relative overflow-hidden rounded-xl border border-border bg-card/60 p-3">
                  <div className="pointer-events-none absolute inset-0 backdrop-blur-[3px]" />
                  <div className="relative">
                    <p className="truncate text-sm font-semibold">{r.idea.title}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{r.idea.tagline}</p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Lock className="h-3 w-3" /> Blueprint locked
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}

function IdeaCard({
  ranked, index, expanded, onToggle, isPro, onUpgrade,
}: {
  ranked: RankedIdea; index: number; expanded: boolean; onToggle: () => void;
  isPro: boolean; onUpgrade: () => void;
}) {
  const { idea, fitScore, fitReason } = ranked;
  const scoreTone =
    fitScore >= 85 ? "text-emerald-500" :
    fitScore >= 70 ? "text-primary" : "text-amber-500";

  return (
    <article
      className="animate-fade-in-up overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-smooth"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                #{index + 1} pick
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <Clock className="h-3 w-3" /> ~{idea.estWeeks} weeks
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-500">
                <Layers className="h-3 w-3" /> Difficulty {idea.difficulty}/5
              </span>
            </div>
            <h3 className="mt-2 text-lg font-bold leading-tight sm:text-xl">{idea.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{idea.tagline}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {idea.stack.map((t) => (
                <span key={t} className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
            <div className="text-right">
              <div className={`text-3xl font-black leading-none ${scoreTone}`}>{fitScore}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fit score</div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Why recruiters care
              </p>
              <p className="mt-0.5 text-sm">{idea.hiringSignal}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{fitReason}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2.5 text-sm font-semibold transition-smooth hover:border-primary/50 hover:text-primary"
        >
          {expanded ? <>Hide blueprint <ChevronUp className="h-4 w-4" /></> : <>Open blueprint <ChevronDown className="h-4 w-4" /></>}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border bg-background/50 p-4 sm:p-6">
          {isPro ? (
            <Blueprint idea={ranked.idea} />
          ) : (
            <LockedBlueprint idea={ranked.idea} onUpgrade={onUpgrade} />
          )}
        </div>
      )}
    </article>
  );
}

function Blueprint({ idea }: { idea: RankedIdea["idea"] }) {
  return (
    <div className="space-y-5">
      <Section icon={<Target className="h-4 w-4 text-rose-500" />} title="Real problem it solves">
        <p className="text-sm">{idea.problem}</p>
      </Section>

      <Section icon={<Wrench className="h-4 w-4 text-primary" />} title="Core features to build">
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {idea.coreFeatures.map((f, i) => (
            <li key={i} className="flex gap-2 text-sm"><span className="text-primary">•</span> {f}</li>
          ))}
        </ul>
      </Section>

      <Section icon={<Rocket className="h-4 w-4 text-purple-500" />} title="Week-by-week plan">
        <ol className="space-y-2">
          {idea.milestones.map((m, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-border bg-card p-3 text-sm">
              <span className="shrink-0 rounded-md bg-gradient-brand px-2 py-0.5 text-[11px] font-bold uppercase text-white">{m.week}</span>
              <span>{m.goal}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section icon={<Sparkles className="h-4 w-4 text-amber-500" />} title="Stretch goals (that make it stand out)">
        <ul className="space-y-1.5">
          {idea.stretchGoals.map((g, i) => (
            <li key={i} className="flex gap-2 text-sm"><span className="text-amber-500">★</span> {g}</li>
          ))}
        </ul>
      </Section>

      <Section icon={<BookOpen className="h-4 w-4 text-emerald-500" />} title="README opening line">
        <blockquote className="rounded-lg border-l-4 border-primary bg-primary/5 px-4 py-3 text-sm italic">
          "{idea.readmeHook}"
        </blockquote>
      </Section>

      <Section icon={<TrendingUp className="h-4 w-4 text-cyan-500" />} title="Deploy plan">
        <p className="text-sm">{idea.deploy}</p>
      </Section>

      <Section icon={<MessageSquare className="h-4 w-4 text-fuchsia-500" />} title="Talk about this in interviews">
        <ul className="space-y-1.5">
          {idea.interviewTalkingPoints.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm"><span className="text-fuchsia-500">›</span> {p}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function LockedBlueprint({ idea, onUpgrade }: { idea: RankedIdea["idea"]; onUpgrade: () => void }) {
  const teasers = [
    { icon: <Target className="h-3.5 w-3.5" />, label: "The real problem it solves" },
    { icon: <Wrench className="h-3.5 w-3.5" />, label: `${idea.coreFeatures.length} core features to build` },
    { icon: <Rocket className="h-3.5 w-3.5" />, label: `${idea.milestones.length}-week milestone plan` },
    { icon: <Sparkles className="h-3.5 w-3.5" />, label: `${idea.stretchGoals.length} stretch goals to stand out` },
    { icon: <BookOpen className="h-3.5 w-3.5" />, label: "README opening line + deploy plan" },
    { icon: <MessageSquare className="h-3.5 w-3.5" />, label: `${idea.interviewTalkingPoints.length} interview talking points` },
  ];
  return (
    <div className="relative">
      <div className="grid gap-2 sm:grid-cols-2">
        {teasers.map((t, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            <span className="text-primary">{t.icon}</span>
            {t.label}
            <Lock className="ml-auto h-3.5 w-3.5" />
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-purple-500/10 p-4 text-center sm:p-5">
        <p className="text-sm font-semibold">Unlock the full build blueprint</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Every idea comes with a week-by-week plan, deploy guide, README hook, and interview talking points.
        </p>
        <button
          onClick={onUpgrade}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-smooth hover:scale-[1.03]"
        >
          <Crown className="h-4 w-4" /> Upgrade to Codexa Pro
        </button>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}
