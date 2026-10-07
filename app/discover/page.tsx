"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import GistCard from "@/components/feed/GistCard";
import UserCard from "@/components/shared/UserCard";
import { InteractionsProvider } from "@/lib/interactions";
import { useAuth } from "@/lib/use-auth";
import { useLiveGists } from "@/lib/use-live-gists";
import {
  getTagCounts,
  getGistsByTag,
  searchGists,
  getTrendingGists,
  getGistSpots,
  getFeedGists,
  MOCK_SUGGESTED_USERS,
} from "@/lib/mock-data";

export default function DiscoverPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const liveGists = useLiveGists();
  const gists = liveGists ?? getFeedGists();

  const tagCounts = useMemo(() => getTagCounts(gists), [gists]);
  const spots = useMemo(() => getGistSpots(), []);

  const results = useMemo(() => {
    if (query.trim()) return searchGists(query, gists);
    if (activeTag) return getGistsByTag(activeTag, gists);
    return getTrendingGists(5, gists);
  }, [query, activeTag, gists]);

  const resultsLabel = query.trim()
    ? `Results for "${query.trim()}"`
    : activeTag
      ? `#${activeTag}`
      : "Trending";

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-5 font-display text-lg font-semibold">Discover</h1>

        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveTag(null);
          }}
          placeholder="Search gists…"
          className="mb-4 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-cyan"
        />

        {!query.trim() && (
          <div className="mb-5 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-3 py-1 font-mono-brand text-[11px] transition-colors ${
                activeTag === null
                  ? "border-cyan text-cyan"
                  : "border-border-subtle text-muted hover:text-foreground"
              }`}
            >
              Trending
            </button>
            {tagCounts.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`rounded-full border px-3 py-1 font-mono-brand text-[11px] transition-colors ${
                  activeTag === tag
                    ? "border-cyan text-cyan"
                    : "border-border-subtle text-muted hover:text-foreground"
                }`}
              >
                #{tag} <span className="text-muted">{count}</span>
              </button>
            ))}
          </div>
        )}

        {!query.trim() && (
          <section className="mb-6">
            <h2 className="mb-3 font-mono-brand text-xs uppercase tracking-widest text-muted">
              Gist Spots
            </h2>
            <div className="flex flex-col gap-2">
              {spots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/gist-spots/${spot.id}`}
                  className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-3 hover:border-muted transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-sm font-semibold">{spot.name}</p>
                      {spot.isGeoFenced && (
                        <span className="rounded bg-amber/20 px-1.5 py-0.5 font-mono-brand text-[9px] uppercase tracking-widest text-amber">
                          geo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">{spot.description}</p>
                  </div>
                  <span className="shrink-0 font-mono-brand text-[10px] text-muted">
                    {spot.memberCount.toLocaleString()} members
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!query.trim() && (
          <section className="mb-6">
            <h2 className="mb-3 font-mono-brand text-xs uppercase tracking-widest text-muted">
              Who to follow
            </h2>
            <div className="flex flex-col gap-2">
              {MOCK_SUGGESTED_USERS.map((u) => (
                <UserCard key={u.username} {...u} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 font-mono-brand text-xs uppercase tracking-widest text-muted">
            {resultsLabel}
          </h2>
          {results.length === 0 ? (
            <p className="rounded-xl border border-border-subtle bg-surface p-6 text-center text-sm text-muted">
              Nothing matches yet — try a different search or tag.
            </p>
          ) : (
            <InteractionsProvider userId={user?.uid ?? null}>
              <div className="flex flex-col gap-3">
                {results.map((gist) => (
                  <GistCard key={gist.id} gist={gist} currentUserId={user?.uid ?? null} />
                ))}
              </div>
            </InteractionsProvider>
          )}
        </section>
      </main>
    </div>
  );
}
