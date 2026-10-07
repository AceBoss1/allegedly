// Allegedly — core entity types
// Mirrors the Firestore schema described in Allegedly_File_Map.md.
// Keep this file as the single source of truth for shape across
// client components, API routes, and Firestore converters.

// Renamed from basic/verified_source/corporate — same three tiers, product
// naming updated to Standard/Premium/Premium+. See TIER_POST_LIMITS below
// for the character caps, and lib/site-config.ts-style single-source-of-
// truth reasoning: rename the type, not just the landing page copy, so the
// two can't drift apart again.
export type AccountTier = "standard" | "premium" | "premium_plus";

export type Visibility = "public" | "followers" | "private";

export type ConsensusVote = "true" | "false" | "needs_more_gist";

/** A user document, keyed by Firebase Auth uid. */
export interface AllegedlyUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  // Cloudinary public_id behind avatarUrl (see lib/cloudinary.ts) — kept
  // separately from the URL so we can re-run buildAvatarUrl() at a new size
  // or delete the asset later without re-parsing a Cloudinary URL.
  avatarPublicId?: string;
  // Profile banner/cover image (Cloudinary). Optional — profile renders
  // fine without one, just no banner strip.
  coverImageUrl?: string;
  coverImagePublicId?: string;
  bio?: string;
  tier: AccountTier;
  // Standard tier is permanently anonymous — enforced server-side, not just UI.
  // See Tech Debt Report §2 "Permanent anonymity lock for Standard tier".
  isAnonymousLocked: boolean;
  // Premium/Premium+ ONLY (Standard is already permanently anonymous via
  // isAnonymousLocked above, so this is meaningless for them). When true,
  // the creator has chosen to go fully anonymous the way a Standard
  // account always is — their profile page becomes inaccessible and their
  // gists render as Anonymous regardless of the per-post toggle, even
  // though they're still a paying/verified account underneath. Lets a
  // creator "go viral without being seen." Distinct from
  // hasActiveSubscription below — a creator can be non-anonymous but still
  // invisible if their subscription lapsed.
  creatorAnonymousMode?: boolean;
  // Denormalized from the `subscriptions` collection (kept in sync by
  // whatever writes/expires a Subscription — payments aren't built yet,
  // see Tech Debt Report Phase 3, so this is currently hand-set or absent
  // rather than webhook-driven). A Premium/Premium+ profile is only
  // publicly visible/linkable while this is true AND creatorAnonymousMode
  // is false — see the profile page's visibility gate.
  hasActiveSubscription?: boolean;
  // Premium/Premium+ only — external contact/social links shown as an
  // icon row on the profile (see the link-in-bio reference screenshot).
  // Fixed shape rather than an open array: simpler Settings UI (one input
  // per known platform), and the profile only ever needs to render these
  // five, not an arbitrary user-defined list.
  socialLinks?: {
    whatsapp?: string;
    telegram?: string;
    messenger?: string;
    email?: string;
    x?: string;
  };
  // Allegedly Credits — a closed-loop, non-redeemable platform balance
  // (top-up, gifting, renewals, ads, AI-token spend). Deliberately NOT
  // cash — one-way fiat-to-credits only, same regulatory shape as Discord
  // Nitro/Twitch Bits/console store credit, chosen specifically to avoid
  // the money-transmitter exposure the internal-wallet idea would have
  // carried (see Tech Debt Report §7 update). This field is a balance
  // DISPLAY only — no top-up flow exists yet (needs Phase 3 payments), so
  // it reads 0 for everyone until that's built.
  creditBalance?: number;
  verifiedAt?: number;
  followerCount: number;
  followingCount: number;
  createdAt: number;
  tosAcceptedAt?: number;
  ageConfirmedAt?: number;
  // Which access cohort a user joined under (see SITE_CONFIG.accessCohort in
  // lib/site-config.ts for the single place that controls the current
  // label). Not a permission gate by itself — just provenance/framing for
  // "you're one of our alpha testers" messaging, and a cheap way to filter
  // early users later if that's ever useful.
  cohort?: "alpha" | "beta";
  authProvider?: "google" | "password";
}

