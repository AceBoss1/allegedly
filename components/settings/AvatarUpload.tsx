"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { buildAvatarUrl } from "@/lib/cloudinary";

export default function AvatarUpload({
  userId,
  currentAvatarUrl,
}: {
  userId: string;
  currentAvatarUrl?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(currentAvatarUrl);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setErrorMsg("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setStatus("error");
      setErrorMsg("Keep it under 8MB.");
      return;
    }

    setStatus("uploading");
    setErrorMsg("");

    // Instant local preview while the real upload happens in the background.
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const result = await uploadToCloudinary(file, {
        folder: "avatars",
        publicId: `avatar_${userId}`, // stable id: re-uploading replaces rather than accumulating
      });

      const db = getFirebaseDb();
      await setDoc(
        doc(db, "users", userId),
        {
          avatarUrl: buildAvatarUrl(result.publicId, 400) || result.secureUrl,
          avatarPublicId: result.publicId,
        },
        { merge: true }
      );

      setStatus("idle");
    } catch (err) {
      console.error("Avatar upload failed", err);
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed — try again.");
      setPreview(currentAvatarUrl);
    } finally {
      URL.revokeObjectURL(localPreview);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border-subtle bg-surface-raised">
        {preview ? (
          <Image src={preview} alt="Profile" fill sizes="64px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono-brand text-xs text-muted">
            ?
          </div>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading"}
          className="rounded-full border border-border-subtle px-4 py-1.5 font-mono-brand text-xs font-semibold hover:border-muted disabled:opacity-50"
        >
          {status === "uploading" ? "Uploading…" : "Change photo"}
        </button>
        {status === "error" && <p className="mt-1 text-xs text-danger">{errorMsg}</p>}
        <p className="mt-1 text-[11px] text-muted">
          Uploaded directly to Cloudinary — never touches our own storage.
        </p>
      </div>
    </div>
  );
}
