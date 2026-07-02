import { Star, TrendingUp, Info } from "lucide-react";
import { computeGitScore, type GitScoreResult } from "@/lib/git-score";
import type { GitHubData } from "@/lib/github-service";
import { useMemo, useState } from "react";

export function GitScoreCard({ data }: { data: GitHubData }) {
  const result: GitScoreResult = useMemo(() => computeGitScore(data), [data]);
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Circular ring geometry
  const size = 160;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = (result.percent / 100) * C;

  return (
    <section className="animate-fade-in-up rounded-2xl border border-border bg-card p-5 shadow-card sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Ring */}
        <div className="relative mx-auto shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <defs>
              <linearGradient id="gsGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeOpacity={0.12} strokeWidth={stroke} fill="none" />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="url(#gsGrad)"
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${dash} ${C - dash}`}
              style={{ transition: "stroke-dasharray 900ms ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black leading-none tracking-tight sm:text-4xl">{result.total}</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">/ 700</span>
          </div>
        </div>

        {/* Tier / summary */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
            <TrendingUp className="h-3.5 w-3.5 text-primary" /> GitScore · live from GitHub
          </div>
          <h2 className="mt-3 flex flex-wrap items-center justify-center gap-2 text-2xl font-bold sm:justify-start sm:text-3xl">
            <span className="text-3xl">{result.tier.emoji}</span>
            <span className={result.tier.color}>{result.tier.title}</span>
          </h2>
          <div className="mt-2 flex items-center justify-center gap-1 sm:justify-start">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  "h-5 w-5 " +
                  (i < result.tier.stars
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30")
                }
              />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">{result.percent}% of maximum</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{result.tier.blurb}</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {result.categories.map((c) => {
          const pct = Math.round((c.score / c.max) * 100);
          const open = openKey === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setOpenKey(open ? null : c.key)}
              className={
                "group rounded-xl border bg-background p-3 text-left transition-smooth hover:border-primary/50 " +
                (open ? "border-primary shadow-brand" : "border-border")
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold">{c.label}</span>
                <Info className="h-3 w-3 shrink-0 text-muted-foreground/60 transition-smooth group-hover:text-primary" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-bold">{c.score}</span>
                <span className="text-[10px] text-muted-foreground">/ {c.max}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-brand transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {open && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-[11px] text-muted-foreground">{c.detail}</p>
                  <ul className="mt-2 space-y-1">
                    {c.signals.map((s, i) => (
                      <li key={i} className="text-[11px] leading-snug text-foreground/90">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground sm:text-left">
        Score recalculates from live GitHub data every time you run an analysis — add new repos, ship commits, or improve READMEs and re-run to watch it climb.
      </p>
    </section>
  );
}
