"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { AllegedlyUser } from "@/types/entities";

/**
 * The control surface for the profile-invisibility feature described in
 * the Tech Debt Report: a Premium/Premium+ creator can go fully anonymous
 * (profile page disappears, gists render as Anonymous) independent of
 * their per-post anonymity choices — "go viral without being seen." This
 * toggle is what actually flips `creatorAnonymousMode`.
 *
 * `hasActiveSubscription` is shown read-only here since it's meant to be
 * webhook-driven once Phase 3 payments exist — a creator shouldn't be able
 * to just check a box and grant themselves an active subscription.
 */
export default function CreatorVisibilitySection({
  userId,
  profile,
}: {
  userId: string;
  profile: AllegedlyUser;
}) {
  const [anonymousMode, setAnonymousMode] = useState(Boolean(profile.creatorAnonymousMode));
  const [saving, setSaving] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setAnonymousMode(checked);
    setSaving(true);
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, "users", userId), { creatorAnonymousMode: checked }, { merge: true });
    } catch (err) {
      console.error("Failed to update creatorAnonymousMode", err);
      setAnonymousMode(!checked); // revert on failure
    } finally {
      setSaving(false);
    }
  };

  const isDiscoverable = Boolean(profile.hasActiveSubscription) && !anonymousMode;

  return (
    <section className="rounded-xl border border-border-subtle bg-surface p-4">
      <h2 className="mb-3 font-mono-brand text-xs uppercase tracking-widest text-muted">
        Creator visibility
      </h2>

      <label className="flex items-center justify-between text-sm">
        <span>Go anonymous (hide my profile)</span>
        <input
          type="checkbox"
          checked={anonymousMode}
          disabled={saving}
          onChange={(e) => handleToggle(e.target.checked)}
          className="accent-cyan"
        />
      </label>
      <p className="mt-2 text-xs text-muted">
        While on, your profile page is hidden and your gists show as Anonymous — same as a
        Standard account — regardless of your subscription status.
      </p>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted">Subscription</span>
        <span className={profile.hasActiveSubscription ? "text-lime" : "text-danger"}>
          {profile.hasActiveSubscription ? "Active" : "Not active"}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">
        Managed by billing, not this toggle — see the Payments section below. Your profile
        needs an active subscription <em>and</em> anonymous mode off to be publicly visible.
      </p>

      <p className="mt-3 font-mono-brand text-[11px] uppercase tracking-widest text-muted">
        Profile is currently: <span className={isDiscoverable ? "text-lime" : "text-amber"}>{isDiscoverable ? "visible" : "hidden"}</span>
      </p>
    </section>
  );
}
