"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import Nav from "@/components/Nav";
import AvatarUpload from "@/components/settings/AvatarUpload";
import CreatorVisibilitySection from "@/components/settings/CreatorVisibilitySection";
import SocialLinksSection from "@/components/settings/SocialLinksSection";
import { useAuth } from "@/lib/use-auth";
import { useUserProfile } from "@/lib/use-user-profile";
import { getFirebaseAuth } from "@/lib/firebase/client";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, unconfigured } = useAuth();
  const profile = useUserProfile(user?.uid ?? null);

  const handleSignOut = async () => {
    try {
      await signOut(getFirebaseAuth());
      router.push("/");
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-5 font-display text-lg font-semibold">Settings</h1>

        {unconfigured && (
          <div className="mb-5 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 font-mono-brand text-xs text-amber">
            Firebase isn&apos;t configured yet — sign-in and account settings need
            the env vars from Deployment Guide §3.1.
          </div>
        )}

        {!loading && !unconfigured && !user && (
          <p className="rounded-xl border border-border-subtle bg-surface p-6 text-center text-sm text-muted">
            Sign in to manage your account settings.
          </p>
        )}

        {user && (
          <div className="flex flex-col gap-4">
            <section className="rounded-xl border border-border-subtle bg-surface p-4">
              <h2 className="mb-3 font-mono-brand text-xs uppercase tracking-widest text-muted">
                Profile photo
              </h2>
              <AvatarUpload userId={user.uid} currentAvatarUrl={profile?.avatarUrl || user.photoURL || undefined} />
            </section>

            <section className="rounded-xl border border-border-subtle bg-surface p-4">
              <h2 className="mb-3 font-mono-brand text-xs uppercase tracking-widest text-muted">
                Account
              </h2>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Email</span>
                <span>{user.email ?? "—"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted">Account tier</span>
                <span className="font-mono-brand text-xs uppercase tracking-widest text-cyan">
                  {(profile?.tier ?? "standard").replace("_", "+ ")}
                </span>
              </div>
            </section>

            {profile && profile.tier !== "standard" && (
              <>
                <CreatorVisibilitySection userId={user.uid} profile={profile} />
                <SocialLinksSection userId={user.uid} profile={profile} />
              </>
            )}

            <section className="rounded-xl border border-border-subtle bg-surface p-4">
              <h2 className="mb-3 font-mono-brand text-xs uppercase tracking-widest text-muted">
                Notifications
              </h2>
              <p className="text-sm text-muted">
                Push/email notification preferences aren&apos;t built yet — planned
                for Phase 5 per the Tech Debt Report.
              </p>
            </section>

            <section className="rounded-xl border border-border-subtle bg-surface p-4">
              <h2 className="mb-3 font-mono-brand text-xs uppercase tracking-widest text-muted">
                Payments
              </h2>
              <p className="text-sm text-muted">
                Subscription and billing management isn&apos;t built yet — planned
                for Phase 3 (Stripe + Paystack).
              </p>
            </section>

            <button
              onClick={handleSignOut}
              className="self-start rounded-full border border-danger/40 px-5 py-2 font-mono-brand text-xs font-semibold text-danger hover:bg-danger/10 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
