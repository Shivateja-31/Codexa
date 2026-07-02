// AI analysis service. Currently uses heuristic/mocked logic so the UI is fully functional.
// To plug in FastAPI + Gemini later, replace analyzeProfile() with:
//   const res = await fetch(`${API_BASE}/analyze`, { method: "POST", body: JSON.stringify(data) });
//   return await res.json() as AIAnalysis;

import type { GitHubData, GitHubRepo } from "./github-service";

export interface RepoRating {
  name: string;
  score: number; // 0-100
  notes: string;
}

export interface AIAnalysis {
  overallScore: number; // 0-100
  recruiterImpression: string;
  recruiterFirstImpression: string;
  strengths: string[];
  weaknesses: string[];
  top5Strengths: string[];
  top5Weaknesses: string[];
  careerReadinessScore: number;
  bestRepository: { name: string; url: string; reason: string; score: number; stars: number; forks: number; language: string | null } | null;
  biggestCareerMistake: string;
  lockedInsightsCount: number;
  improvementOpportunities: number;
  missingSkills: string[];
  repoRatings: RepoRating[];
  codingConsistency: number; // 0-100
  documentationQuality: number; // 0-100
  profileCompleteness: number; // 0-100
  suggestions: string[];
  rewrittenBio: string;
  linkedinHeadline: string;
  linkedinAbout: string;
  githubReadme: string;
  projectRoadmap: { title: string; description: string }[];
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function analyzeProfile(data: GitHubData): Promise<AIAnalysis> {
  await delay(1400); // simulate Gemini latency

  const { profile, repos, pinned, languages, totalStars, totalForks } = data;
  const topLangs = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l]) => l);
  const repoCount = repos.length;

  // Profile completeness scoring
  const completenessFields = [
    !!profile.name, !!profile.bio, !!profile.avatar_url, !!profile.company,
    !!profile.location, !!profile.blog, !!profile.email, !!profile.twitter_username,
  ];
  const profileCompleteness = Math.round((completenessFields.filter(Boolean).length / completenessFields.length) * 100);

  // Documentation quality based on README availability of top repos
  const docsChecked = pinned.slice(0, 3);
  const docsWith = docsChecked.filter((r) => r.has_readme && (r.readme_excerpt?.length ?? 0) > 200).length;
  const documentationQuality = docsChecked.length === 0
    ? 50
    : Math.round((docsWith / docsChecked.length) * 100);

  // Coding consistency: spread of pushed_at over last 12 months
  const now = Date.now();
  const months = new Set<string>();
  for (const r of repos) {
    const d = new Date(r.pushed_at);
    if (now - d.getTime() < 365 * 24 * 60 * 60 * 1000) {
      months.add(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
    }
  }
  const codingConsistency = Math.min(100, Math.round((months.size / 12) * 100) + (repoCount > 20 ? 10 : 0));

  // Overall score: weighted blend
  const repoScore = Math.min(100, repoCount * 4);
  const starScore = Math.min(100, totalStars * 2);
  const overallScore = Math.round(
    profileCompleteness * 0.15 +
    documentationQuality * 0.2 +
    codingConsistency * 0.25 +
    repoScore * 0.2 +
    starScore * 0.2,
  );

  const repoRatings: RepoRating[] = pinned.slice(0, 6).map((r) => ({
    name: r.name,
    score: rateRepo(r),
    notes: repoNotes(r),
  }));

  const strengths: string[] = [];
  if (totalStars > 20) strengths.push(`Earned ${totalStars} total stars — your work resonates with other developers.`);
  if (topLangs.length >= 3) strengths.push(`Polyglot developer fluent in ${topLangs.slice(0, 3).join(", ")}.`);
  if (codingConsistency > 60) strengths.push("Consistent contribution cadence across recent months.");
  if (profile.followers > 10) strengths.push(`A growing audience of ${profile.followers} followers.`);
  if (strengths.length === 0) strengths.push("Solid foundation to build upon — let's amplify your visible impact.");

  const weaknesses: string[] = [];
  if (!profile.bio) weaknesses.push("Empty bio — recruiters skip profiles without a clear value statement.");
  if (documentationQuality < 60) weaknesses.push("Top repositories are missing comprehensive READMEs.");
  if (codingConsistency < 50) weaknesses.push("Activity is sporadic; a steadier rhythm signals reliability.");
  if (totalStars < 5) weaknesses.push("Low repository engagement — share your work where developers gather.");
  if (!profile.blog) weaknesses.push("No personal site or blog linked from the profile.");

  const missingSkills = inferMissingSkills(topLangs);

  const suggestions = [
    "Pin 6 repositories that best represent your range and recent work.",
    "Add a profile README with a short intro, tech stack, and a featured project.",
    "Write a 1-paragraph README for every pinned repo: problem, approach, screenshot.",
    "Tag repos with relevant topics so they surface in GitHub search.",
    "Schedule one public commit per week — even tiny improvements compound.",
    "Add live demo links and screenshots to your top three projects.",
  ];

  const displayName = profile.name ?? profile.login;
  const role = topLangs[0] ? `${topLangs[0]} Developer` : "Software Engineer";

  // ---- Rich free-plan signals ----
  const top5Strengths = buildTop5Strengths(profile, repos, topLangs, totalStars, totalForks, codingConsistency, documentationQuality);
  const top5Weaknesses = buildTop5Weaknesses(profile, repos, pinned, topLangs, totalStars, documentationQuality, codingConsistency, profileCompleteness);

  // Career readiness: employability signal (documentation, consistency, presence, stack breadth)
  const stackBreadth = Math.min(100, topLangs.length * 20);
  const presence = Math.min(100, profile.followers * 4 + (profile.blog ? 20 : 0) + (profile.bio ? 15 : 0));
  const careerReadinessScore = Math.round(
    documentationQuality * 0.28 +
    codingConsistency * 0.24 +
    profileCompleteness * 0.18 +
    stackBreadth * 0.15 +
    presence * 0.15,
  );

  // Best repository — highest-rated among all non-forks
  const rated = repos.filter((r) => !r.fork).map((r) => ({ r, s: rateRepo(r) })).sort((a, b) => b.s - a.s);
  const bestRepository = rated[0]
    ? {
        name: rated[0].r.name,
        url: rated[0].r.html_url,
        reason: bestRepoReason(rated[0].r, rated[0].s),
        score: rated[0].s,
        stars: rated[0].r.stargazers_count,
        forks: rated[0].r.forks_count,
        language: rated[0].r.language,
      }
    : null;

  const biggestCareerMistake = pickBiggestMistake({
    profile, pinned, documentationQuality, codingConsistency, totalStars, topLangs,
  });

  // Locked/insight counters — deterministic-ish based on profile size so it feels real
  const weaknessSurface = top5Weaknesses.length + missingSkills.length + repos.filter((r) => !r.description).length;
  const improvementOpportunities = Math.max(8, Math.min(40, weaknessSurface + Math.round((100 - overallScore) / 6)));
  const lockedInsightsCount = 12 + Math.round((100 - overallScore) / 8) + (repos.length > 15 ? 3 : 0);

  return {
    overallScore,
    recruiterImpression: recruiterImpression(overallScore, displayName, role),
    recruiterFirstImpression: recruiterFirstImpression(overallScore, displayName, role, totalStars, repos.length),
    strengths,
    weaknesses,
    top5Strengths,
    top5Weaknesses,
    careerReadinessScore,
    bestRepository,
    biggestCareerMistake,
    lockedInsightsCount,
    improvementOpportunities,
    missingSkills,
    repoRatings,
    codingConsistency,
    documentationQuality,
    profileCompleteness,
    suggestions,
    rewrittenBio: `${role} • Building with ${topLangs.slice(0, 2).join(" & ") || "modern web tools"} • Open-source enthusiast`,
    linkedinHeadline: `${role} | ${topLangs.slice(0, 3).join(" • ") || "Full-Stack"} | Open Source Contributor`,
    linkedinAbout: linkedinAbout(displayName, role, topLangs, totalStars, totalForks),
    githubReadme: readmeTemplate(displayName, role, topLangs, pinned),
    projectRoadmap: roadmap(topLangs),
  };
}

