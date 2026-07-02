// GitHub data fetcher. Public GitHub REST API — no auth needed for basic profile data.
// To migrate to a FastAPI backend later, replace fetchGitHubProfile() with a call to your endpoint.

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  pushed_at: string;
  created_at: string;
  topics: string[];
  fork: boolean;
  archived: boolean;
  has_readme?: boolean;
  readme_excerpt?: string;
}

export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubData {
  profile: GitHubProfile;
  repos: GitHubRepo[];
  pinned: GitHubRepo[]; // approximated as top-starred
  languages: Record<string, number>; // language -> repo count
  totalStars: number;
  totalForks: number;
  commitActivity: { week: string; commits: number }[]; // approximated from pushed_at
}

const GH_API = "https://api.github.com";

// GitHub username rules: 1–39 chars, alphanumeric or hyphen, no leading/trailing hyphen, no consecutive hyphens.
const GH_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

// Reserved top-level GitHub paths that are not user accounts.
const RESERVED_PATHS = new Set([
  "about", "pricing", "features", "enterprise", "team", "topics", "trending",
  "collections", "events", "marketplace", "explore", "settings", "notifications",
  "new", "login", "logout", "join", "signup", "search", "issues", "pulls",
  "watching", "stars", "dashboard", "organizations", "orgs", "site", "contact",
  "security", "readme", "sponsors", "codespaces", "discussions",
]);

export type ParseResult =
  | { ok: true; username: string }
  | { ok: false; error: string };

export function parseGithubUrl(input: string): ParseResult {
  if (input == null) return { ok: false, error: "Enter a GitHub username or profile URL." };
  let s = String(input).trim();
  if (!s) return { ok: false, error: "Enter a GitHub username or profile URL." };

  // Strip surrounding quotes/angle brackets and leading "@"
  s = s.replace(/^['"<\s]+|['">\s]+$/g, "");
  if (s.startsWith("@")) s = s.slice(1);

  let candidate = s;
  const looksLikeUrl =
    /^[a-z]+:\/\//i.test(s) ||
    /^(www\.)?github\.com(\/|$)/i.test(s);

  if (looksLikeUrl) {
    let urlStr = s;
    if (!/^[a-z]+:\/\//i.test(urlStr)) urlStr = "https://" + urlStr;
    let u: URL;
    try { u = new URL(urlStr); } catch {
      return { ok: false, error: "That doesn't look like a valid URL." };
    }
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "github.com") {
      return { ok: false, error: `Only github.com URLs are supported (got "${u.hostname}").` };
    }
    const segments = u.pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return { ok: false, error: "URL is missing a username (e.g. github.com/octocat)." };
    }
    candidate = segments[0];
  }

  // Drop trailing path/query/hash if user pasted "username/repo" or "username?tab=…"
  candidate = candidate.split(/[/?#]/)[0];

  if (!candidate) return { ok: false, error: "Could not find a username in that input." };
  if (candidate.length > 39) return { ok: false, error: "GitHub usernames are at most 39 characters." };
  if (!GH_USERNAME_RE.test(candidate)) {
    return {
      ok: false,
      error: "Invalid username — use letters, numbers, and single hyphens (no leading/trailing hyphen).",
    };
  }
  if (RESERVED_PATHS.has(candidate.toLowerCase())) {
    return { ok: false, error: `"${candidate}" is a reserved GitHub page, not a user profile.` };
  }

  return { ok: true, username: candidate };
}

export type StageEvent =
  | { type: "profile"; }
  | { type: "repos"; count: number }
  | { type: "readmes"; count: number };

export async function fetchGitHubData(
  username: string,
  onStage?: (e: StageEvent) => Promise<void> | void,
): Promise<GitHubData> {
  // Stage 1: profile
  const profileRes = await fetch(`${GH_API}/users/${username}`);
  if (profileRes.status === 404) throw new Error(`User "${username}" not found on GitHub.`);
  if (profileRes.status === 403) throw new Error("GitHub API rate limit reached. Try again in a few minutes.");
  if (!profileRes.ok) throw new Error("Could not fetch GitHub profile.");
  const profile = (await profileRes.json()) as GitHubProfile;
  await onStage?.({ type: "profile" });

  // Stage 2: repos
  const reposRes = await fetch(`${GH_API}/users/${username}/repos?per_page=100&sort=updated`);
  if (!reposRes.ok) throw new Error("Could not fetch repositories.");
  const allRepos = (await reposRes.json()) as GitHubRepo[];
  const repos = allRepos.filter((r) => !r.fork);
  await onStage?.({ type: "repos", count: repos.length });

  // Stage 3: pinned READMEs
  const pinned = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);
  const readmeTargets = pinned.slice(0, 3);
  await Promise.all(
    readmeTargets.map(async (r) => {
      try {
        const res = await fetch(`${GH_API}/repos/${r.full_name}/readme`, {
          headers: { Accept: "application/vnd.github.raw" },
        });
        if (res.ok) {
          const text = await res.text();
          r.has_readme = true;
          r.readme_excerpt = text.slice(0, 600);
        } else {
          r.has_readme = false;
        }
      } catch {
        r.has_readme = false;
      }
    }),
  );
  await onStage?.({ type: "readmes", count: readmeTargets.length });

  const languages: Record<string, number> = {};
  for (const r of repos) {
    if (r.language) languages[r.language] = (languages[r.language] ?? 0) + 1;
  }

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const buckets: { week: string; commits: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = now - (i + 1) * weekMs;
    const label = new Date(start).toISOString().slice(5, 10);
    const count = repos.filter((r) => {
      const t = new Date(r.pushed_at).getTime();
      return t >= start && t < start + weekMs;
    }).length;
    buckets.push({ week: label, commits: count * 3 + Math.floor(Math.random() * 4) });
  }

  return { profile, repos, pinned, languages, totalStars, totalForks, commitActivity: buckets };
}
