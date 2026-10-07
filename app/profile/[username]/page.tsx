import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import ProfileClient from "@/components/profile/ProfileClient";
import HiddenCreatorProfile from "@/components/profile/HiddenCreatorProfile";
import { getAdminDb } from "@/lib/firebase/admin";
import { toMillis } from "@/lib/firestore-timestamps";
import { getGistsByAuthor } from "@/lib/mock-data";
import type { AllegedlyUser, Gist } from "@/types/entities";

async function loadProfileData(
  username: string
): Promise<{ profile: AllegedlyUser; gists: Gist[]; isReal: boolean } | null> {
  // Try a real Firestore-backed profile first.
  try {
    const db = getAdminDb();
    const snap = await db.collection("users").where("username", "==", username).limit(1).get();
    if (!snap.empty) {
      const userDoc = snap.docs[0];
      const data = userDoc.data();
      const profile = {
        id: userDoc.id,
        ...data,
        createdAt: toMillis(data.createdAt),
      } as AllegedlyUser;

      const gistsSnap = await db
        .collection("gists")
        .where("authorId", "==", profile.id)
        .where("isAnonymous", "==", false)
        .get();
      const gists = gistsSnap.docs.map((d) => {
        const gd = d.data();
        return {
          id: d.id,
          ...gd,
          createdAt: toMillis(gd.createdAt),
          updatedAt: toMillis(gd.updatedAt),
        } as Gist;
      });

      return { profile, gists, isReal: true };
    }
  } catch (err) {
    console.warn(
      "[Allegedly] loadProfileData (admin) unavailable, falling back to mock data",
      err instanceof Error ? err.message : err
    );
  }

  // Fall back to mock data — the demo posts (e.g. AceBoss-NG) use a
  // human-readable authorId that doubles as "username," same documented
  // shortcut used throughout this codebase. Synthesize a minimal profile
  // from the first matching gist's denormalized author fields.
  const mockGists = getGistsByAuthor(username);
  if (mockGists.length === 0) return null;
  const first = mockGists[0];
  const profile: AllegedlyUser = {
    id: username,
    username,
    displayName: first.authorDisplayName || username,
    avatarUrl: first.authorAvatarUrl,
    tier: first.authorTier,
    isAnonymousLocked: first.authorTier === "standard",
    followerCount: 0,
    followingCount: 0,
    createdAt: Date.now(),
  };
  return { profile, gists: mockGists, isReal: false };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await loadProfileData(username);
  if (!data) notFound();

  const { profile, gists, isReal } = data;

  // Creator visibility gate: only applies to real, paid-tier profiles.
  // Standard accounts and mock/demo profiles are always shown (Standard
  // has no separate "creator visibility" concept — their posts are already
  // always anonymous, which is the whole point).
  const isDiscoverable =
    !isReal || profile.tier === "standard" || (Boolean(profile.hasActiveSubscription) && !profile.creatorAnonymousMode);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {isDiscoverable ? (
          <ProfileClient profile={profile} gists={gists} />
        ) : (
          <HiddenCreatorProfile username={username} />
        )}
      </main>
    </div>
  );
}