/** A single post. The core content unit of the platform. */
export interface Gist {
  id: string;
  authorId: string;
  // Never trust a denormalized authorTier for permission checks server-side —
  // it's here only so the client can render tier UI without a join.
  authorTier: AccountTier;
  isAnonymous: boolean;
  // Denormalized display-only fields, same reasoning as authorTier above:
  // never trust these for permission checks, they exist purely so a
  // GistCard can render a rich author line without joining to /users/{id}.
  // All optional — older/mock gists without them just render the plainer
  // fallback (gist.authorId doubling as the handle, no avatar/tagline).
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  authorTagline?: string; // e.g. "CEO, @Allegedly" — shown under the handle
  // Shows a second badge (distinct from the Verified Source checkmark) for
  // Allegedly's own official/staff accounts. Not a tier — a Corporate or
  // Verified Source account can be authorIsOfficial without being staff.
  authorIsOfficial?: boolean;
  // Stable pseudonym CODE (e.g. "4F2C", not "Anonymous-#4F2C") shown instead
  // of a bare "Anonymous" for anonymous gists — lets readers notice the
  // same anonymous source posting multiple times (a real credibility signal
  // for the Truth Meter) without ever exposing the real handle. Storing
  // just the code and formatting it consistently at each call site (see
  // GistCard's AuthorLine and the embedUrl watermark call) avoids the two
  // formats drifting apart. See Tech Debt Report's "Anonymous identity"
  // decision for the full reasoning, including why this is a UI-facing
  // guarantee, not a claim of cryptographic unlinkability. Real generation
  // is a deterministic per-user hash, computed server-side — mock data
  // below just hardcodes an example code.
  anonymousPseudonym?: string;
  text: string;
  // The auto "Allegedly," prefix is rendered, never stored as part of `text`,
  // except for GIST-AD posts which never receive the prefix at all.
  //
  // Gist-Ad is a per-post LABEL a Premium+ account can toggle on, not
  // something implied by tier the way it used to be — a Premium+ account
  // can post completely normal organic gists too. When true, `gistAdType`
  // says which of the four ad products this is.
  isGistAd: boolean;
  gistAdType?: "sponsored" | "spotlight" | "co_branded" | "brand_mention";
  // Only meaningful for "co_branded"/"brand_mention" — the organic gist
  // this ad is attached to/mentions, so ad revenue share can flow to that
  // gist's author rather than (or in addition to) the platform. Revenue
  // share itself isn't wired up yet (needs Phase 3 payments) — this is
  // just the reference the future payout logic will read.
  coBrandedWithGistId?: string;
  // Separate from isGistAd entirely: ANY tier can pay to Boost a gist
  // (trending placement — see the `boosts` collection), and while a boost
  // is active the post shows a "Sponsored" label distinct from the Gist-Ad
  // ones above. Denormalized here the same way authorTier is, so GistCard
  // can render the label without joining to `boosts` — kept in sync by
  // whatever writes/expires a Boost, not hand-edited otherwise.
  isBoosted?: boolean;
  visibility: Visibility;
  // Hashtags, max HASHTAG_LIMIT (5) — enforced in PostComposer's UI, not
  // (yet) server-side; same "needs a real check before launch" caveat as
  // the character limits above.
  tags: string[];
  location?: string;
  mediaUrls: string[];
  // Cloudinary public_id per mediaUrls entry, when the media was uploaded
  // through our own Composer (as opposed to a manually-inserted URL via the
  // Firestore console, which won't have this). Lets GistCard re-run
  // buildWatermarkedUploadUrl() at render time instead of storing a static
  // pre-watermarked file — same "transform on delivery, don't bake it in"
  // approach as everything else Cloudinary-related here. Optional and
  // parallel-indexed to mediaUrls; a missing/shorter array just means no
  // watermark gets applied for that item, not an error.
  mediaPublicIds?: string[];
  // Defaults to "image" when mediaUrls is non-empty and this is unset —
  // only needs setting explicitly for video.
  mediaType?: "image" | "video";
  embedUrl?: string; // oEmbed-sourced (YouTube/TikTok/Drive/IG paste-a-link flow)
  gistSpotId?: string;

  // Truth Meter (Phase 2) — present here so the type is stable once that
  // phase lands; safe to leave undefined until then.
  plausibilityScore?: number; // 0-100, LLM-generated
  consensusTrue: number;
  consensusFalse: number;
  consensusNeedsMore: number;
  contextShieldUntil?: number; // epoch ms; hides Truth Meter until this time

  // Retraction / correction trail (Phase 4 trust & safety)
  isRetracted: boolean;
  retractedAt?: number;
  retractionNote?: string;
  editHistory: { text: string; editedAt: number }[];

  // Denormalized counts for fast rendering — kept in sync via
  // Cloud Function triggers on write to likes/saves/regists/comments.
  likeCount: number;
  saveCount: number;
  registCount: number; // "Re-Allegedly" count
  commentCount: number;
  viewCount: number;

  createdAt: number;
  updatedAt: number;
}

export interface Comment {
  id: string;
  gistId: string;
  authorId: string;
  text: string;
  createdAt: number;
}

export interface Like {
  id: string; // `${userId}_${gistId}` — doubles as an idempotency key
  userId: string;
  gistId: string;
  createdAt: number;
}

export interface Save {
  id: string; // `${userId}_${gistId}`
  userId: string;
  gistId: string;
  createdAt: number;
}

/** "Re-Allegedly" — a reshare that carries a new narrative-layer comment. */
export interface Regist {
  id: string;
  userId: string;
  gistId: string;
  commentary?: string;
  createdAt: number;
}

export interface Highlight {
  id: string; // `${userId}_${gistId}`
  userId: string;
  gistId: string;
  createdAt: number;
}

export interface Follow {
  id: string; // `${followerId}_${followeeId}`
  followerId: string;
  followeeId: string;
  createdAt: number;
}

