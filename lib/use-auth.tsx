"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

interface AuthState {
  user: User | null;
  loading: boolean;
  /** True once Firebase env vars are missing — pages should fall back to
   * mock data / a signed-out UI rather than throwing. */
  unconfigured: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, unconfigured: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, unconfigured: false });

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setState({ user, loading: false, unconfigured: false });
      });
    } catch (err) {
      // Firebase env vars not set (or a stale dev server hasn't picked up
      // .env.local yet) — treat as signed-out rather than crashing the
      // whole app. console.warn (not .error) on purpose: Next's dev overlay
      // treats console.error like an uncaught exception, which is exactly
      // the false-alarm this was already fixed for once (see
      // GoogleSignInButton.tsx). warn still surfaces the SPECIFIC missing-
      // var message from lib/firebase/client.ts in devtools without the
      // red screen — check the console for the exact reason if this fires
      // unexpectedly.
      console.warn("[Allegedly] Auth unconfigured:", err instanceof Error ? err.message : err);
      setState({ user: null, loading: false, unconfigured: true });
    }
    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
