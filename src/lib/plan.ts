// Plan state is intentionally read-only on the client.
// Pro features stay locked — the upgrade modal is informational only.
// When real billing is wired up, flip `isPro` based on a server-verified entitlement.
import { useEffect, useState } from "react";

export type Plan = "free" | "pro";

export function usePlan() {
  // Hydration-safe: always start false on server + first client render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return {
    plan: "free" as Plan,
    isPro: false,
    mounted,
    // No-op: payment is not enabled yet. Kept so existing call sites compile.
    upgrade: () => {},
  };
}
