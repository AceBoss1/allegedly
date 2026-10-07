import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import GistCard from "@/components/feed/GistCard";
import JoinButton from "@/components/gist-spots/JoinButton";
import { InteractionsProvider } from "@/lib/interactions";
import { getGistSpotById, getGistsBySpot } from "@/lib/mock-data";

export default async function GistSpotPage({
  params,
}: {
  params: Promise<{ spotId: string }>;
}) {
  const { spotId } = await params;
  const spot = getGistSpotById(spotId);
  if (!spot) notFound();

  const gists = getGistsBySpot(spotId);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 rounded-xl border border-border-subtle bg-surface p-5">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-semibold">{spot.name}</h1>
            {spot.isGeoFenced && (
              <span className="rounded bg-amber/20 px-1.5 py-0.5 font-mono-brand text-[9px] uppercase tracking-widest text-amber">
                geo-fenced
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">{spot.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono-brand text-xs text-muted">
              {spot.memberCount.toLocaleString()} members
            </span>
            <JoinButton spotId={spot.id} />
          </div>
        </div>

        {gists.length === 0 ? (
          <p className="rounded-xl border border-border-subtle bg-surface p-6 text-center text-sm text-muted">
            No gists here yet — be the first to post in {spot.name}.
          </p>
        ) : (
          <InteractionsProvider userId={null}>
            <div className="flex flex-col gap-3">
              {gists.map((gist) => (
                <GistCard key={gist.id} gist={gist} currentUserId={null} />
              ))}
            </div>
          </InteractionsProvider>
        )}
      </main>
    </div>
  );
}