function buildTop5Strengths(
  profile: GitHubData["profile"], repos: GitHubRepo[], topLangs: string[],
  totalStars: number, totalForks: number, consistency: number, docs: number,
): string[] {
  const s: string[] = [];
  if (totalStars >= 10) s.push(`${totalStars} total stars across your repos — real community traction.`);
  if (topLangs.length >= 3) s.push(`Polyglot range across ${topLangs.slice(0, 4).join(", ")}.`);
  if (consistency >= 60) s.push(`Consistent shipping cadence (${consistency}% activity spread).`);
  if (docs >= 60) s.push(`Documentation quality is above average (${docs}%).`);
  if (profile.followers >= 10) s.push(`Growing audience of ${profile.followers} followers.`);
  if (totalForks >= 5) s.push(`${totalForks} forks — other developers are building on your work.`);
  if (profile.bio) s.push(`Profile bio is present and readable — first impression works.`);
  if (repos.length >= 15) s.push(`${repos.length} public repos show a strong body of work.`);
  if (profile.blog) s.push(`Personal site linked — recruiters can go deeper in one click.`);
  if (repos.some((r) => r.topics?.length)) s.push(`Repositories use topics — good for GitHub search discoverability.`);
  while (s.length < 5) s.push("Baseline developer presence in place — quick wins ahead.");
  return s.slice(0, 5);
}

