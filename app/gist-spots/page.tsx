import Link from "next/link";
import Nav from "@/components/Nav";
import { getGistSpots } from "@/lib/mock-data";

export default function GistSpotsPage() {
  const spots = getGistSpots();

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-1 font-display text-lg font-semibold">Gist Spots</h1>
        <p className="mb-5 text-sm text-muted">
          Topic and location-based communities — join the ones you want in your feed.
        </p>

        <div className="flex flex-col gap-3">
          {spots.map((spot) => (
            <Link
              key={spot.id}
              href={`/gist-spots/${spot.id}`}
              className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-4 hover:border-muted transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-base font-semibold">{spot.name}</p>
                  {spot.isGeoFenced && (
                    <span className="rounded bg-amber/20 px-1.5 py-0.5 font-mono-brand text-[9px] uppercase tracking-widest text-amber">
                      geo-fenced
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{spot.description}</p>
              </div>
              <span className="shrink-0 font-mono-brand text-xs text-muted">
                {spot.memberCount.toLocaleString()} members
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
