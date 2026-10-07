"use client";

import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { useUserProfile } from "@/lib/use-user-profile";

/**
 * Matches the X/Twitter pattern from the reference screenshots: a "Get
 * Verified" nudge that shows on your OWN profile if you're not verified,
 * and ALSO shows when you visit someone else's verified profile (a
 * promotional "you could look like this" nudge) — never shown to viewers
 * who are already Premium/Premium+, and never shown on an unverified
 * stranger's profile (nothing to upsell there).
 */
export default function GetVerifiedBanner({
  profileUserId,
  profileTier,
  profileUsername,
}: {
  profileUserId: string;
  profileTier: "standard" | "premium" | "premium_plus";
  profileUsername: string;
}) {
  const { user } = useAuth();
  const viewerProfile = useUserProfile(user?.uid ?? null);

  if (!user) return null;
  const viewerTier = viewerProfile?.tier ?? "standard";
  if (viewerTier !== "standard") return null; // already paid, nothing to upsell

  const isOwnProfile = user.uid === profileUserId;
  const isVerifiedOther = !isOwnProfile && profileTier !== "standard";
  if (!isOwnProfile && !isVerifiedOther) return null;

  return (
    <div className="mb-5 flex items-center justify-between rounded-xl border border-cyan/30 bg-cyan/5 px-4 py-3">
      <p className="text-sm text-foreground">
        {isOwnProfile ? (
          "You aren't verified yet."
        ) : (
          <>Get verified like @{profileUsername} to stand out and unlock creator visibility.</>
        )}
      </p>
      <Link
        href="/#tiers"
        className="shrink-0 rounded-full bg-gradient-to-r from-cyan to-lime px-4 py-1.5 font-mono-brand text-xs font-semibold text-background hover:opacity-90 transition-opacity"
      >
        Get Verified
      </Link>
    </div>
  );
}
