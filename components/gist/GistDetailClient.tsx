"use client";

import { useAuth } from "@/lib/use-auth";
import GistCard from "@/components/feed/GistCard";
import ReAllegedlyThread from "@/components/feed/ReAllegedlyThread";
import { InteractionsProvider } from "@/lib/interactions";
import type { Gist } from "@/types/entities";

/**
 * The permalink page (app/gist/[gistId]/page.tsx) is a Server Component so
 * generateMetadata() can produce real server-rendered OG tags for outside
 * shares — link-preview crawlers on other platforms don't execute client
 * JS, so this can't be client-fetched the way Feed/Discover are. This
 * wrapper is the small client boundary that still needs auth state for
 * likes/saves/regists to work on the detail page.
 */
export default function GistDetailClient({ gist }: { gist: Gist }) {
  const { user } = useAuth();

  return (
    <InteractionsProvider userId={user?.uid ?? null}>
      <GistCard gist={gist} currentUserId={user?.uid ?? null} />
      <div className="mt-2">
        <ReAllegedlyThread gistId={gist.id} />
      </div>
    </InteractionsProvider>
  );
}
