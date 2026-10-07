"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// NOTE — legal/compliance scope of this component:
// This is a *landing-page* gate: a self-attestation checkbox that blocks the
// marketing site behind a "confirm you're 18+" screen and remembers the choice
// in localStorage. It is NOT sufficient age assurance for the actual product.
// Real signup must collect a date of birth server-side and reject/queue accounts
// that fail it — see Tech Debt Report §4 Phase 4. Do not treat this component as
// having satisfied that requirement.

const STORAGE_KEY = "allegedly_age_confirmed_v1";

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [confirmed, setConfirmed] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setConfirmed(stored === "true");
  }, []);

  const confirm = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setConfirmed(true);
  };

  // Avoid a flash of gated content during hydration.
  if (confirmed === null) {
    return <div className="min-h-screen bg-background" />;
  }

  if (confirmed) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-8 text-center shadow-2xl shadow-black/40">
        <div className="mx-auto mb-6 h-12 w-40 relative">
          <Image
            src="/brand/logo-horizontal.png"
            alt="Allegedly"
            fill
            sizes="160px"
            className="object-contain"
            priority
          />
        </div>

        <p className="font-mono-brand text-xs uppercase tracking-widest text-amber mb-3">
          // age restricted
        </p>
        <h1 className="font-display text-xl font-semibold mb-3">
          You must be 18 or older to enter
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-6">
          Allegedly hosts unverified, user-submitted claims about real people, including
          sensitive and mature subject matter. By continuing you confirm you are at least
          18 years old and you accept our{" "}
          <Link href="/legal/terms" className="text-cyan underline underline-offset-2">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/legal/community-guidelines" className="text-cyan underline underline-offset-2">
            Community Guidelines
          </Link>
          .
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={confirm}
            className="rounded-xl bg-gradient-to-r from-cyan to-lime px-6 py-3 font-semibold text-background hover:opacity-90 transition-opacity"
          >
            I'm 18 or older — enter
          </button>
          <a
            href="https://www.google.com"
            className="rounded-xl border border-border-subtle px-6 py-3 font-semibold text-muted hover:text-foreground hover:border-muted transition-colors"
          >
            Exit
          </a>
        </div>
      </div>
    </div>
  );
}
