"use client";

import { useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { useGistSpotMembership, toggleGistSpotMembership } from "@/lib/gist-spot-membership";

export default function JoinButton({ spotId }: { spotId: string }) {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const { isMember, loading } = useGistSpotMembership(userId, spotId);
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (!userId || pending) return;
    setPending(true);
    try {
      await toggleGistSpotMembership(userId, spotId, isMember);
    } catch (err) {
      console.error("toggleGistSpotMembership failed", err);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!userId || loading || pending}
      title={!userId ? "Sign in to join a Gist Spot" : undefined}
      className={`rounded-full px-4 py-1.5 font-mono-brand text-xs font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${
        isMember
          ? "border border-border-subtle text-foreground hover:border-muted"
          : "bg-gradient-to-r from-cyan to-lime text-background hover:opacity-90"
      }`}
    >
      {isMember ? "Joined" : "Join"}
    </button>
  );
}
