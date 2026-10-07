"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth-actions";
import { useAuth } from "@/lib/use-auth";

export default function GoogleSignInButton({
  label = "Continue with Google",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const { unconfigured } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Checked up front rather than letting the click throw — lib/firebase/
  // client.ts intentionally throws when NEXT_PUBLIC_FIREBASE_* env vars are
  // missing (see that file), and Next's dev overlay treats any
  // console.error the same as an uncaught exception, which made an entirely
  // expected "not configured locally yet" state look like a real crash.
  if (unconfigured) {
    return (
      <div className={className}>
        <button
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle px-6 py-3 font-semibold text-muted opacity-60"
        >
          {label}
        </button>
        <p className="mt-2 text-xs text-muted">
          Sign-in isn't configured on this environment yet — see Deployment Guide §3.
        </p>
      </div>
    );
  }

  const handleClick = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      await signInWithGoogle();
      router.push("/feed");
    } catch (err) {
      // A genuinely unexpected failure (popup blocked, network error,
      // Firestore write failed) — this one's worth the console.error /
      // dev-overlay noise, unlike the "not configured" case above.
      console.error("Google sign-in failed", err);
      setStatus("error");
      setErrorMsg("Sign-in was cancelled or failed — try again.");
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className={`flex items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3 font-semibold text-background hover:opacity-90 transition-opacity disabled:opacity-50 ${className}`}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z"
          />
          <path
            fill="#FBBC05"
            d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33Z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
          />
        </svg>
        {status === "loading" ? "Signing in…" : label}
      </button>
      {status === "error" && <p className="mt-2 text-xs text-danger">{errorMsg}</p>}
    </div>
  );
}
