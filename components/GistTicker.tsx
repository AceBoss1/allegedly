type Gist = {
  type: "gist";
  text: string;
  score: number;
  votes: number;
  tag: string;
};

type ReAllegedly = {
  type: "reallegedly";
  original: string;
  text: string;
  score: number;
  votes: number;
  tag: string;
};

type Entry = Gist | ReAllegedly;

const ENTRIES: Entry[] = [
  {
    type: "gist",
    text: "the new hire in accounting got the job through a family connection.",
    score: 68,
    votes: 142,
    tag: "workplace",
  },
  {
    type: "reallegedly",
    original: "a major streaming platform is quietly testing a price hike next quarter.",
    text: "and it's already live for a small % of accounts — mine went up $2 this week.",
    score: 74,
    votes: 96,
    tag: "tech",
  },
  {
    type: "gist",
    text: "two well-known creators are collaborating on a surprise project.",
    score: 77,
    votes: 310,
    tag: "entertainment",
  },
  {
    type: "gist",
    text: "that downtown restaurant everyone loves is closing at the end of the month.",
    score: 61,
    votes: 47,
    tag: "local",
  },
  {
    type: "reallegedly",
    original: "this year's biggest album leak came from an intern's laptop.",
    text: "it wasn't the intern — I know the studio, it was an unlocked review portal.",
    score: 52,
    votes: 138,
    tag: "music",
  },
  {
    type: "gist",
    text: "a fintech startup is quietly raising a new round at 3x last year's valuation.",
    score: 71,
    votes: 63,
    tag: "startups",
  },
];

function scoreColor(score: number) {
  if (score >= 65) return "text-lime";
  if (score >= 45) return "text-amber";
  return "text-danger";
}

function ScoreBadge({ score, votes }: { score: number; votes: number }) {
  return (
    <div className="shrink-0 text-right">
      <div className={`font-display text-sm font-bold ${scoreColor(score)}`}>{score}%</div>
      <div className="font-mono-brand text-[10px] text-muted">{votes} votes</div>
    </div>
  );
}

function GistRow({ entry }: { entry: Gist }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface px-4 py-3">
      <span className="mt-0.5 shrink-0 font-mono-brand text-[10px] uppercase tracking-widest text-muted">
        #{entry.tag}
      </span>
      <p className="flex-1 text-sm leading-snug text-foreground/90">
        <span className="font-semibold text-cyan">Allegedly, </span>
        {entry.text}
      </p>
      <ScoreBadge score={entry.score} votes={entry.votes} />
    </div>
  );
}

function ReAllegedlyRow({ entry }: { entry: ReAllegedly }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-lime/30 bg-surface px-4 py-3">
      <span className="mt-0.5 shrink-0 font-mono-brand text-[10px] uppercase tracking-widest text-lime">
        ↻ #{entry.tag}
      </span>
      <div className="flex-1">
        <p className="font-mono-brand text-[11px] italic leading-snug text-muted">
          <span className="not-italic font-semibold text-cyan">Allegedly, </span>
          {entry.original}
        </p>
        <p className="mt-1 text-sm leading-snug text-foreground/90">
          <span className="font-semibold text-lime">Re-Allegedly: </span>
          {entry.text}
        </p>
      </div>
      <ScoreBadge score={entry.score} votes={entry.votes} />
    </div>
  );
}

function EntryRow({ entry }: { entry: Entry }) {
  return entry.type === "gist" ? <GistRow entry={entry} /> : <ReAllegedlyRow entry={entry} />;
}

export default function GistTicker() {
  // Render the list twice back-to-back so the CSS animation can loop seamlessly.
  return (
    <div className="relative h-[420px] overflow-hidden rounded-2xl border border-border-subtle bg-surface/60 p-3">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-background to-transparent" />
      <div className="animate-ticker flex flex-col gap-3">
        {[...ENTRIES, ...ENTRIES].map((entry, i) => (
          <EntryRow key={i} entry={entry} />
        ))}
      </div>
    </div>
  );
}
