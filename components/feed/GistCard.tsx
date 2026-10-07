"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Gist } from "@/types/entities";
import {
  toggleInteraction,
  useInteractions,
  type InteractionKind,
} from "@/lib/interactions";
import { useNow } from "@/lib/use-now";
import { buildWatermarkedUploadUrl } from "@/lib/cloudinary";
import { SITE_CONFIG } from "@/lib/site-config";
import WatermarkedExternalMedia from "@/components/shared/WatermarkedExternalMedia";

const VIDEO_EXTENSION_RE = /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i;

// Short badge text for each of the four Gist-Ad products a Premium+
// account can toggle on — see types/entities.ts's isGistAd/gistAdType
// comment for the full product descriptions (Sponsored gist / Allegedly
// Spotlight / Co-branded gist / Brand mention).
const GIST_AD_LABELS: Record<NonNullable<Gist["gistAdType"]>, string> = {
  sponsored: "Sponsored Gist",
  spotlight: "Allegedly Spotlight",
  co_branded: "Co-Branded",
  brand_mention: "Brand Mention",
};

/**
 * Don't just trust gist.mediaType — someone hand-inserting a media URL
 * directly in the Firestore console (a real thing that's happened, since
 * PostComposer's own image upload didn't exist until this was added) can
 * easily set mediaUrls without also remembering to set mediaType, and a
 * .mp4 URL rendered through next/image's <Image> just shows a broken
 * image icon instead of failing loudly. Falling back to sniffing the URL's
 * extension when mediaType is missing makes that mistake harmless instead
 * of silently broken.
 */
function resolveMediaKind(gist: Gist): "image" | "video" {
  if (gist.mediaType) return gist.mediaType;
  return VIDEO_EXTENSION_RE.test(gist.mediaUrls[0] ?? "") ? "video" : "image";
}

function scoreColor(score: number) {
  if (score >= 65) return "text-lime";
  if (score >= 45) return "text-amber";
  return "text-danger";
}

function timeAgo(ms: number, now: number) {
  const diff = now - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

/** Every organic (non-GIST-AD) post is auto-prefixed "Allegedly, " — this is
 * rendered here, never persisted as part of gist.text, per the File Map /
 * Tech Debt Report Phase 1 spec. GIST-AD posts never receive the prefix. */
function GistText({ gist }: { gist: Gist }) {
  if (gist.isGistAd) {
    return <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{gist.text}</p>;
  }
  return (
    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
      <span className="font-semibold text-cyan">Allegedly, </span>
      {gist.text}
    </p>
  );
}

function OfficialBadge() {
  // Distinct from the Verified Source checkmark below — this is the
  // brand's own eye mark, used for Allegedly's official/staff accounts.
  return (
    <span
      className="group relative inline-flex"
      title="Official Allegedly account"
    >
      <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden="true">
        <path
          d="M1 6c2.5-4 6-6 11-6s8.5 2 11 6c-2.5 4-6 6-11 6S3.5 10 1 6z"
          fill="none"
          stroke="var(--lime)"
          strokeWidth="1.4"
        />
        <circle cx="12" cy="6" r="2.6" fill="var(--cyan)" />
      </svg>
    </span>
  );
}

function AuthorLine({ gist }: { gist: Gist }) {
  const now = useNow();

  if (gist.isAnonymous) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-surface-raised border border-border-subtle flex items-center justify-center font-mono-brand text-xs text-muted">
          ?
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-muted">
            {gist.anonymousPseudonym ? `Anonymous #${gist.anonymousPseudonym}` : "Anonymous"}
          </p>
          <p className="font-mono-brand text-[10px] text-muted">{timeAgo(gist.createdAt, now)} ago</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-raised border border-border-subtle">
        {gist.authorAvatarUrl && (
          <Image src={gist.authorAvatarUrl} alt="" fill sizes="32px" className="object-cover" unoptimized />
        )}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <p className="font-display text-sm font-semibold">{gist.authorDisplayName || gist.authorId}</p>
          {gist.authorTier !== "standard" && (
            <span
              className="group relative inline-flex"
              title="Identity verified — this does not verify the content of this post"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-cyan">
                <path d="M10 0l2.245 1.635 2.775-.402 1.19 2.522 2.522 1.19-.402 2.775L20 10l-1.635 2.245.402 2.775-2.522 1.19-1.19 2.522-2.775-.402L10 20l-2.245-1.635-2.775.402-1.19-2.522-2.522-1.19.402-2.775L0 10l1.635-2.245-.402-2.775 2.522-1.19 1.19-2.522 2.775.402L10 0z" />
                <path d="M8.5 13.5L5 10l1.06-1.06L8.5 11.38l5.44-5.44L15 7l-6.5 6.5z" fill="var(--background)" />
              </svg>
            </span>
          )}
          {gist.authorIsOfficial && <OfficialBadge />}
          {gist.isGistAd && (
            <span className="rounded bg-amber/20 px-1.5 py-0.5 font-mono-brand text-[9px] uppercase tracking-widest text-amber">
              {GIST_AD_LABELS[gist.gistAdType ?? "sponsored"]}
            </span>
          )}
          {/* Distinct from the Gist-Ad labels above: any tier can pay to
              Boost a post, and while active it shows this separate
              "Sponsored" tag — see types/entities.ts's isBoosted comment
              for why it's a different concept from Gist-Ad. */}
          {gist.isBoosted && !gist.isGistAd && (
            <span className="rounded bg-lime/20 px-1.5 py-0.5 font-mono-brand text-[9px] uppercase tracking-widest text-lime">
              Sponsored
            </span>
          )}
        </div>
        <p className="font-mono-brand text-[10px] text-muted">
          @{gist.authorId}
          {gist.authorTagline ? ` · ${gist.authorTagline}` : ""} · {timeAgo(gist.createdAt, now)} ago
        </p>
      </div>
    </div>
  );
}

