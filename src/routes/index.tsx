import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Github, Sparkles, Trophy, Award, Lightbulb, FileText, Briefcase, Map } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Codexa — AI-powered GitHub profile analysis" },
      { name: "description", content: "Paste your GitHub profile and get an AI-powered score, recruiter impression, repo ratings, bio rewrite, LinkedIn copy, and a tailored growth roadmap." },
      { property: "og:title", content: "Codexa — Make your GitHub profile recruiter-ready" },
      { property: "og:description", content: "AI analysis of your GitHub: score, strengths, gaps, rewritten bio, LinkedIn copy, profile README, and a personalized roadmap." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = url.trim();
    if (v) {
      sessionStorage.setItem("codexa:pending-url", v);
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-hero">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-24">
        <section className="animate-fade-in-up text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur sm:text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Powered by AI · Built for developers
          </div>
          <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Make your GitHub <span className="text-gradient-brand">recruiter-ready</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base font-semibold text-foreground sm:text-lg">
            More than a GitHub analyzer — your one-click launchpad to turn your dream career into reality. 🚀
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
            Paste your GitHub profile. Get an instant AI score, recruiter impression, repo ratings, a rewritten bio,
            polished LinkedIn copy, a profile README, and a personalized growth roadmap.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-card sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <Github className="h-5 w-5 text-muted-foreground" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="github.com/yourusername"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-brand transition-smooth hover:scale-[1.03]"
            >
              Analyze profile <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">Start by clicking the Get started button · Public GitHub data only</p>
        </section>

        <div className="mt-24 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Everything you need, in one place</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Free features get you a recruiter-ready profile. Pro turns it into interviews.
          </p>
        </div>
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="animate-fade-in-up relative rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                className={
                  "absolute right-4 top-4 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider " +
                  (f.tier === "Pro"
                    ? "bg-gradient-brand text-white shadow-brand"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400")
                }
              >
                {f.tier}
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-brand">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-24 rounded-3xl border border-border bg-card p-8 text-center shadow-card sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to level up your profile?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Get a full report in under 30 seconds — including a downloadable improvement plan.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-brand transition-smooth hover:scale-[1.03]"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}

const features: { icon: typeof Trophy; title: string; desc: string; tier: "Free" | "Pro" }[] = [
  { icon: Trophy,    tier: "Free", title: "GitScore /700 with developer tier",  desc: "A live 700-point score across quality, activity, impact, breadth and profile — plus your tier (Rising, Skilled, Elite) with a star rating." },
  { icon: Award,     tier: "Free", title: "Best repository score /100",         desc: "Codexa picks your strongest repo and rates it out of 100 with concrete reasons — lead with this on your resume." },
  { icon: Lightbulb, tier: "Free", title: "Project Ideas Lab",                  desc: "Portfolio-worthy project ideas matched to your target role and skill level, with a recruiter-signal fit score on every one." },
  { icon: FileText,  tier: "Pro",  title: "AI Bio, LinkedIn & Profile README",  desc: "Rewritten GitHub bio, a LinkedIn headline + About section, and a polished profile README — all ready to paste." },
  { icon: Briefcase, tier: "Pro",  title: "ATS Resume & Job Match Analyzer",    desc: "Auto-picks your best GitHub projects into an ATS-safe resume, and scores you against any job description." },
  { icon: Map,       tier: "Pro",  title: "30-day roadmap + PDF report",        desc: "A personalized week-by-week career plan and a downloadable recruiter-ready report you can share." },
];
