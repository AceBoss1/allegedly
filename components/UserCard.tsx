import Link from "next/link";
import type { AccountTier } from "@/types/entities";

function tierBadge(tier: AccountTier) {
  if (tier === "basic") return null;
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-cyan shrink-0">
      <path d="M10 0l2.245 1.635 2.775-.402 1.19 2.522 2.522 1.19-.402 2.775L20 10l-1.635 2.245.402 2.775-2.522 1.19-1.19 2.522-2.775-.402L10 20l-2.245-1.635-2.775.402-1.19-2.522-2.522-1.19.402-2.775L0 10l1.635-2.245-.402-2.775 2.522-1.19 1.19-2.522 2.775.402L10 0z" />
      <path d="M8.5 13.5L5 10l1.06-1.06L8.5 11.38l5.44-5.44L15 7l-6.5 6.5z" fill="var(--background)" />
    </svg>
  );
}

export default function UserCard({
  username,
  tier,
  followerCount,
  bio,
}: {
  username: string;
  tier: AccountTier;
  followerCount: number;
  bio?: string;
}) {
  return (
    <Link
      href={`/profile/${username}`}
      className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3 hover:border-muted transition-colors"
    >
      <div className="h-10 w-10 shrink-0 rounded-full bg-surface-raised border border-border-subtle" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-display text-sm font-semibold">{username}</p>
          {tierBadge(tier)}
        </div>
        {bio && <p className="truncate text-xs text-muted">{bio}</p>}
        <p className="font-mono-brand text-[10px] text-muted">{followerCount} followers</p>
      </div>
    </Link>
  );
}
