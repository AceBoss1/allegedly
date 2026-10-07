import Image from "next/image";
import { classifyExternalMediaUrl, getWatermarkedImageUrl } from "@/lib/watermark";

/**
 * Renders a pasted external URL (the blueprint's "paste URL — YouTube,
 * TikTok, Drive, Instagram" media sourcing flow), watermarked where that's
 * actually possible. See lib/watermark.ts for why direct images and video
 * embeds get genuinely different treatment here rather than one fake-uniform
 * "watermark" that doesn't really apply to both.
 *
 * `posterUsername` — omit for anonymous posts. This is the display-layer
 * half of the anonymity rule documented in lib/cloudinary.ts's
 * buildWatermarkLayers(): a Basic-tier gist is permanently anonymous, so
 * neither the burned-in Cloudinary watermark nor this UI badge should ever
 * name the poster on one of those.
 */
export default function WatermarkedExternalMedia({
  url,
  embedHtml,
  alt = "",
  posterUsername,
}: {
  url: string;
  /** oEmbed-provided embed HTML for video sources (YouTube/TikTok/etc). */
  embedHtml?: string;
  alt?: string;
  posterUsername?: string;
}) {
  const kind = classifyExternalMediaUrl(url);

  if (kind === "direct-image") {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface-raised">
        <Image
          src={getWatermarkedImageUrl(url, posterUsername)}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          className="object-cover"
          unoptimized // already a fully-formed Cloudinary/remote URL
        />
      </div>
    );
  }

  // Video/embed path: no real burned-in watermark is possible without
  // storing the video ourselves (see lib/watermark.ts), so this is a UI
  // overlay only — a deterrent, not a guarantee.
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface-raised">
      {embedHtml ? (
        <div
          className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full"
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-full w-full items-center justify-center text-sm text-cyan underline"
        >
          View source
        </a>
      )}
      <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-background/70 px-2 py-1 font-mono-brand text-[10px] uppercase tracking-widest text-foreground/80 backdrop-blur-sm">
        via Allegedly{posterUsername ? ` · @${posterUsername}` : ""}
      </span>
    </div>
  );
}
