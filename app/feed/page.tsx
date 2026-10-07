"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import GistCard from "@/components/feed/GistCard";
import ReAllegedlyThread from "@/components/feed/ReAllegedlyThread";
import StoryBar from "@/components/feed/StoryBar";
import SubscribeBanner from "@/components/SubscribeBanner";
import { InteractionsProvider } from "@/lib/interactions";
import { useAuth } from "@/lib/use-auth";
import { useLiveGists } from "@/lib/use-live-gists";
import { getFeedGists } from "@/lib/mock-data";

export default function FeedPage() {
  const { user, loading } = useAuth();
  const liveGists = useLiveGists();
  // null (not []) from useLiveGists means "Firestore unreachable" — fall
  // back to seed data. An empty array means "configured, zero real posts
  // yet," which is real information and should NOT be masked by mock data.
  const gists = liveGists ?? getFeedGists();
  const isLive = liveGists !== null;

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <StoryBar />

        <div className="mt-4">
          <SubscribeBanner />
        </div>

        <div className="mb-5 mt-4 flex items-center justify-between">
          <h1 className="font-display text-lg font-semibold">Feed</h1>
          <Link
            href="/create"
            className="rounded-full bg-gradient-to-r from-cyan to-lime px-4 py-2 font-mono-brand text-xs font-semibold text-background hover:opacity-90 transition-opacity"
          >
            + Post a Gist
          </Link>
        </div>

        {!isLive && !loading && (
          <div className="mb-5 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 font-mono-brand text-xs text-amber">
            Firebase isn&apos;t configured yet — showing seed data. Fill in
            .env.local (see Deployment Guide §3.1) to connect Firestore and
            enable posting.
          </div>
        )}

        {isLive && gists.length === 0 && (
          <p className="mb-5 rounded-xl border border-border-subtle bg-surface p-6 text-center text-sm text-muted">
            No gists yet — be the first to post one.
          </p>
        )}

        <InteractionsProvider userId={user?.uid ?? null}>
          <div className="flex flex-col gap-3">
            {gists.map((gist) => (
              <div key={gist.id} className="flex flex-col gap-2">
                <GistCard gist={gist} currentUserId={user?.uid ?? null} />
                <ReAllegedlyThread gistId={gist.id} />
              </div>
            ))}
          </div>
        </InteractionsProvider>
      </main>
    </div>
  );
}
