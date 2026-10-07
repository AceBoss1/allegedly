"use client";

import { useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { useIsFollowing, toggleFollow } from "@/lib/use-follow";

export default function FollowButton({ profileUserId }: { profileUserId: string }) {
  const { user } = useAuth();
  const { isFollowing, loading } = useIsFollowing(user?.uid ?? null, profileUserId);
  const [pending, setPending] = useState(false);

  if (user?.uid === profileUserId) return null; // no follow button on your own profile

  const handleClick = async () => {
    if (!user || pending) return;
    setPending(true);
    try {
      await toggleFollow(user.uid, profileUserId, isFollowing);
    } catch (err) {
      console.error("toggleFollow failed", err);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!user || loading || pending}
      title={!user ? "Sign in to follow" : undefined}
      className={`rounded-full px-4 py-1.5 font-mono-brand text-xs font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${
        isFollowing
          ? "border border-border-subtle text-foreground hover:border-muted"
          : "bg-gradient-to-r from-cyan to-lime text-background hover:opacity-90"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
