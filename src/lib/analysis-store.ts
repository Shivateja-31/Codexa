import type { AIAnalysis } from "./ai-analysis";
import type { GitHubData } from "./github-service";

const PREFIX = "codexa:result";
const LEGACY_KEY = "codexa:result";

export interface StoredResult {
  data: GitHubData;
  analysis: AIAnalysis;
  generatedAt: string;
}

function keyFor(userId?: string | null) {
  return userId ? `${PREFIX}:${userId}` : PREFIX;
}

export function saveResult(r: StoredResult, userId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(r));
  } catch {
    /* quota — ignore */
  }
}

export function loadResult(userId?: string | null): StoredResult | null {
  if (typeof window === "undefined") return null;
  const raw =
    localStorage.getItem(keyFor(userId)) ??
    (userId ? null : localStorage.getItem(LEGACY_KEY));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredResult;
  } catch {
    return null;
  }
}

export function clearResult(userId?: string | null) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(keyFor(userId));
}
