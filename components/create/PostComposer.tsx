"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useAuth } from "@/lib/use-auth";
import { useUserProfile } from "@/lib/use-user-profile";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { TIER_POST_LIMITS, HASHTAG_LIMIT, type AccountTier, type Gist } from "@/types/entities";

type GistAdType = NonNullable<Gist["gistAdType"]>;

const GIST_AD_OPTIONS: { value: GistAdType; label: string; description: string; needsRelatedGist: boolean }[] = [
  {
    value: "sponsored",
    label: "Sponsored gist",
    description: "A dedicated native post promoting your brand, product, or campaign for maximum organic reach.",
    needsRelatedGist: false,
  },
  {
    value: "spotlight",
    label: "Allegedly Spotlight",
    description: "Got a guide, report, tool, or event worth sharing? We'll put it in front of feed, discover, and gist spots.",
    needsRelatedGist: false,
  },
  {
    value: "co_branded",
    label: "Co-branded gist",
    description: "Collaborative posts alongside a trending gist on topics your audience already cares about. Original gist owner gets ad share.",
    needsRelatedGist: true,
  },
  {
    value: "brand_mention",
    label: "Brand mention",
    description: "Your brand woven naturally into an original post — editorial feel, no banner-ad energy. Original gist owner gets ad share.",
    needsRelatedGist: true,
  },
];

function parseHashtagInput(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[\s,]+/)
        .map((t) => t.replace(/^#/, "").trim())
        .filter(Boolean)
    )
  ).slice(0, HASHTAG_LIMIT);
}

/**
 * NOTE on enforcement: this component enforces the character limit and the
 * HASHTAG_LIMIT client-side for UX (instant feedback, disabled submit
 * button). The same limits are re-checked server-side in firestore.rules
 * (tierCharLimit / tags.size() <= 5), which must be hand-kept in sync with
 * TIER_POST_LIMITS / HASHTAG_LIMIT in types/entities.ts.
 */
