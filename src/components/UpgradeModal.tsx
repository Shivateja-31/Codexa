import { useState, type ReactNode } from "react";
import { Check, Crown, Sparkles, X, Clock, Hammer, Rocket, Gem, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tier = {
  id: "free" | "pro" | "proplus";
  name: string;
  price: string;
  tagline: string;
  target: string;
  icon: ReactNode;
  highlight?: boolean;
  cta: string;
  ctaDisabled?: boolean;
  perks: string[];
};

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    tagline: "Get a real read on your GitHub",
    target: "Anyone starting to take their profile seriously",
    icon: <Sparkles className="h-5 w-5" />,
    cta: "Current plan",
    ctaDisabled: true,
    perks: [
      "GitHub Profile Analysis",
      "GitHub Score",
      "Recruiter First Impression",
      "Top Strengths & Weaknesses",
      "Tech Stack Detection",
      "Best Repository",
      "Basic Career Suggestions",
    ],
  },
  {
    id: "pro",
    name: "Codexa Pro",
    price: "₹99",
    tagline: "Optimize your developer profile",
    target: "Students prepping GitHub & LinkedIn before applying",
    icon: <Crown className="h-5 w-5" />,
    highlight: true,
    cta: "Upgrade Now",
    perks: [
      "AI GitHub Bio Generator",
      "LinkedIn Headline & About Generator",
      "Deep Repository Ranking & Missing Skills Analysis",
      "Recruiter PDF Report",
    ],
  },
  {
    id: "proplus",
    name: "Codexa Pro+",
    price: "₹199",
    tagline: "Get interview-ready",
    target: "People actively applying for internships or jobs",
    icon: <Gem className="h-5 w-5" />,
    cta: "Upgrade Now",
    perks: [
      "ATS Resume Generator (auto-picks best GitHub projects)",
      "Job Match Analyzer (GitHub vs job description)",
      "AI Portfolio Website Generator",
      "Recruiter Deep Review + 30-Day Career Roadmap",
    ],
  },
];

export function UpgradeModal({ open, onClose }: Props) {
  const [notice, setNotice] = useState<string | null>(null);
  const [buildingTier, setBuildingTier] = useState<string | null>(null);
  if (!open) return null;

  const handleUpgrade = (name: string) => {
    if (buildingTier) return;
    setBuildingTier(name);
    setNotice(`${name} is currently being built — payments aren't live yet. Coming soon 🚀`);
    setTimeout(() => {
      setBuildingTier(null);
      setNotice(null);
    }, 4200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-up" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 text-white hover:bg-black/40"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-brand px-5 py-6 text-white sm:px-8 sm:py-7">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/85">
            <Rocket className="h-4 w-4" /> Choose your plan
          </div>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Turn your GitHub into a career</h2>
          <p className="mt-1 text-sm text-white/85">
            Start free. Upgrade when you're ready to stand out to recruiters.
          </p>
        </div>

        {notice && (
          <div className="mx-5 mt-5 flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:mx-8 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            <Hammer className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <div className="grid gap-4 p-5 sm:p-8 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.id}
              className={
                "relative flex flex-col rounded-2xl border-2 p-5 transition-smooth " +
                (t.highlight
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-background hover:border-primary/40")
              }
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-brand px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                  Most popular
                </span>
              )}

              <div className="flex items-center gap-2 text-primary">
                {t.icon}
                <span className="text-lg font-bold text-foreground">{t.name}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold">{t.price}</span>
                {t.id !== "free" && (
                  <span className="text-xs text-muted-foreground">/ one-time</span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-foreground/80">{t.tagline}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.target}</p>

              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {t.perks.map((p) => (
                  <li key={p} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => (t.ctaDisabled ? undefined : handleUpgrade(t.name))}
                disabled={t.ctaDisabled || buildingTier === t.name}
                className={
                  "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-smooth " +
                  (t.ctaDisabled
                    ? "cursor-not-allowed border border-border bg-muted text-muted-foreground"
                    : buildingTier === t.name
                      ? "cursor-wait border border-amber-400/60 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                      : t.highlight
                        ? "bg-gradient-brand text-white shadow hover:opacity-95"
                        : "border-2 border-primary text-primary hover:bg-primary hover:text-white")
                }
              >
                {buildingTier === t.name ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Building now…
                  </>
                ) : t.ctaDisabled ? (
                  t.cta
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    {t.cta}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-border bg-muted/40 px-5 py-4 sm:px-8">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Paid plans are <span className="font-semibold text-foreground">building — in progress</span>. Payments launch soon; sign in to get notified.
          </p>
        </div>
      </div>
    </div>
  );
}