function TruthMeterBadge({ gist }: { gist: Gist }) {
  const now = useNow();
  const hidden = gist.contextShieldUntil && gist.contextShieldUntil > now;
  if (hidden) {
    return (
      <div className="shrink-0 text-right">
        <div className="font-display text-sm font-bold text-muted">🛡</div>
        <div className="font-mono-brand text-[10px] text-muted">shielded</div>
      </div>
    );
  }
  if (gist.plausibilityScore === undefined) {
    return null; // Truth Meter not yet computed — Phase 2 backend not wired here
  }
  return (
    <div className="shrink-0 text-right">
      <div className={`font-display text-sm font-bold ${scoreColor(gist.plausibilityScore)}`}>
        {gist.plausibilityScore}%
      </div>
      <div className="font-mono-brand text-[10px] text-muted">
        {gist.consensusTrue + gist.consensusFalse + gist.consensusNeedsMore} votes
      </div>
    </div>
  );
}

interface ActionButtonProps {
  kind: InteractionKind;
  active: boolean;
  count: number;
  label: string;
  icon: React.ReactNode;
  onToggle: () => void;
  disabled: boolean;
}

// Outline-style SVG icons at 20px — replaces the old emoji/monospace-symbol
// row, which read as noticeably smaller and cruder than the reference apps
// (Feedcover, X). stroke="currentColor" so active/hover color changes (the
// cyan/lime/amber states already used elsewhere) apply the same way a
// filled emoji glyph never could.
const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg {...ICON_PROPS} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20.5s-7.5-4.6-10-9.3C.5 8 1.8 4.5 5 3.5c2-.6 4 .2 5 2 1-1.8 3-2.6 5-2 3.2 1 4.5 4.5 3 7.7-2.5 4.7-10 9.3-10 9.3z" />
    </svg>
  );
}

function RepostIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M7 7h10a2 2 0 0 1 2 2v4" />
      <path d="m9 4-2 3 2 3" />
      <path d="M17 17H7a2 2 0 0 1-2-2V11" />
      <path d="m15 20 2-3-2-3" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1-4.6A8 8 0 1 1 21 12z" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg {...ICON_PROPS} fill={filled ? "currentColor" : "none"}>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.8-4.6 6.6-.9L12 2.5z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="9" width="18" height="4" />
      <path d="M12 9v12" />
      <path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6" />
      <path d="M12 9c-1.5 0-4-1-4-3.2A2.3 2.3 0 0 1 10.3 3C12 3 12 6 12 9z" />
      <path d="M12 9c1.5 0 4-1 4-3.2A2.3 2.3 0 0 0 13.7 3C12 3 12 6 12 9z" />
    </svg>
  );
}

