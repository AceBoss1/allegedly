import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { CLOUDINARY_CONFIG } from "@/lib/cloudinary";

// This route hands out a short-lived signature so the browser can upload
// directly to Cloudinary — the file's bytes go browser → Cloudinary only,
// never through our server or any storage we pay for or are liable for.
// CLOUDINARY_API_SECRET stays server-side; only the signature leaves this
// function, per Cloudinary's documented signing algorithm (sort all
// non-file params alphabetically, join as key=value&..., append the secret,
// SHA-1 hash the result).

export async function POST(req: NextRequest) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = CLOUDINARY_CONFIG.cloudName;

  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json(
      { error: "Cloudinary isn't configured yet — see Deployment Guide, Cloudinary section" },
      { status: 501 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const folder: string =
    body.folder === "stories"
      ? CLOUDINARY_CONFIG.storyUploadFolder
      : body.folder === "gists"
        ? CLOUDINARY_CONFIG.gistMediaUploadFolder
        : CLOUDINARY_CONFIG.avatarUploadFolder;

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = { folder, timestamp };

  // Stories get a public_id we control so the cleanup Cloud Function
  // (functions/src/story-cleanup.ts) can destroy the exact asset by id
  // without having to look it up first.
  if (body.publicId) {
    paramsToSign.public_id = body.publicId;
  }

  const toSign = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");

  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
    publicId: body.publicId ?? undefined,
  });
}