function buildTop5Weaknesses(
  profile: GitHubData["profile"], repos: GitHubRepo[], pinned: GitHubRepo[],
  topLangs: string[], totalStars: number, docs: number, consistency: number, completeness: number,
): string[] {
  const w: string[] = [];
  if (!profile.bio) w.push("Empty bio — recruiters skip profiles without a one-line value statement.");
  if (!profile.name) w.push("No display name set — profile reads as anonymous.");
  if (docs < 60) w.push(`Top repositories are under-documented (${docs}% doc quality).`);
  if (consistency < 50) w.push(`Activity is sporadic (${consistency}% consistency) — reads as a hobbyist.`);
  if (totalStars < 5) w.push("Very low star count — projects are not being shared publicly.");
  if (!profile.blog) w.push("No portfolio or blog linked — nowhere for a recruiter to read more.");
  if (repos.filter((r) => !r.description).length > 3) w.push("Multiple repos are missing descriptions — they look abandoned.");
  if (pinned.every((r) => !r.topics?.length)) w.push("Pinned repos have no topics — hurts GitHub search discoverability.");
  if (topLangs.length < 2) w.push("Single-language profile — hiring managers prefer visible range.");
  if (completeness < 60) w.push(`Profile completeness is only ${completeness}% — several fields are empty.`);
  while (w.length < 5) w.push("No major weakness detected in this category.");
  return w.slice(0, 5);
}

function bestRepoReason(r: GitHubRepo, score: number): string {
  const bits: string[] = [];
  if (r.stargazers_count > 0) bits.push(`${r.stargazers_count} stars`);
  if (r.forks_count > 0) bits.push(`${r.forks_count} forks`);
  if (r.has_readme) bits.push("has README");
  if (r.topics?.length) bits.push(`${r.topics.length} topics`);
  if (r.language) bits.push(r.language);
  const detail = bits.length ? ` — ${bits.join(" · ")}` : "";
  return `Highest overall score (${score}/100)${detail}. Lead with this on your resume.`;
}

function pickBiggestMistake(x: {
  profile: GitHubData["profile"]; pinned: GitHubRepo[]; documentationQuality: number;
  codingConsistency: number; totalStars: number; topLangs: string[];
}): string {
  if (!x.profile.bio) return "No bio on your profile — this is the single highest-leverage 5-minute fix. Recruiters decide in seconds.";
  if (x.documentationQuality < 40) return "Your best projects have no READMEs. Great code with no README reads as unfinished work.";
  if (x.pinned.length === 0) return "Nothing is pinned. Recruiters see your most recent repo — often not your best. Pin 6 today.";
  if (x.codingConsistency < 30) return "Your contribution graph has long silent stretches — reads as inactive. Ship one small commit per week.";
  if (x.totalStars < 3) return "You're not sharing your work publicly. Post one project to r/programming or Hacker News this month.";
  if (x.topLangs.length < 2) return "Single-language profile — hiring managers filter for range. Add one project in a second language.";
  return "You're underselling real work — the code is good, but the packaging (READMEs, screenshots, demo links) is missing.";
}

function recruiterFirstImpression(score: number, name: string, role: string, stars: number, repoCount: number): string {
  const roleL = role.toLowerCase();
  if (score >= 80) return `Strong yes. ${name} looks like a senior ${roleL} — ${stars} stars, ${repoCount} public repos, well-presented. I'd fast-track this to a first-round call.`;
  if (score >= 65) return `Interested. ${name} is clearly a capable ${roleL}. The work is there — a couple of polish items would move this from "worth a look" to "must-interview".`;
  if (score >= 45) return `Curious but hesitant. There's real capability here, but the profile undersells it. I'd need a resume or portfolio to justify the call.`;
  if (score >= 25) return `Skeptical. ${name} feels early-career or inactive. Without a bio, pinned repos, or READMEs, I'd probably move on to the next candidate.`;
  return `Pass. Nothing on this profile signals hireable — no bio, thin repos, and no visible activity. This is fixable in a weekend.`;
}


function rateRepo(r: GitHubRepo): number {
  let score = 40;
  if (r.description) score += 10;
  if (r.has_readme) score += 15;
  score += Math.min(20, r.stargazers_count * 2);
  if (r.topics?.length) score += 8;
  if (Date.now() - new Date(r.pushed_at).getTime() < 90 * 86400000) score += 7;
  return Math.min(100, score);
}

