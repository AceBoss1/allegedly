"use client";

import { useRef, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { useAuth } from "@/lib/use-auth";
import { useLiveStories } from "@/lib/use-live-stories";
import { getActiveStoriesByAuthor } from "@/lib/mock-data";
import type { Story } from "@/types/entities";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function StoryRing({ label, hasStory }: { label: string; hasStory: boolean }) {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1">
      <div
        className={`h-14 w-14 rounded-full p-[2px] ${
          hasStory ? "bg-gradient-to-br from-cyan to-lime" : "bg-border-subtle"
        }`}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-surface font-mono-brand text-[10px] text-muted">
          {label.slice(0, 2).toUpperCase()}
        </div>
      </div>
      <span className="max-w-full truncate font-mono-brand text-[10px] text-muted">{label}</span>
    </div>
  );
}

function groupByAuthor(stories: Story[]): Record<string, Story[]> {
  return stories.reduce<Record<string, Story[]>>((acc, story) => {
    (acc[story.authorId] ??= []).push(story);
    return acc;
  }, {});
}

export default function StoryBar() {
  const { user } = useAuth();
  const liveStories = useLiveStories();
  const isLive = liveStories !== null;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const storiesByAuthor = isLive ? groupByAuthor(liveStories) : getActiveStoriesByAuthor();
  const authorsWithStories = Object.keys(storiesByAuthor);

  // Images-only + one story per user per 24h, "till we get larger media
  // hosting" — a deliberate, temporary cost/bandwidth control, not a
  // permanent product decision. Revisit both limits once that changes.
  const myActiveStory = user ? storiesByAuthor[user.uid]?.[0] : undefined;

  const handleAddStory = async (file: File) => {
    if (!user) return;

    if (myActiveStory) {
      setError("You can only post one status per 24 hours right now.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Images only for now — video status support is on hold until we have larger media hosting.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const publicId = `story_${user.uid}_${Date.now()}`;
      const result = await uploadToCloudinary(file, { folder: "stories", publicId });

      const db = getFirebaseDb();
      const createdAt = Date.now();
      await setDoc(doc(db, "stories", publicId), {
        authorId: user.uid,
        mediaUrl: result.secureUrl,
        cloudinaryPublicId: result.publicId,
        mediaType: "image",
        createdAt,
        expiresAt: createdAt + TWENTY_FOUR_HOURS_MS,
        viewerIds: [],
      });
      // Deletion of both this Firestore doc and the Cloudinary asset once
      // expiresAt passes is functions/src/story-cleanup.ts's job, not this
      // component's — see that file for why it has to run server-side.
    } catch (err) {
      console.error("Story upload failed", err);
      setError(err instanceof Error ? err.message : "Upload failed — try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleAddStory(file);
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={!user || uploading || Boolean(myActiveStory)}
        className="flex w-16 shrink-0 flex-col items-center gap-1 disabled:opacity-50"
        title={
          !user
            ? "Sign in to post a story"
            : myActiveStory
              ? "One status per 24 hours for now"
              : undefined
        }
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border-subtle bg-surface font-display text-lg text-muted">
          {uploading ? "…" : "+"}
        </div>
        <span className="font-mono-brand text-[10px] text-muted">Your Story</span>
      </button>

      {authorsWithStories.map((authorId) => (
        <StoryRing key={authorId} label={authorId} hasStory />
      ))}

      {error && <p className="self-center text-xs text-danger">{error}</p>}
    </div>
  );
}