/**
 * Source of truth for Truth Meter consensus votes — one immutable doc per
 * user per gist. `Gist.consensusTrue/False/NeedsMore` are counters kept in
 * sync from this collection, and `UserInteractions.votedGistIds` below is a
 * denormalized read-mirror of it (so "did I already vote, and what did I
 * pick?" is a Set/Map lookup, not a query). If `votes` and
 * `userInteractions` ever disagree, `votes` wins — `userInteractions` gets
 * rebuilt from it, never the other way around.
 */
export interface Vote {
  id: string; // `${userId}_${gistId}` — one vote per user, immutable once cast
  userId: string;
  gistId: string;
  value: ConsensusVote;
  createdAt: number;
}

export interface GistSpot {
  id: string;
  name: string;
  description: string;
  isGeoFenced: boolean;
  geo?: { lat: number; lng: number; radiusKm: number };
  memberCount: number;
  createdAt: number;
}

/** User → Gist Spot membership (the "Join" button). Same keying pattern as
 * every other join-table here — mirrors `Follow` but for spots instead of
 * users. `GistSpot.memberCount` is a denormalized counter kept in sync from
 * this collection the same way `Gist.likeCount` is kept in sync from `Like`. */
export interface GistSpotMembership {
  id: string; // `${userId}_${spotId}`
  userId: string;
  spotId: string;
  createdAt: number;
}

export interface Report {
  id: string;
  gistId?: string;
  commentId?: string; // set when reporting a comment rather than its parent gist
  userId?: string; // reported user, if reporting a profile rather than a post
  reporterId: string;
  reason: string;
  status: "open" | "reviewing" | "actioned" | "dismissed";
  createdAt: number;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: "premium" | "premium_plus";
  provider: "stripe" | "paystack";
  providerCustomerId: string;
  status: "active" | "past_due" | "canceled";
  currentPeriodEnd: number;
  createdAt: number;
}

export interface Boost {
  id: string;
  gistId: string;
  userId: string;
  provider: "stripe" | "paystack";
  amountCents: number;
  currency: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * Denormalized per-user interaction doc — this is the fix for the N+1
 * status-check problem called out in Tech Debt Report §1.2: instead of
 * firing separate Like/Save/Regist/Highlight filter() queries per card
 * on every render, the feed reads one doc per signed-in user containing
 * every gistId they've interacted with, sliced by type.
 *
 * Doc id === userId. Written by Cloud Function triggers whenever a
 * Like/Save/Regist/Highlight doc is created or deleted, so it's always
 * a mirror of the source-of-truth collections above, never hand-edited.
 */
export interface UserInteractions {
  userId: string;
  likedGistIds: string[];
  savedGistIds: string[];
  registedGistIds: string[];
  highlightedGistIds: string[];
  votedGistIds: Record<string, ConsensusVote>;
  updatedAt: number;
}

/** Tier-based post length limits, enforced client-side (UX) and
 * server-side (integrity) per Tech Debt Report §2. Character-only, not
 * word count — word limits turned out to be a useless constraint (easy to
 * game with run-on words, doesn't actually control post length the way
 * that matters for feed density) and were dropped in favor of a single
 * char cap. This count applies to `Gist.text` ONLY — the "Allegedly,"
 * prefix isn't part of `text` at all (GistCard renders it separately) and
 * hashtags live in the separate `tags` array, so neither counts against
 * the limit. See `HASHTAG_LIMIT` below for the hashtag cap. */
export const TIER_POST_LIMITS: Record<AccountTier, { chars: number }> = {
  standard: { chars: 180 },
  premium: { chars: 360 },
  premium_plus: { chars: 720 },
};

/** Max hashtags per post, all tiers — see PostComposer.tsx's tag input. */
export const HASHTAG_LIMIT = 5;

/**
 * A single 24h ephemeral "story" (see the "Your Story / Friend 1..." bar in
 * the app's earliest screenshots — this is that feature's data model).
 * Media is uploaded straight to Cloudinary from the browser (see
 * lib/cloudinary-upload.tsx), never through our own storage.
 *
 * `expiresAt` is set at creation (`createdAt + 24h`) and is what
 * functions/src/story-cleanup.ts's scheduled Cloud Function scans for — it
 * deletes both this Firestore doc AND the underlying Cloudinary asset
 * (via `cloudinaryPublicId`), so expired stories don't quietly accumulate
 * storage cost on Cloudinary's side either. Nothing about this collection
 * assumes stories are viewable past `expiresAt`; enforce that in security
 * rules once this ships (`allow read: if resource.data.expiresAt > now`).
 */
export interface Story {
  id: string;
  authorId: string;
  mediaUrl: string; // Cloudinary secure_url
  cloudinaryPublicId: string; // used by the cleanup function to delete the asset
  mediaType: "image" | "video";
  createdAt: number;
  expiresAt: number; // createdAt + 24h, enforced both client-side and in security rules
  viewerIds: string[]; // denormalized; fine at story-bar scale, revisit if this gets large
}