function repoNotes(r: GitHubRepo): string {
  const issues: string[] = [];
  if (!r.description) issues.push("missing description");
  if (!r.has_readme) issues.push("no README");
  if (!r.topics?.length) issues.push("no topics");
  if (issues.length === 0) return "Well-presented and recently active.";
  return `Could improve: ${issues.join(", ")}.`;
}

function recruiterImpression(score: number, name: string, role: string): string {
  if (score >= 80) return `${name} reads as a senior ${role.toLowerCase()} with strong open-source presence — likely to clear the resume screen quickly.`;
  if (score >= 60) return `${name} shows real engineering capability. A few polish items would move this profile from "good" to "must-interview".`;
  if (score >= 40) return `${name} has promising work but the surface area a recruiter sees is undersold. The fixes below are quick wins.`;
  return `${name}'s profile underrepresents real ability. Focus on visibility: profile README, project READMEs, and pinned work.`;
}

function inferMissingSkills(topLangs: string[]): string[] {
  const has = new Set(topLangs.map((l) => l.toLowerCase()));
  const out: string[] = [];
  if (!has.has("typescript") && has.has("javascript")) out.push("TypeScript — table stakes for modern frontend roles.");
  if (!has.has("docker")) out.push("Docker — show one containerized project.");
  if (!has.has("python")) out.push("Python — broadens eligibility for data/AI roles.");
  if (!has.has("go") && !has.has("rust")) out.push("A systems language (Go or Rust) signals depth.");
  out.push("Testing — visible test coverage in at least one pinned repo.");
  out.push("CI/CD — a green GitHub Actions badge instantly reads professional.");
  return out.slice(0, 5);
}

function linkedinAbout(name: string, role: string, langs: string[], stars: number, forks: number): string {
  return `I'm ${name}, a ${role.toLowerCase()} who enjoys turning hard problems into clean, shippable software. My work spans ${langs.slice(0, 3).join(", ") || "the modern web stack"}, with an emphasis on clarity, performance, and developer experience.

Across my open-source projects I've earned ${stars}+ stars and ${forks}+ forks from the community. I care about writing code that's easy to read six months later, building systems that scale gracefully, and shipping experiences users actually enjoy.

I'm currently exploring opportunities where I can contribute to a high-craft team and keep growing. If you're hiring or just want to swap notes, my inbox is open.`;
}

function readmeTemplate(name: string, role: string, langs: string[], pinned: GitHubRepo[]) {
  const langBadges = langs.slice(0, 5).map((l) => `![${l}](https://img.shields.io/badge/-${l}-3B82F6?style=flat-square)`).join(" ");
  const featured = pinned.slice(0, 3).map((r) => `- [**${r.name}**](${r.html_url}) — ${r.description ?? "A project worth a look."}`).join("\n");
  return `# Hi, I'm ${name} 👋

### ${role} • Building thoughtful software

${langBadges}

I love shipping clean, well-tested code and learning in public. Always happy to chat about open source, system design, or the next great side project.

**Currently:** Exploring new opportunities. Open to collaboration.

### 🚀 Featured Projects
${featured || "_Coming soon._"}

### 📊 GitHub Stats
![Stats](https://github-readme-stats.vercel.app/api?username=${name.toLowerCase().replace(/\s+/g, "")}&show_icons=true&theme=tokyonight)

### 📫 Get in touch
- Twitter / X — @yourhandle
- LinkedIn — /in/yourhandle
- Email — you@example.com
`;
}

function roadmap(langs: string[]) {
  const primary = langs[0] ?? "your favourite language";
  return [
    { title: "Week 1 — Polish your shopfront", description: "Profile README, fresh bio, pin 6 strongest repos, add descriptions and topics to every pinned repo." },
    { title: "Week 2 — Documentation pass", description: `Write a proper README for each pinned ${primary} project: problem, demo GIF, install, usage, tech.` },
    { title: "Week 3 — Build a portfolio project", description: "Ship one ambitious end-to-end project that showcases architecture, testing, and CI/CD." },
    { title: "Week 4 — Go public", description: "Write a launch post, share on Twitter/X and dev.to, submit to Hacker News. Track stars." },
    { title: "Month 2 — Contribute upstream", description: "Pick two well-known OSS projects in your stack and land a non-trivial PR in each." },
    { title: "Month 3 — Teach what you know", description: "Publish a deep-dive blog post or short video series. Teaching cements expertise and grows your audience." },
  ];
}