function ShareIcon({ done }: { done: boolean }) {
  return done ? (
    <svg {...ICON_PROPS}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ) : (
    <svg {...ICON_PROPS}>
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="m8 8 4-4 4 4" />
      <path d="M12 4v13" />
    </svg>
  );
}

function ShareButton({ gistId }: { gistId: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Plain Firestore doc ID, not a content-derived slug — deliberately.
    // A slug needs its own uniqueness handling and goes stale the moment a
    // Premium+ author edits the post (retraction trail already means text
    // can legitimately change after publish) or the gist is retracted. The
    // ID is stable for the gist's entire lifetime and costs nothing extra.
    const url = `${SITE_CONFIG.url}/gist/${gistId}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // User cancelled the native share sheet — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy link failed", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-1.5 transition-colors ${
        copied ? "text-lime" : "text-muted hover:text-foreground"
      }`}
      title="Share this gist"
      aria-label="Share"
    >
      <ShareIcon done={copied} />
    </button>
  );
}

function GiftButton({ authorDisplayName, authorId }: { authorDisplayName?: string; authorId: string }) {
  const name = authorDisplayName || authorId;
  return (
    <button
      onClick={() =>
        alert(`Gifting Allegedly Credits to @${name} isn't live yet — Phase 3, see Tech Debt Report §7.1.`)
      }
      className="flex items-center gap-1.5 text-muted hover:text-lime transition-colors"
      title={`Gift @${name}`}
      aria-label="Gift"
    >
      <GiftIcon />
    </button>
  );
}

function ActionButton({ active, count, label, icon, onToggle, disabled }: ActionButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      className={`flex items-center gap-1.5 transition-colors disabled:opacity-40 ${
        active ? "text-cyan" : "text-muted hover:text-foreground"
      }`}
    >
      {icon}
      <span className="font-mono-brand text-xs">{count > 0 ? count : ""}</span>
    </button>
  );
}

