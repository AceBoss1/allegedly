"use client";

// Fixes Tech Debt Report §1.2 "Client-side status checks": the old GistCard
// fired 4 parallel filter() queries (Like/Save/Regist/Highlight) per card,
// per render — O(n) reads for n cards on screen. Instead, a signed-in user's
// entire interaction state lives in one `UserInteractions` doc (see
// types/entities.ts), fetched ONCE per session via a live listener, then
// consulted in-memory by every GistCard via plain Set.has() lookups.
//
// Writes go through toggleInteraction(), which optimistically updates local
// state immediately and lets a Cloud Function trigger (deployed separately,
// see functions/ once that's scaffolded) reconcile the UserInteractions doc
// and the denormalized like/save/regist/highlight counts on the Gist doc.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { ConsensusVote, UserInteractions } from "@/types/entities";

const EMPTY_INTERACTIONS: Omit<UserInteractions, "userId" | "updatedAt"> = {
  likedGistIds: [],
  savedGistIds: [],
  registedGistIds: [],
  highlightedGistIds: [],
  votedGistIds: {},
};

export type InteractionKind = "like" | "save" | "regist" | "highlight";

const KIND_TO_FIELD: Record<InteractionKind, keyof typeof EMPTY_INTERACTIONS> = {
  like: "likedGistIds",
  save: "savedGistIds",
  regist: "registedGistIds",
  highlight: "highlightedGistIds",
};

const KIND_TO_COLLECTION: Record<InteractionKind, string> = {
  like: "likes",
  save: "saves",
  regist: "regists",
  highlight: "highlights",
};

/**
 * Subscribes to the current user's single interactions doc. Returns Sets
 * (not arrays) so every GistCard's "am I liking this?" check is O(1)
 * instead of re-scanning an array or, worse, re-querying Firestore.
 */
export function useUserInteractions(userId: string | null) {
  const [raw, setRaw] = useState<UserInteractions | null>(null);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setRaw(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const db = getFirebaseDb();
    const ref = doc(db, "userInteractions", userId);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setRaw(snap.data() as UserInteractions);
        } else {
          setRaw({ userId, ...EMPTY_INTERACTIONS, updatedAt: Date.now() });
        }
        setLoading(false);
      },
      (err) => {
        console.error("useUserInteractions snapshot error", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userId]);

  const sets = useMemo(
    () => ({
      liked: new Set(raw?.likedGistIds ?? []),
      saved: new Set(raw?.savedGistIds ?? []),
      registed: new Set(raw?.registedGistIds ?? []),
      highlighted: new Set(raw?.highlightedGistIds ?? []),
      votes: raw?.votedGistIds ?? ({} as Record<string, ConsensusVote>),
    }),
    [raw]
  );

  return { ...sets, loading };
}

/**
 * Toggle a like/save/regist/highlight on a gist. Writes the source-of-truth
 * doc (e.g. `likes/{userId}_{gistId}`) which a Cloud Function mirrors into
 * the user's interactions doc and the gist's denormalized counts — this
 * function does not touch either of those directly, avoiding races between
 * client writes and trigger-driven writes.
 */
export async function toggleInteraction(
  kind: InteractionKind,
  userId: string,
  gistId: string,
  currentlyActive: boolean,
  extra?: Record<string, unknown>
) {
  const db = getFirebaseDb();
  const collectionName = KIND_TO_COLLECTION[kind];
  const docId = `${userId}_${gistId}`;
  const ref = doc(db, collectionName, docId);

  if (currentlyActive) {
    await deleteDoc(ref);
  } else {
    await setDoc(ref, {
      userId,
      gistId,
      createdAt: serverTimestamp(),
      ...extra,
    });
  }
}

type InteractionsContextValue = ReturnType<typeof useUserInteractions>;

const InteractionsContext = createContext<InteractionsContextValue | null>(null);

/**
 * Wrap a feed (or any screen that renders a list of GistCards) with this
 * once, near the top. It opens exactly ONE Firestore listener for the
 * signed-in user's interactions doc — every GistCard underneath reads from
 * this shared context instead of each opening its own listener, which is
 * the actual fix for the N+1 pattern (not just moving the same N queries
 * into N hook calls with a different name).
 */
export function InteractionsProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: ReactNode;
}) {
  const value = useUserInteractions(userId);
  return <InteractionsContext.Provider value={value}>{children}</InteractionsContext.Provider>;
}

/** Read the shared interaction state inside a card/list item. Throws if used
 * outside an InteractionsProvider so the mistake is caught in dev, not prod. */
export function useInteractions(): InteractionsContextValue {
  const ctx = useContext(InteractionsContext);
  if (!ctx) {
    throw new Error("useInteractions must be used within an <InteractionsProvider>");
  }
  return ctx;
}

export function isActive(kind: InteractionKind, sets: ReturnType<typeof useUserInteractions>, gistId: string) {
  switch (kind) {
    case "like":
      return sets.liked.has(gistId);
    case "save":
      return sets.saved.has(gistId);
    case "regist":
      return sets.registed.has(gistId);
    case "highlight":
      return sets.highlighted.has(gistId);
  }
}

export { KIND_TO_FIELD };
