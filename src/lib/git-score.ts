// GitScore — 700-point developer score based purely on real GitHub data.
// Inspired by gitscore.it, computed 100% client-side from what we already fetched
// from the public GitHub API. Recomputed on every analysis, so scores update
// automatically when the user adds new repos.

import type { GitHubData, GitHubRepo } from "./github-service";

export interface CategoryScore {
  key: string;
  label: string;
  score: number;   // 0..max
  max: number;
  weight: number;  // same as max — kept for clarity
  detail: string;
  signals: string[];
}

export interface GitScoreResult {
  total: number;         // 0..700
  max: 700;
  percent: number;       // 0..100
  tier: {
    title: string;
    emoji: string;
    stars: number;       // 1..5 filled stars
    blurb: string;
    color: string;       // tailwind text color class
  };
  categories: CategoryScore[];
  computedAt: string;
}

const MAX_PER_CATEGORY = 140; // 5 x 140 = 700

/** Compute the 700-point score from live GitHub data. */
export function computeGitScore(data: GitHubData): GitScoreResult {
  const { profile, repos, pinned, languages, totalStars, totalForks } = data;
  const activeRepos = repos.filter((r) => !r.archived && !r.fork);

  const categories: CategoryScore[] = [
    repositoryQuality(activeRepos, pinned),
    activityConsistency(activeRepos),
    communityImpact(profile, activeRepos, totalStars, totalForks),
    technicalBreadth(activeRepos, languages),
    profileCompleteness(profile),
  ];

  const total = clamp(categories.reduce((s, c) => s + c.score, 0), 0, 700);
  const percent = Math.round((total / 700) * 100);
  const tier = tierFor(total);

  return { total, max: 700, percent, tier, categories, computedAt: new Date().toISOString() };
}

// ---------- Categories ----------

function repositoryQuality(repos: GitHubRepo[], pinned: GitHubRepo[]): CategoryScore {
  const total = repos.length;
  if (total === 0) {
    return zero("quality", "Repository Quality", "No public non-fork repositories to evaluate.");
  }
  const withDesc = repos.filter((r) => r.description && r.description.trim().length > 8).length;
  const withReadme = repos.filter((r) => r.has_readme).length;
  const withTopics = repos.filter((r) => (r.topics?.length ?? 0) >= 2).length;
  const substantial = repos.filter((r) => r.size > 100).length;
  const pinnedQuality = pinned.slice(0, 6).filter(
    (r) => r.has_readme && !!r.description && (r.topics?.length ?? 0) >= 1,
  ).length;

  const descRatio = withDesc / total;
  const readmeRatio = withReadme / total;
  const topicRatio = withTopics / total;
  const substantialRatio = substantial / total;

  const score = Math.round(
    descRatio * 30 +
    readmeRatio * 45 +
    topicRatio * 25 +
    substantialRatio * 20 +
    Math.min(20, pinnedQuality * 4),
  );

  return {
    key: "quality",
    label: "Repository Quality",
    score: clamp(score, 0, MAX_PER_CATEGORY),
    max: MAX_PER_CATEGORY,
    weight: MAX_PER_CATEGORY,
    detail: "READMEs, descriptions, topics and depth across your repos.",
    signals: [
      `${withReadme}/${total} repos with a README`,
      `${withDesc}/${total} repos with a real description`,
      `${withTopics}/${total} repos tagged with topics`,
      `${pinnedQuality}/${Math.min(6, pinned.length)} top repos fully packaged`,
    ],
  };
}