export default function GistCard({
  gist,
  currentUserId,
}: {
  gist: Gist;
  currentUserId: string | null;
}) {
  // Shared across every card on screen — one Firestore listener total,
  // opened by <InteractionsProvider> in the feed page. Each card's lookup
  // below is an O(1) Set.has(), replacing the old per-card filter() queries.
  const interactions = useInteractions();
  const [optimistic, setOptimistic] = useState<Partial<Record<InteractionKind, boolean>>>({});
  const [pending, setPending] = useState<Partial<Record<InteractionKind, boolean>>>({});

  const activeFor = (kind: InteractionKind) => {
    if (kind in optimistic) return optimistic[kind]!;
    switch (kind) {
      case "like":
        return interactions.liked.has(gist.id);
      case "save":
        return interactions.saved.has(gist.id);
      case "regist":
        return interactions.registed.has(gist.id);
      case "highlight":
        return interactions.highlighted.has(gist.id);
    }
  };

  const handleToggle = async (kind: InteractionKind) => {
    if (!currentUserId || pending[kind]) return;
    const wasActive = activeFor(kind);
    setOptimistic((prev) => ({ ...prev, [kind]: !wasActive }));
    setPending((prev) => ({ ...prev, [kind]: true }));
    try {
      await toggleInteraction(kind, currentUserId, gist.id, wasActive);
    } catch (err) {
      console.error(`Failed to toggle ${kind}`, err);
      setOptimistic((prev) => ({ ...prev, [kind]: wasActive })); // revert
    } finally {
      setPending((prev) => ({ ...prev, [kind]: false }));
    }
  };

  return (
    <article className="rounded-xl border border-border-subtle bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <AuthorLine gist={gist} />
        <TruthMeterBadge gist={gist} />
      </div>

      <div className="mt-3">
        <GistText gist={gist} />
      </div>

      {gist.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {gist.tags.map((tag) => (
            <Link
              key={tag}
              href={`/discover?tag=${encodeURIComponent(tag)}`}
              className="font-mono-brand text-[10px] uppercase tracking-widest text-muted hover:text-cyan transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {gist.mediaUrls.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-lg border border-border-subtle">
          <div className="relative aspect-video w-full bg-surface-raised">
            {resolveMediaKind(gist) === "video" ? (
              // Native video upload — rendered as-is, no watermark applied.
              // Unlike native images (see the branch below), video would
              // need a re-encode to burn in a watermark, which is a bigger
              // step than "run a Cloudinary URL transformation" — see Tech
              // Debt Report's "native uploads don't have per-user
              // watermarking yet" note for images vs. video specifically.
              <video
                src={gist.mediaUrls[0]}
                controls
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={
                  gist.mediaPublicIds?.[0]
                    ? buildWatermarkedUploadUrl(
                        gist.mediaPublicIds[0],
                        gist.isAnonymous
                          ? gist.anonymousPseudonym
                            ? `Anonymous-#${gist.anonymousPseudonym}`
                            : undefined
                          : `@${gist.authorId}`
                      ) || gist.mediaUrls[0]
                    : gist.mediaUrls[0]
                }
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-cover"
                unoptimized
              />
            )}
          </div>
        </div>
      )}

      {/* Paste-a-link media sourcing (YouTube/TikTok/Drive/IG) — zero-storage
          watermarking strategy lives in lib/watermark.ts / this component.
          Anonymous gists pass the pseudonym, NEVER the real authorId — see
          lib/cloudinary.ts's buildWatermarkLayers() doc comment for why a
          bare "no username" used to be the rule here and isn't anymore. */}
      {gist.embedUrl && gist.mediaUrls.length === 0 && (
        <div className="mt-3 overflow-hidden rounded-lg border border-border-subtle">
          <WatermarkedExternalMedia
            url={gist.embedUrl}
            posterUsername={
              gist.isAnonymous
                ? gist.anonymousPseudonym
                  ? `Anonymous-#${gist.anonymousPseudonym}`
                  : undefined
                : `@${gist.authorId}`
            }
          />
        </div>
      )}

      {gist.isRetracted && (
        <div className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 font-mono-brand text-[11px] text-danger">
          ⚠ retracted{gist.retractionNote ? ` — ${gist.retractionNote}` : ""}
        </div>
      )}

      {gist.plausibilityScore !== undefined && !gist.isRetracted && (
        <p className="mt-2 text-[11px] leading-snug text-muted">
          This score comes from community votes and AI research, both of which can be wrong
          based on the information available to them — it is not a statement of fact by
          Allegedly.
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3">
        <ActionButton
          kind="like"
          active={activeFor("like")}
          count={gist.likeCount}
          label="Like"
          icon={<HeartIcon filled={activeFor("like")} />}
          onToggle={() => handleToggle("like")}
          disabled={!currentUserId}
        />
        <ActionButton
          kind="regist"
          active={activeFor("regist")}
          count={gist.registCount}
          label="Regist"
          icon={<RepostIcon />}
          onToggle={() => handleToggle("regist")}
          disabled={!currentUserId}
        />
        <Link
          href={`/gist/${gist.id}`}
          className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
          aria-label="Comments"
        >
          <CommentIcon />
          <span className="font-mono-brand text-xs">{gist.commentCount > 0 ? gist.commentCount : ""}</span>
        </Link>
        <span className="flex items-center gap-1.5 text-muted" title="Views">
          <EyeIcon />
          <span className="font-mono-brand text-xs">{gist.viewCount}</span>
        </span>
        <ActionButton
          kind="save"
          active={activeFor("save")}
          count={0}
          label="Favorite"
          icon={<StarIcon filled={activeFor("save")} />}
          onToggle={() => handleToggle("save")}
          disabled={!currentUserId}
        />
        {!gist.isAnonymous && gist.authorTier !== "standard" && (
          <GiftButton authorId={gist.authorId} authorDisplayName={gist.authorDisplayName} />
        )}
        <ShareButton gistId={gist.id} />
      </div>
    </article>
  );
}
