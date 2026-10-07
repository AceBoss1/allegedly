// Deploy-ready as of Session 20 — see Allegedly_Deployment_Guide.md §4 for
// the exact `firebase deploy --only functions` command. Until that's run
// against the real project, expired story docs and their Cloudinary assets
// just sit there — harmless, but worth deploying this before Stories
// actually ships to real users, or storage creeps up in exactly the way the
// "zero storage" design was trying to avoid.
//
// What it does, every hour:
//   1. Query `stories` where expiresAt <= now.
//   2. For each: delete the Cloudinary asset via cloudinaryPublicId, then
//      delete the Firestore doc. Cloudinary delete happens first so a crash
//      between the two steps leaves an orphaned Cloudinary asset (cheap to
//      find and clean up later) rather than a Firestore doc pointing at
//      nothing.

import { onSchedule } from "firebase-functions/v2/scheduler";
import { v2 as cloudinary } from "cloudinary";
import { db } from "./lib/admin";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cleanupExpiredStories = onSchedule("every 60 minutes", async () => {
  const now = Date.now();

  const expired = await db.collection("stories").where("expiresAt", "<=", now).get();

  if (expired.empty) {
    console.log("cleanupExpiredStories: nothing to do");
    return;
  }

  console.log(`cleanupExpiredStories: found ${expired.size} expired stories`);

  for (const docSnap of expired.docs) {
    const { cloudinaryPublicId, mediaType } = docSnap.data();
    try {
      if (cloudinaryPublicId) {
        await cloudinary.uploader.destroy(cloudinaryPublicId, {
          resource_type: mediaType === "video" ? "video" : "image",
        });
      }
    } catch (err) {
      // Log and continue — a failed Cloudinary delete shouldn't block
      // deleting the Firestore doc (see file header for why an orphaned
      // Cloudinary asset is the safer failure mode than an orphaned doc).
      console.error(`Failed to delete Cloudinary asset ${cloudinaryPublicId}`, err);
    }
    await docSnap.ref.delete();
  }
});