function activityConsistency(repos: GitHubRepo[]): CategoryScore {
  if (repos.length === 0) {
    return zero("activity", "Activity & Consistency", "No recent activity to measure.");
  }
  const now = Date.now();
  const YEAR = 365 * 24 * 60 * 60 * 1000;
  const months = new Set<string>();
  let pushedLast30 = 0;
  let pushedLast90 = 0;
  let pushedLastYear = 0;

  for (const r of repos) {
    const t = new Date(r.pushed_at).getTime();
    const diff = now - t;
    if (diff < YEAR) {
      const d = new Date(r.pushed_at);
      months.add(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
      pushedLastYear++;
    }
    if (diff < 90 * 86400000) pushedLast90++;
    if (diff < 30 * 86400000) pushedLast30++;
  }

  const monthsScore = Math.min(60, months.size * 5);              // up to 60
  const recentScore = Math.min(40, pushedLast30 * 8);              // up to 40
  const midScore = Math.min(25, pushedLast90 * 3);                 // up to 25
  const yearScore = Math.min(15, pushedLastYear * 1.5);            // up to 15

  const score = Math.round(monthsScore + recentScore + midScore + yearScore);

  return {
    key: "activity",
    label: "Activity & Consistency",
    score: clamp(score, 0, MAX_PER_CATEGORY),
    max: MAX_PER_CATEGORY,
    weight: MAX_PER_CATEGORY,
    detail: "How steadily you ship — spread of activity across the last 12 months.",
    signals: [
      `Active in ${months.size}/12 recent months`,
      `${pushedLast30} repos pushed in the last 30 days`,
      `${pushedLast90} repos pushed in the last 90 days`,
      `${pushedLastYear} repos pushed in the last year`,
    ],
  };
}

function communityImpact(
  profile: GitHubData["profile"],
  repos: GitHubRepo[],
  totalStars: number,
  totalForks: number,
): CategoryScore {
  const followers = profile.followers;
  const topStars = repos.reduce((m, r) => Math.max(m, r.stargazers_count), 0);
  const starredRepos = repos.filter((r) => r.stargazers_count > 0).length;

  const starScore = Math.min(60, Math.log2(totalStars + 1) * 12);   // up to 60
  const forkScore = Math.min(25, Math.log2(totalForks + 1) * 8);    // up to 25
  const followerScore = Math.min(30, Math.log2(followers + 1) * 7); // up to 30
  const hitScore = Math.min(15, topStars);                          // up to 15
  const breadthScore = Math.min(10, starredRepos);                  // up to 10

  const score = Math.round(starScore + forkScore + followerScore + hitScore + breadthScore);

  return {
    key: "impact",
    label: "Community Impact",
    score: clamp(score, 0, MAX_PER_CATEGORY),
    max: MAX_PER_CATEGORY,
    weight: MAX_PER_CATEGORY,
    detail: "Stars, forks and followers — real traction from other developers.",
    signals: [
      `${totalStars} total stars`,
      `${totalForks} total forks`,
      `${followers} followers`,
      `Best repo: ${topStars} stars`,
      `${starredRepos} repos with at least one star`,
    ],
  };
}

function technicalBreadth(
  repos: GitHubRepo[],
  languages: Record<string, number>,
): CategoryScore {
  const langs = Object.keys(languages);
  const langCount = langs.length;
  const repoCount = repos.length;
  const topicSet = new Set<string>();
  for (const r of repos) for (const t of r.topics ?? []) topicSet.add(t.toLowerCase());

  const modernBonus = ["typescript", "rust", "go", "docker", "kubernetes", "graphql", "react", "next"]
    .filter((k) => langs.map((l) => l.toLowerCase()).includes(k) || topicSet.has(k)).length;

  const langScore = Math.min(50, langCount * 8);           // up to 50
  const repoScore = Math.min(45, repoCount * 2);           // up to 45
  const topicScore = Math.min(25, topicSet.size * 2);      // up to 25
  const modernScore = Math.min(20, modernBonus * 5);       // up to 20

  const score = Math.round(langScore + repoScore + topicScore + modernScore);

  return {
    key: "breadth",
    label: "Technical Breadth",
    score: clamp(score, 0, MAX_PER_CATEGORY),
    max: MAX_PER_CATEGORY,
    weight: MAX_PER_CATEGORY,
    detail: "Range across languages, tools and modern stacks.",
    signals: [
      `${langCount} languages across your work`,
      `${repoCount} public non-fork repos`,
      `${topicSet.size} unique topics used`,
      `${modernBonus} modern-stack signals detected`,
    ],
  };
}

function profileCompleteness(profile: GitHubData["profile"]): CategoryScore {
  const parts: Array<[boolean, number, string]> = [
    [!!profile.name, 20, "display name set"],
    [!!profile.bio && profile.bio.trim().length > 10, 30, "meaningful bio"],
    [!!profile.avatar_url && !profile.avatar_url.includes("identicons"), 10, "custom avatar"],
    [!!profile.location, 10, "location listed"],
    [!!profile.blog, 25, "personal site / blog linked"],
    [!!profile.company, 10, "company / affiliation"],
    [!!profile.twitter_username, 10, "social handle"],
    [!!profile.email, 10, "public email"],
  ];
  const score = parts.filter(([ok]) => ok).reduce((s, [, w]) => s + w, 0);
  const filled = parts.filter(([ok]) => ok).map(([, , label]) => label);
  const missing = parts.filter(([ok]) => !ok).map(([, , label]) => label);

  return {
    key: "profile",
    label: "Profile Completeness",
    score: clamp(score, 0, MAX_PER_CATEGORY),
    max: MAX_PER_CATEGORY,
    weight: MAX_PER_CATEGORY,
    detail: "The first thing a recruiter sees on your profile page.",
    signals: [
      filled.length ? `Present: ${filled.join(", ")}` : "Nothing filled in yet.",
      missing.length ? `Missing: ${missing.join(", ")}` : "Every field filled — great work.",
    ],
  };
}

// ---------- Tiering ----------

function tierFor(total: number) {
  if (total >= 640) return { title: "Elite Open-Source Star", emoji: "👑", stars: 5, blurb: "Top-tier developer profile — reads like a public technical leader.", color: "text-amber-500" };
  if (total >= 540) return { title: "Expert Developer",        emoji: "🏆", stars: 5, blurb: "Highly polished profile with real community traction.",                 color: "text-fuchsia-500" };
  if (total >= 430) return { title: "Advanced Developer",      emoji: "💎", stars: 4, blurb: "Strong body of work — recruiters will happily reach out.",             color: "text-cyan-500" };
  if (total >= 320) return { title: "Skilled Developer",       emoji: "🚀", stars: 4, blurb: "Solid range and momentum — a few polish items away from great.",       color: "text-violet-500" };
  if (total >= 220) return { title: "Rising Developer",        emoji: "⭐", stars: 3, blurb: "Real progress showing — keep shipping and packaging your work.",       color: "text-primary" };
  if (total >= 130) return { title: "Beginner Developer",      emoji: "🌟", stars: 2, blurb: "Foundations are in place — time to invest in READMEs and consistency.", color: "text-emerald-500" };
  return               { title: "Newbie Coder",           emoji: "🌱", stars: 1, blurb: "Very early profile — focus on shipping and documenting one great project.", color: "text-lime-500" };
}

// ---------- Helpers ----------

function zero(key: string, label: string, detail: string): CategoryScore {
  return {
    key,
    label,
    score: 0,
    max: MAX_PER_CATEGORY,
    weight: MAX_PER_CATEGORY,
    detail,
    signals: [detail],
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
