"use client";

import { useEffect, useState } from "react";

/**
 * Returns the current time in ms, refreshed on an interval. Fixes the
 * react-hooks/purity lint rule's complaint about calling Date.now() directly
 * in a render body (GistCard's timeAgo() and Context Shield expiry check
 * both did this) by moving "what time is it" into state that's read
 * during render rather than computed there.
 *
 * Default 30s refresh is plenty for both use cases — "3m ago" labels and a
 * Context Shield countdown don't need per-second precision.
 */
export function useNow(intervalMs: number = 30_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
