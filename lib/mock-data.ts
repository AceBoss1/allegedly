// Local seed data for Feed/Profile pages during Phase 0, before a real
// Firestore project has any documents in it. Swap-out point: once
// getFeedGists()/getProfileGists() below are pointed at real Firestore
// queries, delete this file and its imports.

import type { Gist, GistSpot, Story, Regist } from "@/types/entities";

const now = Date.now();
const hoursAgo = (h: number) => now - h * 60 * 60 * 1000;

export const MOCK_GISTS: Gist[] = [
  {
    id: "gist_demo_1",
    authorId: "AceBoss-NG",
    authorTier: "premium",
    isAnonymous: false,
    authorDisplayName: "Emmanuel Adams",
    authorAvatarUrl:
      "https://res.cloudinary.com/djj49cetb/image/upload/v1784378805/ibi/members/hmr1ohtqy5gywpgcswdw.png",
    authorTagline: "CEO, @Allegedly",
    authorIsOfficial: true,
    text:
      "this Irish priest told this story of a bird that froze in the air and fell to the ground, a cow passed by and dropped her shit on the bird, the warm dung unfroze the bird, though still stuck in the dung, yet felt alive so it began whistling.\n\nA cat heard that and went to investigate, the cat dug the bird out of the dung and ate it.\n\nReply with 3 valuable lessons learnt from the video and win a life-time verified badge, Terms & Conditions apply.",
    isGistAd: false,
    visibility: "public",
    tags: ["storytime", "giveaway"],
    mediaUrls: [
      "https://res.cloudinary.com/djj49cetb/video/upload/v1784741397/video_2026-07-22_18-09-06_law8mv.mp4",
    ],
    mediaType: "video",
    consensusTrue: 0,
    consensusFalse: 0,
    consensusNeedsMore: 0,
    isRetracted: false,
    editHistory: [],
    likeCount: 412,
    saveCount: 28,
    registCount: 9,
    commentCount: 63,
    viewCount: 5104,
    createdAt: now - 2 * 60 * 1000,
    updatedAt: now - 2 * 60 * 1000,
  },
  {
    id: "gist_demo_2",
    authorId: "mock_anon_1",
    authorTier: "standard",
    isAnonymous: true,
    anonymousPseudonym: "4F2C",
    text:
      "this young doctor is the world's first Cardio-Nephrologist, a heart & kidney specialist and he is a Nigerian.",
    isGistAd: false,
    visibility: "public",
    tags: ["medical", "nigeria"],
    mediaUrls: [],
    embedUrl:
      "https://res.cloudinary.com/djj49cetb/image/upload/v1784741404/photo_2026-07-22_18-27-43_bez1ma.jpg",
    plausibilityScore: 58,
    consensusTrue: 34,
    consensusFalse: 8,
    consensusNeedsMore: 12,
    isRetracted: false,
    editHistory: [],
    likeCount: 187,
    saveCount: 15,
    registCount: 6,
    commentCount: 22,
    viewCount: 2310,
    createdAt: now - 5 * 60 * 1000,
    updatedAt: now - 5 * 60 * 1000,
  },
  {
    id: "gist_1",
    authorId: "marcus_a",
    authorTier: "premium",
    isAnonymous: false,
    text: "the new hire in accounting got the job through a family connection.",
    isGistAd: false,
    visibility: "public",
    tags: ["workplace"],
    gistSpotId: "spot_workplace",
    mediaUrls: [],
    plausibilityScore: 68,
    consensusTrue: 91,
    consensusFalse: 32,
    consensusNeedsMore: 19,
    isRetracted: false,
    editHistory: [],
    likeCount: 214,
    saveCount: 12,
    registCount: 18,
    commentCount: 34,
    viewCount: 3021,
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
  },
  {
    id: "gist_2",
    authorId: "anon",
    authorTier: "standard",
    isAnonymous: true,
    text: "a major streaming platform is quietly testing a price hike next quarter.",
    isGistAd: false,
    visibility: "public",
    tags: ["tech"],
    mediaUrls: [],
    plausibilityScore: 54,
    consensusTrue: 40,
    consensusFalse: 35,
    consensusNeedsMore: 14,
    isRetracted: false,
    editHistory: [],
    likeCount: 89,
    saveCount: 4,
    registCount: 6,
    commentCount: 11,
    viewCount: 1204,
    createdAt: hoursAgo(7),
    updatedAt: hoursAgo(7),
  },
  {
    id: "gist_3",
    authorId: "streamwire",
    authorTier: "premium_plus",
    isAnonymous: false,
    text: "Our new creator fund opens applications this Friday — early sign-ups get priority review.",
    isGistAd: true,
    visibility: "public",
    tags: ["announcement"],
    mediaUrls: [],
    consensusTrue: 0,
    consensusFalse: 0,
    consensusNeedsMore: 0,
    isRetracted: false,
    editHistory: [],
    likeCount: 12,
    saveCount: 1,
    registCount: 0,
    commentCount: 2,
    viewCount: 480,
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
  },
  {
    id: "gist_4",
    authorId: "downtown_dana",
    authorTier: "standard",
    isAnonymous: true,
    text: "that downtown restaurant everyone loves is closing at the end of the month.",
    isGistAd: false,
    visibility: "public",
    tags: ["local"],
    gistSpotId: "spot_local_downtown",
    mediaUrls: [],
    plausibilityScore: 61,
    consensusTrue: 22,
    consensusFalse: 9,
    consensusNeedsMore: 16,
    isRetracted: true,
    retractedAt: hoursAgo(0.5),
    retractionNote: "owner confirmed it's a renovation, not a closure",
    editHistory: [{ text: "original claim text", editedAt: hoursAgo(0.5) }],
    likeCount: 47,
    saveCount: 3,
    registCount: 2,
    commentCount: 19,
    viewCount: 902,
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(0.5),
  },
];

