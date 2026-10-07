"use client";

import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { useUserProfile } from "@/lib/use-user-profile";

const PREMIUM_BENEFITS = [
  "360-character posts instead of 180",
  "Optional anonymity, not locked on",
  "50% ad revenue share on eligible posts",
  "Boost & Context Shield access",
];

const PREMIUM_PLUS_BENEFITS = [
  "720-character posts",
  "Toggle Gist-Ad on any post — all 4 ad products",
  "60% ad revenue share on eligible posts",
  "Creator profile stays visible while your subscription's active",
];

/** Real benefits pulled from our own TIERS, not the generic "get rid of
 * ads, see your analytics" copy every social app ships with. Renders
 * nothing for a signed-out visitor or an existing Premium+ subscriber —
 * there's nothing left to upsell either of those. */
export default function SubscribeBanner() {
  const { user } = useAuth();
  const profile = useUserProfile(user?.uid ?? null);
  const tier = profile?.tier ?? "standard";

  if (!user || tier === "premium_plus") return null;

  const isUpgrade = tier === "premium";
  const targetLabel = isUpgrade ? "Premium+" : "Premium";
  const benefits = isUpgrade ? PREMIUM_PLUS_BENEFITS : PREMIUM_BENEFITS;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-5">
      <h3 className="font-display text-lg font-bold">
        {isUpgrade ? `Upgrade to ${targetLabel}` : `Subscribe to ${targetLabel}`}
      </h3>
      <ul className="mt-3 space-y-1.5 text-sm text-muted">
        {benefits.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-lime">✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/#tiers"
        className="mt-4 inline-block rounded-full bg-gradient-to-r from-cyan to-lime px-5 py-2 font-mono-brand text-xs font-semibold text-background hover:opacity-90 transition-opacity"
      >
        {isUpgrade ? `Upgrade to ${targetLabel}` : "Subscribe"}
      </Link>
    </div>
  );
}
