// Resolves the File Map's long-standing `lib/watermark.ts ⬜` placeholder.
//
// The zero-storage constraint shapes this entirely: we will never download,
// store, re-encode, or proxy someone else's media through our own
// infrastructure just to burn a watermark into it. That rules out real
// pixel-level watermarking for video (YouTube/TikTok/Drive/IG embeds) — you
// cannot transform a video you don't have the bytes of without processing
// (and therefore storing, even transiently) it somewhere.
//
// So this file implements two different strategies depending on what kind
// of external media is being reshared:
//
//   - Direct image URLs  → Cloudinary's `fetch` delivery type watermarks
//     them on the fly, cached on CLOUDINARY's cdn, never ours. This is a
//     real, pixel-burned-in watermark. See lib/cloudinary.ts.
//
//   - Video embeds (oEmbed-sourced YouTube/TikTok/Drive/IG) → there is no
//     zero-storage way to burn a watermark into video we don't host. The
//     honest tradeoff: overlay a watermark badge in the UI on top of the
//     embed/thumbnail (WatermarkedExternalMedia below). This deters casual
//     screenshot reposting but can be cropped out — it's a UI affordance,
//     not a content-security guarantee. If that gap matters enough to close
//     later, the only real fix is downloading + re-encoding + re-hosting
//     the video ourselves, which means giving up the zero-storage goal for
//     video specifically (worth revisiting if leak/reposting becomes a
//     measured problem, not before).

import { buildWatermarkedFetchUrl, isCloudinaryConfigured } from "./cloudinary";

export type ExternalMediaKind = "direct-image" | "embed";

const IMAGE_EXTENSION_RE = /\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i;

/** Best-effort guess at whether a pasted URL is a direct image (watermarkable
 * via Cloudinary fetch) vs. something that needs an oEmbed/iframe (not). */
export function classifyExternalMediaUrl(url: string): ExternalMediaKind {
  return IMAGE_EXTENSION_RE.test(url) ? "direct-image" : "embed";
}

/**
 * For a direct image URL, returns a Cloudinary-fetch watermarked version
 * carrying a pre-formatted poster label. Pass `@authorId` for a real handle,
 * `Anonymous-#XXXX` (the server-computed pseudonym — see
 * functions/src/lib/pseudonym.ts) for an anonymous post, or `undefined` only
 * when no pseudonym exists yet at all. Never pass the real handle for an
 * anonymous post — see lib/cloudinary.ts's buildWatermarkLayers() doc
 * comment for why that's load-bearing, not cosmetic.
 *
 * Falls back to the original URL (unwatermarked) if Cloudinary isn't
 * configured yet, or if it's not a direct image — callers should always be
 * prepared to render the plain URL as a fallback.
 */
export function getWatermarkedImageUrl(remoteUrl: string, posterLabel?: string): string {
  if (classifyExternalMediaUrl(remoteUrl) !== "direct-image") return remoteUrl;
  if (!isCloudinaryConfigured()) return remoteUrl;
  const watermarked = buildWatermarkedFetchUrl(remoteUrl, posterLabel);
  return watermarked || remoteUrl;
}
