import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import GistDetailClient from "@/components/gist/GistDetailClient";
import { getAdminDb } from "@/lib/firebase/admin";
import { toMillis } from "@/lib/firestore-timestamps";
import { getGistById } from "@/lib/mock-data";
import { SITE_CONFIG } from "@/lib/site-config";
import type { Gist } from "@/types/entities";

// Plain Firestore doc ID in the URL (/gist/aB3dK9xQ...), not a
// content-derived slug — see ShareButton's comment in GistCard.tsx for the
// full reasoning (stable for the gist's lifetime even after an edit or
// retraction; a slug would need its own uniqueness handling and go stale).

async function fetchGist(gistId: string): Promise<Gist | null> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("gists").doc(gistId).get();
    if (!snap.exists) return null;
    const data = snap.data()!;
    return {
      id: snap.id,
      ...data,
      createdAt: toMillis(data.createdAt),
      updatedAt: toMillis(data.updatedAt),
    } as Gist;
  } catch (err) {
    // Admin SDK unconfigured (or any other server-side failure) — fall
    // back to mock data rather than 500ing the whole page. Same
    // unconfigured-degrades-gracefully pattern as everywhere else here.
    console.warn(
      "[Allegedly] fetchGist (admin) unavailable, falling back to mock data",
      err instanceof Error ? err.message : err
    );
    return getGistById(gistId) ?? null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gistId: string }>;
}): Promise<Metadata> {
  const { gistId } = await params;
  const gist = await fetchGist(gistId);

  if (!gist) {
    return { title: `${SITE_CONFIG.name} — Gist not found` };
  }

  const prefix = gist.isGistAd ? "" : "Allegedly, ";
  const fullText = `${prefix}${gist.text}`;
  const description = fullText.length > 200 ? `${fullText.slice(0, 197)}…` : fullText;
  const previewImage = gist.mediaUrls[0] || "/brand/logo-square.png";

  return {
    title: `${SITE_CONFIG.name} — ${description.slice(0, 70)}${description.length > 70 ? "…" : ""}`,
    description,
    openGraph: {
      title: SITE_CONFIG.name,
      description,
      images: [previewImage],
    },
  };
}

export default async function GistPage({
  params,
}: {
  params: Promise<{ gistId: string }>;
}) {
  const { gistId } = await params;
  const gist = await fetchGist(gistId);

  if (!gist) notFound();

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <GistDetailClient gist={gist} />
      </main>
    </div>
  );
}