export function getFeedGists(): Gist[] {
  return MOCK_GISTS;
}

export function getGistsByAuthor(authorId: string): Gist[] {
  return MOCK_GISTS.filter((g) => g.authorId === authorId && !g.isAnonymous);
}

export function getGistById(id: string): Gist | undefined {
  return MOCK_GISTS.find((g) => g.id === id);
}

/** All tags present across current gists, with counts — powers Discover's
 * tag rail. Swap for a Firestore aggregation query (or a maintained
 * `tagCounts` doc) once real data volume makes a full scan too slow. */
export function getTagCounts(gists: Gist[] = MOCK_GISTS): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const gist of gists) {
    for (const tag of gist.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getGistsByTag(tag: string, gists: Gist[] = MOCK_GISTS): Gist[] {
  return gists.filter((g) => g.tags.includes(tag));
}

/** Substring search over gist text — Discover's search box. Works against
 * whatever array is passed in (live Firestore data or the mock fallback).
 * Fine as a client-side filter at seed-data/early-alpha scale; real search
 * should move to a hosted search index (Algolia/Typesense) once there's
 * enough volume that filtering everything client-side stops being
 * reasonable — Firestore itself has no full-text query support. */
export function searchGists(query: string, gists: Gist[] = MOCK_GISTS): Gist[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return gists.filter(
    (g) => g.text.toLowerCase().includes(q) || g.tags.some((t) => t.toLowerCase().includes(q))
  );
}

/** "Trending" for the seed scaffold = highest view count. Replace with a
 * real trending algorithm (Phase 5, "Algorithmic Trending Allegedly feed"
 * per Tech Debt Report §2) once there's enough data to rank meaningfully. */
export function getTrendingGists(limit = 5, gists: Gist[] = MOCK_GISTS): Gist[] {
  return [...gists].sort((a, b) => b.viewCount - a.viewCount).slice(0, limit);
}

export const MOCK_GIST_SPOTS: GistSpot[] = [
  {
    id: "spot_workplace",
    name: "Workplace Gists",
    description: "Office politics, quiet firings, and who really got the promotion.",
    isGeoFenced: false,
    memberCount: 4210,
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
  },
  {
    id: "spot_tech",
    name: "Tech & Startups",
    description: "Funding rounds, leaked roadmaps, and layoffs before they're official.",
    isGeoFenced: false,
    memberCount: 8890,
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
  },
  {
    id: "spot_entertainment",
    name: "Entertainment",
    description: "Collabs, breakups, and casting news before the press release.",
    isGeoFenced: false,
    memberCount: 15230,
    createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
  },
  {
    id: "spot_local_downtown",
    name: "Downtown Local",
    description: "Geo-fenced — what's actually happening a few blocks from you.",
    isGeoFenced: true,
    geo: { lat: 6.5244, lng: 3.3792, radiusKm: 5 },
    memberCount: 612,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
];

export function getGistSpots(): GistSpot[] {
  return MOCK_GIST_SPOTS;
}

export function getGistSpotById(id: string): GistSpot | undefined {
  return MOCK_GIST_SPOTS.find((s) => s.id === id);
}

export function getGistsBySpot(spotId: string): Gist[] {
  return MOCK_GISTS.filter((g) => g.gistSpotId === spotId);
}

export const MOCK_SUGGESTED_USERS = [
  { username: "marcus_a", tier: "premium" as const, followerCount: 12400, bio: "workplace whistleblower, allegedly" },
  { username: "streamwire", tier: "premium_plus" as const, followerCount: 89210, bio: "official corporate account" },
  { username: "downtown_dana", tier: "standard" as const, followerCount: 340, bio: "local gossip, mostly true" },
];

// Swap-out point: once functions/src/story-cleanup.ts is deployed and
// Firestore actually has a `stories` collection, replace this with a query
// `where("expiresAt", ">", Date.now())` ordered by author, and delete these
// two exports.
export const MOCK_STORIES: Story[] = [
  {
    id: "story_1",
    authorId: "marcus_a",
    mediaUrl: "",
    cloudinaryPublicId: "",
    mediaType: "image",
    createdAt: hoursAgo(2),
    expiresAt: now + 22 * 60 * 60 * 1000,
    viewerIds: [],
  },
  {
    id: "story_2",
    authorId: "downtown_dana",
    mediaUrl: "",
    cloudinaryPublicId: "",
    mediaType: "image",
    createdAt: hoursAgo(5),
    expiresAt: now + 19 * 60 * 60 * 1000,
    viewerIds: [],
  },
];

export function getActiveStoriesByAuthor(): Record<string, Story[]> {
  const active = MOCK_STORIES.filter((s) => s.expiresAt > Date.now());
  return active.reduce<Record<string, Story[]>>((acc, story) => {
    (acc[story.authorId] ??= []).push(story);
    return acc;
  }, {});
}

// Swap-out point: once Regist writes are real, replace with a Firestore
// query `where("gistId", "==", gistId)` ordered by createdAt. regist.userId
// doubles as the displayed handle — same documented shortcut as
// gist.authorId elsewhere in this file, not a new inconsistency.
export const MOCK_REGISTS: Regist[] = [
  {
    id: "regist_1",
    userId: "chidinma_reads",
    gistId: "gist_demo_1",
    commentary:
      "Lesson 1: don't judge who saved you. Lesson 2: gratitude can still get you eaten. Lesson 3: read the room before you start singing 😂",
    createdAt: now - 60 * 1000,
  },
  {
    id: "regist_2",
    userId: "tunde.oyelaran",
    gistId: "gist_demo_1",
    commentary: "the real lesson is: know when to stay quiet even after a miracle.",
    createdAt: now - 45 * 1000,
  },
  {
    id: "regist_3",
    userId: "health_naija",
    gistId: "gist_demo_2",
    commentary: "Verified — Dr. Badero's dual board certification is real, confirmed via ABIM records.",
    createdAt: now - 3 * 60 * 1000,
  },
  {
    id: "regist_4",
    userId: "skeptical_sam",
    gistId: "gist_demo_2",
    commentary: "impressive if true, but \"world's first\" claims like this need a primary source, not just a flyer.",
    createdAt: now - 2 * 60 * 1000,
  },
];

export function getRegistsForGist(gistId: string): Regist[] {
  return MOCK_REGISTS.filter((r) => r.gistId === gistId);
}
