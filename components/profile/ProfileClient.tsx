"use client";

import Image from "next/image";
import { useAuth } from "@/lib/use-auth";
import GistCard from "@/components/feed/GistCard";
import ReAllegedlyThread from "@/components/feed/ReAllegedlyThread";
import { InteractionsProvider } from "@/lib/interactions";
import FollowButton from "@/components/profile/FollowButton";
import GetVerifiedBanner from "@/components/profile/GetVerifiedBanner";
import SocialLinksRow from "@/components/profile/SocialLinksRow";
import type { AllegedlyUser, Gist } from "@/types/entities";

export default function ProfileClient({
  profile,
  gists,
}: {
  profile: AllegedlyUser;
  gists: Gist[];
}) {
  const { user } = useAuth();
  const isOwnProfile = user?.uid === profile.id;

  return (
    <>
      <GetVerifiedBanner
        profileUserId={profile.id}
        profileTier={profile.tier}
        profileUsername={profile.username}
      />

      <div className="mb-6 overflow-hidden rounded-xl border border-border-subtle bg-surface">
        <div className="relative h-28 w-full bg-gradient-to-r from-cyan/20 to-lime/20">
          {profile.coverImageUrl && (
            <Image src={profile.coverImageUrl} alt="" fill className="object-cover" unoptimized />
          )}
        </div>

        <div className="flex items-start gap-4 p-5">
          <div className="relative -mt-10 h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-surface bg-surface-raised">
            {profile.avatarUrl && (
              <Image src={profile.avatarUrl} alt="" fill className="object-cover" unoptimized />
            )}
          </div>

          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-semibold">{profile.displayName}</h1>
              {profile.tier !== "standard" && (
                <span className="text-cyan" title="Identity verified — this does not verify content">
                  ✓
                </span>
              )}
            </div>
            <p className="font-mono-brand text-xs text-muted">@{profile.username}</p>
            {profile.bio && <p className="mt-2 text-sm text-foreground/90">{profile.bio}</p>}
            {profile.tier !== "standard" && <SocialLinksRow socialLinks={profile.socialLinks} />}
            <div className="mt-2 flex gap-4 font-mono-brand text-xs text-muted">
              <span>{gists.length} gists</span>
              <span>{profile.followerCount ?? 0} followers</span>
              <span>{profile.followingCount ?? 0} following</span>
            </div>
          </div>

          {isOwnProfile && (
            <div className="shrink-0 rounded-lg border border-border-subtle px-3 py-2 text-center">
              <p className="font-display text-lg font-bold text-lime">{profile.creditBalance ?? 0}</p>
              <p className="font-mono-brand text-[10px] uppercase tracking-widest text-muted">Credits</p>
            </div>
          )}

          {!isOwnProfile && (
            <div className="flex shrink-0 flex-col gap-2">
              <FollowButton profileUserId={profile.id} />
              <button
                onClick={() =>
                  alert("Gifting Allegedly Credits isn't live yet — Phase 3, see Tech Debt Report §7.")
                }
                className="rounded-full border border-border-subtle px-4 py-1.5 font-mono-brand text-xs font-semibold text-foreground hover:border-muted transition-colors"
              >
                🎁 Gift
              </button>
              {profile.tier !== "standard" && (
                <button
                  onClick={() => alert("Subscriptions aren't live yet — Phase 3, see Tech Debt Report.")}
                  className="rounded-full border border-lime/40 px-4 py-1.5 font-mono-brand text-xs font-semibold text-lime hover:bg-lime/10 transition-colors"
                >
                  Subscribe
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-3 font-mono-brand text-xs uppercase tracking-widest text-muted">Gists</h2>

      {gists.length === 0 ? (
        <p className="rounded-xl border border-border-subtle bg-surface p-6 text-center text-sm text-muted">
          No public gists yet — anonymous posts never appear on a profile, by design.
        </p>
      ) : (
        <InteractionsProvider userId={user?.uid ?? null}>
          <div className="flex flex-col gap-3">
            {gists.map((gist) => (
              <div key={gist.id} className="flex flex-col gap-2">
                <GistCard gist={gist} currentUserId={user?.uid ?? null} />
                <ReAllegedlyThread gistId={gist.id} />
              </div>
            ))}
          </div>
        </InteractionsProvider>
      )}
    </>
  );
}
