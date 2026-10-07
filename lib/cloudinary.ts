// Cloudinary is used for exactly two things in this app, both deliberately
// chosen to keep OUR storage footprint at zero:
//
// 1. Profile images & Story media — uploaded directly from the browser to
//    Cloudinary (signed upload, see app/api/cloudinary/sign/route.ts). The
//    file's bytes never pass through our server or Firebase Storage at all.
//
// 2. Watermarking externally-sourced images (someone pastes a direct image
//    URL rather than uploading a file) — via Cloudinary's `fetch` delivery
//    type. Cloudinary fetches the remote URL on request, applies our
//    watermark overlay transformation, and caches the result on ITS cdn.
//    We never download, store, or process the original ourselves — see
//    lib/watermark.ts for why this doesn't extend to video embeds.
//
// NOTE: I can't actually hit Cloudinary's API from this environment to
// render and check the transformation URLs below — network access here is
// restricted to a small allowlist that doesn't include Cloudinary. The
// transformation syntax follows Cloudinary's documented layer/overlay
// reference exactly, but the exact sizing/offset numbers (w_0.55, y_-70,
// y_70 etc.) are my best estimate matching the sample image, not something
// I've visually confirmed. Check it against a real pasted image URL once
// this is deployed and tell me what to nudge if the logo/username spacing
// looks off.

const CLOUD_NAME = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "djj49cetb").trim();

/**
 * Cloudinary's `l_` overlay parameter wants a BARE public_id — no protocol,
 * no domain, no `/image/upload/` prefix, no version segment, and no file
 * extension. But the value someone has closest at hand — literally what
 * Cloudinary's own UI shows you after an upload — is the full delivery URL
 * (e.g. "https://res.cloudinary.com/djj49cetb/image/upload/v1784666130/
 * allegedly_watermark_fbal4l.png"), which is NOT valid input for `l_`
 * directly. Feeding a full URL (or even just "id.png") into `l_` corrupts
 * the whole transformation string rather than failing loudly, which is
 * exactly what happened twice in a row here.
 *
 * Rather than relying on the env var being formatted exactly right, this
 * normalizes whatever's provided — full URL, bare-id-with-extension, or
 * already-bare-id — down to just the public_id, so the env var can hold
 * any of those forms and it'll work.
 */
function normalizeToPublicId(value: string): string {
  let v = value.trim();

  // Full/partial URL → keep only the path after "/upload/", optionally
  // dropping a leading version segment ("v1784666130/").
  const uploadMatch = v.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  if (uploadMatch) {
    v = uploadMatch[1];
  }

  // Strip a trailing image file extension, if present — Cloudinary's
  // delivery URLs append one, but it's not part of the actual public_id
  // unless the asset was deliberately uploaded with a literal dot in its id
  // (rare, and not the case here).
  v = v.replace(/\.(png|jpe?g|gif|webp|avif|bmp|tiff?)$/i, "");

  return v;
}

// The real watermark asset, uploaded to Cloudinary at:
// https://res.cloudinary.com/djj49cetb/image/upload/v1784666130/allegedly_watermark_fbal4l.png
// normalizeToPublicId() above means this constant (and the env var override)
// can be set to that full URL, "allegedly_watermark_fbal4l.png", or the bare
// "allegedly_watermark_fbal4l" — all three resolve to the same correct value.
const WATERMARK_OVERLAY_PUBLIC_ID = normalizeToPublicId(
  process.env.NEXT_PUBLIC_CLOUDINARY_WATERMARK_PUBLIC_ID || "allegedly_watermark_fbal4l"
);

// Folder for profile-photo uploads specifically (see AvatarUpload.tsx /
// app/api/cloudinary/sign/route.ts). Named to match what's already live on
// the Cloudinary account rather than the app inventing its own "allegedly/
// avatars" path.
const AVATAR_UPLOAD_FOLDER = "allegedly_uploads";
const STORY_UPLOAD_FOLDER = "allegedly/stories";
const GIST_MEDIA_UPLOAD_FOLDER = "allegedly/gists";

// Tilt and opacity, named so both are one edit instead of hunting through
// transformation strings. "60% transparent" = 40% opaque = o_40 here.
const WATERMARK_ANGLE_DEG = -10;
const WATERMARK_OPACITY = 40;

export const CLOUDINARY_CONFIG = {
  cloudName: CLOUD_NAME,
  avatarUploadFolder: AVATAR_UPLOAD_FOLDER,
  storyUploadFolder: STORY_UPLOAD_FOLDER,
  gistMediaUploadFolder: GIST_MEDIA_UPLOAD_FOLDER,
  watermarkOverlayPublicId: WATERMARK_OVERLAY_PUBLIC_ID,
};

function isConfigured() {
  return Boolean(CLOUD_NAME);
}

/**
 * Build a delivery URL for a profile image that was uploaded straight to
 * Cloudinary (see components/settings/AvatarUpload.tsx). Applies a
 * square-crop-on-face + auto-format/quality transformation so we never ship
 * an oversized original to a 40px avatar slot.
 */
