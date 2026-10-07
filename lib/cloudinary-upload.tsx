"use client";

// Shared upload path for anything going straight to Cloudinary from the
// browser: get a signature from our server (which never sees the file),
// then POST the file directly to Cloudinary's own upload endpoint.

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  resourceType: "image" | "video";
};

export async function uploadToCloudinary(
  file: File,
  opts: { folder: "avatars" | "stories" | "gists"; publicId?: string }
): Promise<CloudinaryUploadResult> {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: opts.folder, publicId: opts.publicId }),
  });

  if (!signRes.ok) {
    const { error } = await signRes.json().catch(() => ({ error: "Signing failed" }));
    throw new Error(error || "Could not get an upload signature");
  }

  const { signature, timestamp, apiKey, cloudName, folder, publicId } = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);
  if (publicId) formData.append("public_id", publicId);

  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) {
    throw new Error("Upload to Cloudinary failed");
  }

  const data = await uploadRes.json();
  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    resourceType,
  };
}
