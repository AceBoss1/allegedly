export default function HiddenCreatorProfile({ username }: { username: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-10 text-center">
      <p className="font-mono-brand text-xs uppercase tracking-widest text-muted mb-2">
        // creator currently anonymous
      </p>
      <h1 className="font-display text-lg font-semibold">@{username}</h1>
      <p className="mt-2 text-sm text-muted">
        This creator has chosen to post without a visible profile, or their subscription
        has lapsed. Their gists still appear in the feed, labeled Anonymous — just like any
        Standard account.
      </p>
    </div>
  );
}
