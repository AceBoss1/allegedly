"use client";

// Mounted near the top of app/page.tsx (the marketing landing page). Once
// Firebase Auth resolves and there IS a signed-in user, redirect straight to
// /feed rather than making returning users look at the marketing page again.
//
// Deliberately renders nothing and doesn't block/hide the server-rendered
// landing content while auth is still resolving — a brief flash of the
// landing page for a returning signed-in user on a slow connection is a
// better tradeoff than adding a loading skeleton that delays first paint for
// the (much more common) signed-out visitor.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/use-auth";

export default function RedirectIfAuthed() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/feed");
    }
  }, [loading, user, router]);

  return null;
}