export default function PostComposer({
  // Fallback only for signed-out/dev preview — once signed in, the real
  // tier comes from the user's Firestore profile doc (see effectiveTier
  // below), not this prop. Fixes a real gap: app/create/page.tsx never
  // passed this prop at all, so every real post was created as "standard"
  // regardless of the signed-in user's actual tier.
  tier: tierProp = "standard",
}: {
  tier?: AccountTier;
}) {
  const router = useRouter();
  const { user, unconfigured } = useAuth();
  const profile = useUserProfile(user?.uid ?? null);
  const tier: AccountTier = profile?.tier ?? tierProp;

  // A Premium/Premium+ creator can be forced anonymous even with the
  // per-post toggle off: either they've turned on creatorAnonymousMode
  // themselves (Settings → Creator visibility), or their subscription
  // isn't active. "Once they pay they can be seen" — undefined counts as
  // not-active the same as an explicit false. Standard tier is unaffected;
  // it's already permanently anonymous regardless of any of this.
  const subscriptionInactive = !profile?.hasActiveSubscription;
  const forcedAnonymous =
    tier !== "standard" && (Boolean(profile?.creatorAnonymousMode) || subscriptionInactive);

  const [text, setText] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(tier === "standard"); // locked on for Standard
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaResult, setMediaResult] = useState<{ url: string; publicId: string } | null>(null);

  // Gist-Ad — Premium+ only, a per-post toggle rather than tier-implied.
  const [isGistAd, setIsGistAd] = useState(false);
  const [gistAdType, setGistAdType] = useState<GistAdType>("sponsored");
  const [coBrandedWithGistId, setCoBrandedWithGistId] = useState("");

  // Gist-Boost "Sponsored" label — any tier, unrelated to Gist-Ad. This
  // just sets the flag directly for now; the real flow is a paid Boost
  // purchase (Stripe/Paystack, unbuilt — see Known Tech Gaps) that would
  // set isBoosted server-side on payment success, not a free client toggle.
  const [isBoosted, setIsBoosted] = useState(false);

  const limit = TIER_POST_LIMITS[tier];
  const chars = text.length; // character-only — see TIER_POST_LIMITS's doc comment for why word count was dropped
  const overChars = chars > limit.chars;
  const hashtags = useMemo(() => parseHashtagInput(hashtagInput), [hashtagInput]);
  const selectedAdOption = GIST_AD_OPTIONS.find((o) => o.value === gistAdType)!;
  const canSubmit =
    chars > 0 &&
    !overChars &&
    !submitting &&
    !mediaUploading &&
    (!isGistAd || !selectedAdOption.needsRelatedGist || coBrandedWithGistId.trim().length > 0);

  const handleFile = async (file: File) => {
    // Images only for now, same temporary bandwidth/cost control as
    // Stories (see StoryBar.tsx) — "till we get larger media hosting," not
    // a permanent limitation. Video attach + paste-a-link (MediaUrlPaste)
    // are both still unbuilt — see File Map's Known Tech Gaps.
    if (!file.type.startsWith("image/")) {
      setError("Images only for now — video attach is on hold until we have larger media hosting.");
      return;
    }
    if (!user) return;

    setError(null);
    setMediaUploading(true);
    const localPreview = URL.createObjectURL(file);
    setMediaPreview(localPreview);

    try {
      const result = await uploadToCloudinary(file, { folder: "gists" });
      setMediaResult({ url: result.secureUrl, publicId: result.publicId });
    } catch (err) {
      console.error("Gist media upload failed", err);
      setError(err instanceof Error ? err.message : "Image upload failed — try again.");
      setMediaPreview(null);
    } finally {
      setMediaUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  const removeMedia = () => {
    setMediaPreview(null);
    setMediaResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);

    if (unconfigured || !user) {
      setError(
        "Posting needs a signed-in user and a configured Firebase project. " +
          "This is a Phase 0 scaffold — wire up Auth to enable real posting."
      );
      return;
    }

    setSubmitting(true);
    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, "gists"), {
        authorId: user.uid,
        authorTier: tier,
        isAnonymous: tier === "standard" ? true : forcedAnonymous || isAnonymous,
        text,
        isGistAd: tier === "premium_plus" ? isGistAd : false,
        ...(tier === "premium_plus" && isGistAd
          ? {
              gistAdType,
              ...(selectedAdOption.needsRelatedGist
                ? { coBrandedWithGistId: coBrandedWithGistId.trim() }
                : {}),
            }
          : {}),
        isBoosted,
        visibility: "public",
        tags: hashtags,
        mediaUrls: mediaResult ? [mediaResult.url] : [],
        mediaPublicIds: mediaResult ? [mediaResult.publicId] : [],
        // Spread, not `mediaType: undefined` — getFirestore() rejects undefined
        // field values, which would fail every text-only post.
        ...(mediaResult ? { mediaType: "image" } : {}),
        consensusTrue: 0,
        consensusFalse: 0,
        consensusNeedsMore: 0,
        isRetracted: false,
        editHistory: [],
        likeCount: 0,
        saveCount: 0,
        registCount: 0,
        commentCount: 0,
        viewCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push("/feed");
    } catch (err) {
      console.error("Failed to create gist", err);
      setError(
        (err as { code?: string })?.code === "permission-denied"
          ? `Post rejected — check it is within ${limit.chars} characters and ${HASHTAG_LIMIT} hashtags for your tier.`
          : "Something went wrong posting your gist. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="font-semibold text-cyan">Allegedly,</span>
        <span className="font-mono-brand text-[10px] uppercase tracking-widest text-muted">
          {tier.replace("_", "+ ").replace(/^./, (c) => c.toUpperCase())} · {limit.chars} chars max
        </span>
      </div>

      {forcedAnonymous && (
        <p className="mb-3 rounded-lg border border-amber/30 bg-amber/10 px-3 py-2 font-mono-brand text-[11px] text-amber">
          {profile?.creatorAnonymousMode
            ? "Creator anonymous mode is on — this post will be Anonymous regardless of the toggle below."
            : "No active subscription — this post will be Anonymous until your subscription is active. See Settings → Creator visibility."}
        </p>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="what's the gist?"
        rows={4}
        className="w-full resize-none rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-cyan"
      />

      <div className="mt-2 flex items-center justify-end font-mono-brand text-[11px]">
        <span className={overChars ? "text-danger" : "text-muted"}>{chars}/{limit.chars} chars</span>
      </div>

      <div className="mt-3">
        <input
          type="text"
          value={hashtagInput}
          onChange={(e) => setHashtagInput(e.target.value)}
          placeholder="#hashtags (space or comma separated, up to 5)"
          className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-cyan"
        />
        {hashtags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {hashtags.map((tag) => (
              <span key={tag} className="font-mono-brand text-[10px] text-cyan">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {mediaPreview ? (
        <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-lg border border-border-subtle">
          <Image src={mediaPreview} alt="" fill className="object-cover" unoptimized />
          {mediaUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 font-mono-brand text-xs text-foreground">
              Uploading…
            </div>
          )}
          <button
            onClick={removeMedia}
            className="absolute right-2 top-2 rounded-full bg-background/80 px-2 py-1 font-mono-brand text-[10px] text-foreground hover:bg-background"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!user}
          className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-border-subtle px-3 py-2 font-mono-brand text-xs text-muted hover:border-muted disabled:opacity-50"
        >
          📷 Add a photo
        </button>
      )}

      {tier === "premium_plus" && (
        <div className="mt-4 rounded-lg border border-amber/30 bg-amber/5 p-3">
          <label className="flex items-center gap-2 font-mono-brand text-xs text-amber">
            <input
              type="checkbox"
              checked={isGistAd}
              onChange={(e) => setIsGistAd(e.target.checked)}
              className="accent-amber"
            />
            🏷️ Label this as a Gist-Ad
          </label>

          {isGistAd && (
            <div className="mt-3 space-y-2">
              {GIST_AD_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`block cursor-pointer rounded-lg border px-3 py-2 text-xs ${
                    gistAdType === opt.value ? "border-amber bg-amber/10" : "border-border-subtle"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gistAdType"
                      checked={gistAdType === opt.value}
                      onChange={() => setGistAdType(opt.value)}
                      className="accent-amber"
                    />
                    <span className="font-display font-semibold text-foreground">{opt.label}</span>
                  </div>
                  <p className="mt-1 pl-5 text-muted">{opt.description}</p>
                </label>
              ))}

              {selectedAdOption.needsRelatedGist && (
                <input
                  type="text"
                  value={coBrandedWithGistId}
                  onChange={(e) => setCoBrandedWithGistId(e.target.value)}
                  placeholder="Gist ID or link to credit for ad-revenue share"
                  className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-amber"
                />
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 font-mono-brand text-xs text-muted">
          <input
            type="checkbox"
            checked={tier === "standard" || forcedAnonymous ? true : isAnonymous}
            disabled={tier === "standard" || forcedAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="accent-cyan"
          />
          {tier === "standard"
            ? "Anonymous (locked for Standard accounts)"
            : forcedAnonymous
              ? "Anonymous (forced — see note above)"
              : "Post anonymously"}
        </label>

        <label className="flex items-center gap-2 font-mono-brand text-xs text-lime" title="Gist-Boost — sponsored trending placement, any tier">
          <input
            type="checkbox"
            checked={isBoosted}
            onChange={(e) => setIsBoosted(e.target.checked)}
            className="accent-lime"
          />
          🚀 Boost (Sponsored)
        </label>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-full bg-gradient-to-r from-cyan to-lime px-5 py-2 font-mono-brand text-xs font-semibold text-background hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {submitting ? "Posting…" : "Post Gist"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 font-mono-brand text-[11px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
