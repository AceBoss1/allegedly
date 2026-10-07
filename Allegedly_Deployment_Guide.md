# Allegedly — Deployment Guide

Regenerated Session 20 alongside `Allegedly_File_Map.md`, since neither was
in the exported zip. Covers everything needed to take this from "running
locally against mock data" to a real Firebase project with the Session 20
Cloud Functions actually deployed.

> **Nobody has run these deploy commands yet as of Session 20.** All of
> §3–§5 below is written and ready but not executed against any real
> project — I don't have Firebase/GCP credentials or network access to
> deploy on your behalf. Everything here is exact copy-pasteable commands
> for you to run.

---

## 1. Prerequisites

- A Firebase project (`.firebaserc` currently points `live` at
  `allegedly-prod` — create that project in the Firebase console, or edit
  `.firebaserc` to match a project you already have).
- [Firebase CLI](https://firebase.google.com/docs/cli) installed and
  authenticated: `npm install -g firebase-tools`, then `firebase login`.
- A Cloudinary account (cloud name currently defaults to `djj49cetb` in
  `lib/cloudinary.ts` — override via env var, don't hardcode a new one).
- An Anthropic API key (console.anthropic.com) — only needed once you deploy
  `computeTruthMeterScore` (§5).
- Stripe and Paystack accounts — only needed for Phase 3 (not built yet, see
  File Map).

---

## 2. Local development

```bash
npm install
cp .env.local.example .env.local   # fill in real values, see §3 below
npm run dev
```

Open http://localhost:3000. Without real Firebase credentials in
`.env.local`, the app falls back to `lib/mock-data.ts` seed data — you'll
see a populated-looking Feed/Profile but nothing persists.

---

## 3. Firebase client + admin env vars

Create `.env.local` (see `lib/firebase/client.ts` / `lib/firebase/admin.ts`
for the exact vars each one checks — these throw a specific "which var is
missing" error at runtime, so if the app fails to boot after filling this
in, read that error message first):

```bash
# Client SDK (safe to expose — these are public by design)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Admin SDK (server-only — never prefix with NEXT_PUBLIC_)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Cloudinary (client-side upload widget + watermark transforms)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_WATERMARK_PUBLIC_ID=allegedly_watermark_fbal4l

# Optional — see lib/site-config.ts
NEXT_PUBLIC_SITE_DOMAIN=allegedly.name.ng
NEXT_PUBLIC_ACCESS_COHORT=alpha
```

Get the client values from Firebase console → Project Settings → General →
Your apps → SDK setup and configuration. Get the admin values from Project
Settings → Service accounts → Generate new private key (downloads a JSON;
`client_email` and `private_key` map directly — keep the `\n`s in
`private_key` literal, most `.env` loaders handle that fine but paste
carefully).

---

## 4. Deploy Firestore rules + indexes + Cloud Functions

All three ship together from repo root:

```bash
firebase use allegedly-prod   # or your project id, matches .firebaserc

# Rules + indexes (Session 20 added Phase 1 tier enforcement to firestore.rules)
firebase deploy --only firestore:rules,firestore:indexes

# Functions — see §5 for required secrets BEFORE running this
cd functions
npm install
npm run build   # tsc — should complete with zero errors
cd ..
firebase deploy --only functions
```

This deploys all four function files exported from `functions/src/index.ts`:

| Function | Trigger | What it does |
|---|---|---|
| `cleanupExpiredStories` | Scheduled, hourly | Deletes expired `stories` docs + their Cloudinary asset |
| `assignAnonymousPseudonym` | `gists` create | Computes and writes the deterministic anonymous pseudonym |
| `onLikeCreated` / `onLikeDeleted` | `likes` create/delete | Syncs `Gist.likeCount` + `UserInteractions.likedGistIds` |
| `onSaveCreated` / `onSaveDeleted` | `saves` create/delete | Syncs `Gist.saveCount` + `UserInteractions.savedGistIds` |
| `onRegistCreated` / `onRegistDeleted` | `regists` create/delete | Syncs `Gist.registCount` + `UserInteractions.registedGistIds` |
| `onHighlightCreated` / `onHighlightDeleted` | `highlights` create/delete | Syncs `UserInteractions.highlightedGistIds` (no Gist counter) |
| `onVoteCreated` | `votes` create | Syncs `Gist.consensusTrue/False/NeedsMore` + `UserInteractions.votedGistIds` |
| `onCommentCreated` / `onCommentDeleted` | `comments` create/delete | Syncs `Gist.commentCount` |
| `computeTruthMeterScore` | `gists` create | Calls the Anthropic API, writes `Gist.plausibilityScore` |

After deploying, watch each function's logs for the first few real writes:

```bash
firebase functions:log
```

---

## 5. Function-only secrets

Two secrets are needed by the Cloud Functions but must **never** be
`NEXT_PUBLIC_`-prefixed or committed — set them directly on the Functions
runtime, not in `.env.local`:

```bash
# Used by functions/src/lib/pseudonym.ts to salt the anonymous-pseudonym hash.
# Generate once, keep it forever (rotating breaks pseudonym continuity for
# existing anonymous posts — see File Map gap #10):
openssl rand -hex 32
firebase functions:secrets:set ANONYMOUS_PSEUDONYM_SALT

# Used by functions/src/truth-meter.ts to score plausibility:
firebase functions:secrets:set ANTHROPIC_API_KEY
```

Also set (as plain function config env vars, not secrets — needed by
`functions/src/story-cleanup.ts`'s Cloudinary asset-delete call):

```bash
firebase functions:config:set \
  cloudinary.cloud_name="YOUR_CLOUD_NAME" \
  cloudinary.api_key="YOUR_API_KEY" \
  cloudinary.api_secret="YOUR_API_SECRET"
```

(Or, on newer `firebase-functions` versions using the `.env` convention
inside `functions/`, set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET` directly — check
`firebase functions:secrets:access` vs. `.env` support against whatever CLI
version you have installed, this shifted between `firebase-tools` releases.)

Redeploy functions after setting secrets for the first time:

```bash
firebase deploy --only functions
```

---

## 6. Vercel (Next.js app hosting)

Not yet deployed anywhere — `README.md` currently says "running locally
only." To deploy:

```bash
npm install -g vercel
vercel
```

Add every `NEXT_PUBLIC_*` and admin var from §3 to the Vercel project's
Environment Variables (Settings → Environment Variables) — `vercel` won't
read your local `.env.local` automatically for production builds.

---

## 7. Stripe / Paystack (Phase 3 — not built yet)

No integration code exists yet (see File Map gap #4). When Phase 3 starts,
this section should cover: webhook endpoint setup, the `subscriptions`/
`boosts` write path (Admin SDK only — `firestore.rules` already blocks
client writes to both), and provider API key env vars
(`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYSTACK_SECRET_KEY`, etc.,
none of which exist in the codebase yet).

---

## 8. Post-deploy checklist

- [ ] `firebase deploy --only firestore:rules,firestore:indexes` succeeded
- [ ] `firebase deploy --only functions` succeeded, all 12 functions listed in Firebase console → Functions
- [ ] `ANONYMOUS_PSEUDONYM_SALT` and `ANTHROPIC_API_KEY` secrets set (functions will throw at cold-start otherwise — check `firebase functions:log`)
- [ ] Post one real anonymous gist with a pasted image URL → confirm the watermark shows `Anonymous-#XXXX`, not a blank/missing label
- [ ] Post one real non-anonymous gist → confirm `plausibilityScore` appears within a few seconds (check `firebase functions:log` for `computeTruthMeterScore` if not)
- [ ] Like/Save/Re-Allegedly a gist as two different accounts → confirm `Gist.likeCount` etc. increment and `userInteractions/{uid}` reflects it
- [ ] Vercel env vars match `.env.local` exactly