export function buildAvatarUrl(publicId: string, size: number = 200): string {
  if (!isConfigured()) return "";
  const t = `c_thumb,g_face,w_${size},h_${size},q_auto,f_auto,r_max`;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${t}/${publicId}`;
}

/**
 * The two watermark overlay layers (logo mark + optional text label), as
 * Cloudinary transformation path components. Shared by every watermark
 * builder below so the tilt/opacity/positioning only lives in one place.
 *
 * `posterLabel` is deliberately a pre-formatted STRING, not a raw username —
 * callers decide what identity to reveal before calling this:
 *   - Non-anonymous gist → the real `@authorId`.
 *   - Anonymous gist → `Anonymous-#{anonymousPseudonym}`, the deterministic
 *     per-user hash from functions/src/lib/pseudonym.ts (server-computed at
 *     gist creation — see functions/src/anonymous-pseudonym.ts), NEVER the
 *     real handle. A Standard-tier gist is permanently anonymous
 *     (types/entities.ts `isAnonymousLocked`); baking the real poster's
 *     handle into a "leak-traceable" watermark would directly defeat that
 *     guarantee, which is why the pseudonym exists at all — it gives the
 *     watermark something stable and traceable-to-the-same-source to show
 *     without exposing who that source is. See GistCard's two call sites
 *     for exactly how that string gets built.
 *
 * Earlier versions of this app had no pseudonym generator at all, so every
 * real anonymous post silently got NO text layer (posterLabel omitted
 * outright) even though the intent was always to show the pseudonym —
 * that's now fixed upstream in the pseudonym-generation Cloud Function, not
 * here; this function just renders whatever label it's given.
 */
function buildWatermarkLayers(posterLabel?: string): string[] {
  const layers: string[] = [];

  // Logo mark, centered, tilted, faint — scales with the base image
  // (w_0.55,fl_relative) rather than a fixed pixel width so it looks
  // consistent across differently-sized source images.
  layers.push(
    `l_${WATERMARK_OVERLAY_PUBLIC_ID},g_center,y_-70,a_${WATERMARK_ANGLE_DEG},o_${WATERMARK_OPACITY},w_0.55,fl_relative/fl_layer_apply`
  );

  if (posterLabel) {
    // No "@" prepended here — this used to hardcode one, which produced
    // "@Anonymous-#4F2C" (a stray "@" glued onto an already-formatted
    // anonymous label) once callers started passing the pseudonym string
    // instead of a bare username. Callers now pass the exact display string
    // they want rendered — GistCard formats "@authorId" for a real handle
    // and "Anonymous-#XXXX" for a pseudonym — so this only URL-encodes it.
    const text = encodeURIComponent(posterLabel);
    layers.push(
      `l_text:Arial_48_bold:${text},co_white,g_center,y_70,a_${WATERMARK_ANGLE_DEG},o_${WATERMARK_OPACITY}/fl_layer_apply`
    );
  }

  return layers;
}

/**
 * Zero-storage watermarking for a pasted external image URL. Cloudinary's
 * `fetch` delivery type pulls the remote image on demand — we're not
 * uploading or storing anything, just asking Cloudinary's CDN to proxy +
 * transform it. The remote URL must be publicly reachable (no auth-gated
 * images) and is passed straight through, so keep it URL-encoded.
 *
 * `posterLabel` should already be the exact display string to render —
 * `@username` for a real handle, `Anonymous-#XXXX` for a pseudonym, never
 * the raw un-prefixed username or the real handle for an anonymous post —
 * see buildWatermarkLayers() above for why that's not optional-in-name-only.
 *
 * Returns "" (caller should fall back to the plain remote URL, unwatermarked)
 * if Cloudinary isn't configured yet — watermarking is a nice-to-have, not a
 * hard requirement for the image to render.
 */
export function buildWatermarkedFetchUrl(remoteImageUrl: string, posterLabel?: string): string {
  if (!isConfigured()) return "";
  const base = "q_auto,f_auto";
  const layers = buildWatermarkLayers(posterLabel);
  const encoded = encodeURIComponent(remoteImageUrl);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${base}/${layers.join("/")}/${encoded}`;
}

/**
 * Same watermark, applied to media WE already host on Cloudinary (native
 * gist-photo uploads) rather than a remote fetch. Not wired up to anything
 * yet — Gist doesn't currently store a Cloudinary public_id for uploaded
 * media (only the delivery URL), so there's nothing to call this with. Left
 * here ready for when that field exists, rather than duplicating the layer
 * logic again at that point.
 */
export function buildWatermarkedUploadUrl(publicId: string, posterLabel?: string): string {
  if (!isConfigured()) return "";
  const base = "q_auto,f_auto";
  const layers = buildWatermarkLayers(posterLabel);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${base}/${layers.join("/")}/${publicId}`;
}

export function isCloudinaryConfigured(): boolean {
  return isConfigured();
}
