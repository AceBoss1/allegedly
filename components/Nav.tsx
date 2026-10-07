"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/use-auth";
import { useUserProfile } from "@/lib/use-user-profile";
import { signOutUser } from "@/lib/auth-actions";
import { SITE_CONFIG } from "@/lib/site-config";

export default function Nav() {
  const { user, loading } = useAuth();
  const profile = useUserProfile(user?.uid ?? null);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push("/");
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={user ? "/feed" : "/"} className="relative h-9 w-40 shrink-0">
          <Image
            src="/brand/logo-horizontal.png"
            alt="Allegedly"
            fill
            sizes="144px"
            className="object-contain object-left"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 font-mono-brand text-sm text-muted md:flex">
          {user ? (
            <>
              <Link href="/feed" className="hover:text-foreground transition-colors">
                feed
              </Link>
              <Link href="/discover" className="hover:text-foreground transition-colors">
                discover
              </Link>
              <Link href="/gist-spots" className="hover:text-foreground transition-colors">
                gist spots
              </Link>
            </>
          ) : (
            <>
              <Link href="/#how-it-works" className="hover:text-foreground transition-colors">
                how it works
              </Link>
              <Link href="/#tiers" className="hover:text-foreground transition-colors">
                tiers
              </Link>
              <Link href="/legal/community-guidelines" className="hover:text-foreground transition-colors">
                guidelines
              </Link>
            </>
          )}
        </nav>

        {/* While auth is still resolving, render the signed-out CTA — it
            matches the server-rendered initial state, so there's no
            hydration flash beyond the (usually instant) auth check. */}
        {user && !loading ? (
          <div className="flex items-center gap-3">
            <Link href="/settings" className="relative h-8 w-8 overflow-hidden rounded-full border border-border-subtle bg-surface-raised">
              {profile?.avatarUrl || user.photoURL ? (
                <Image
                  src={profile?.avatarUrl || user.photoURL!}
                  alt=""
                  fill
                  sizes="32px"
                  className="object-cover"
                  unoptimized={Boolean(profile?.avatarUrl)}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-mono-brand text-[10px] text-muted">
                  {(user.displayName || "?").slice(0, 1).toUpperCase()}
                </span>
              )}
            </Link>
            <button
              onClick={handleSignOut}
              className="hidden font-mono-brand text-xs text-muted hover:text-foreground transition-colors sm:inline"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/#join"
            className="rounded-full bg-gradient-to-r from-cyan to-lime px-5 py-2 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
          >
            Join the {SITE_CONFIG.accessCohortLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
