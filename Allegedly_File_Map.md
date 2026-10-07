# Allegedly — File Map

Session-by-session log of what's built, a living **Known Tech Gaps** table,
and a **Roadmap Checklist**. This file is the source of truth for project
status — `README.md` links here rather than duplicating this.

> This copy was regenerated in Session 20 from a direct audit of the code in
> `Allegedly_wholeset_Upto_Session19.zip`, since the original File Map wasn't
> included in that export. Sessions 1–19 below are reconstructed from doc
> comments and file structure, not a verbatim history — treat the file
> inventory and gap table as authoritative; treat session numbers/dates as
> approximate.

## Legend

⬜ not started · 🟨 partial / needs work · ✅ done for its current phase

---

## File inventory

| File | Status | Notes |
|---|---|---|
| **App / pages** | | |
| `app/settings/page.tsx` | 🟨 | References `Nav`, `AvatarUpload`, `CreatorVisibilitySection` — not in this export, presumed to exist in the full repo |
| **Components** | | |
| `components/feed/GistCard.tsx` | 🟨 | References `WatermarkedExternalMedia` — not in this export |
| `components/profile/ProfileClient.tsx` | 🟨 | References `ReAllegedlyThread`, `FollowButton`, `GetVerifiedBanner` — not in this export |
| `components/profile/SocialLinksRow.tsx` | ✅ | |
| `components/settings/SocialLinksSection.tsx` | ✅ | |
| **lib/** | | |
| `lib/auth-actions.tsx` | ✅ | Google sign-in + sign-out |
| `lib/cloudinary.ts` | ✅ | Session 20: fixed stray `@` prepended to already-formatted anonymous pseudonym labels |
| `lib/cloudinary-upload.tsx` | ✅ | Signed direct-to-Cloudinary upload |
| `lib/firebase/admin.ts` | ✅ | |
| `lib/firebase/client.ts` | ✅ | |
| `lib/firestore-timestamps.ts` | ✅ | |
| `lib/gist-spot-membership.tsx` | ✅ | |
| `lib/interactions.tsx` | ✅ | Client-side; matching server-side reconciler landed Session 20 |
| `lib/mock-data.ts` | 🟨 | Still the fallback whenever Firestore is unconfigured/empty — by design for Phase 0, revisit once real data volume makes it unnecessary |
| `lib/site-config.ts` | ✅ | |
| `lib/use-auth.tsx` | ✅ | |
| `lib/use-follow.tsx` | ✅ | |
| `lib/use-live-gists.tsx` | ✅ | |
| `lib/use-live-regists.tsx` | ✅ | |
| `lib/use-live-stories.tsx` | ✅ | |
| `lib/use-now.tsx` | ✅ | |
| `lib/use-user-profile.tsx` | ✅ | |
| `lib/watermark.ts` | ✅ | Session 20: doc comments updated to match the pseudonym-label contract |
| **functions/src/** | | |
| `functions/src/story-cleanup.ts` | ✅ built, ⬜ deployed | Hourly expired-Story cleanup. Code is deploy-ready; nobody has run `firebase deploy` against a real project yet |
| `functions/src/anonymous-pseudonym.ts` | ✅ built, ⬜ deployed | **New, Session 20.** Closes the gap where real anonymous gists never got a pseudonym or watermark label |
| `functions/src/interactions.ts` | ✅ built, ⬜ deployed | **New, Session 20.** `UserInteractions` + denormalized-count reconciliation for likes/saves/regists/highlights/votes/comments |
| `functions/src/truth-meter.ts` | ✅ built, ⬜ deployed | **New, Session 20.** Phase 2 — LLM-generated `plausibilityScore` via the Anthropic API |
| `functions/src/lib/admin.ts` | ✅ | Shared Admin SDK singleton |
| `functions/src/lib/pseudonym.ts` | ✅ | Deterministic salted per-author hash |
| `functions/src/lib/join-table-reconciler.ts` | ✅ | Shared factory for the four like/save/regist/highlight triggers |
| **types/entities.ts** | ✅ | Single source of truth for Firestore schema shape |
| **firestore.rules** | ✅ | Session 20: added Phase 1 tier enforcement (char limits, hashtag limit, anonymity lock, Premium-only edits) via `get()` |
| **firestore.indexes.json** | 🟨 | Only has the `regists` composite index; revisit once real query patterns are exercised against production data |

---

## Known Tech Gaps

Ordered roughly by "will bite you first" if you launch without addressing it.

1. **⬜ Cloud Functions not deployed.** All four function files
   (`story-cleanup`, `anonymous-pseudonym`, `interactions`, `truth-meter`)
   compile cleanly (`npx tsc --noEmit` in `functions/`) but have never been
   deployed to a real Firebase project. Until `firebase deploy --only
   functions` runs: expired Stories accumulate on Cloudinary, real anonymous
   gists have no pseudonym/watermark label, `UserInteractions` +
   denormalized counts never update from real writes, and no gist ever gets
   a Truth Meter score. **This is the single highest-priority gap** — see
   `Allegedly_Deployment_Guide.md` §4 for the exact command.
2. **⬜ Missing files from this export.** `app/page.tsx`, `layout.tsx`,
   `PostComposer.tsx`, `GoogleSignInButton.tsx`, `Nav`,
   `WatermarkedExternalMedia`, `AvatarUpload`, `CreatorVisibilitySection`,
   `ReAllegedlyThread`, `FollowButton`, `GetVerifiedBanner`,
   `app/api/cloudinary/sign/route.ts`, and `.env.local.example` are all
   referenced by code in this archive but weren't included in the zip.
   Presumed to exist in the working repo this export was taken from —
   confirm before treating anything above as actually missing.
3. **🟨 Client-side tier/length checks not yet mirrored to match the new
   server-side rules.** `firestore.rules` now enforces `TIER_POST_LIMITS`
   and `HASHTAG_LIMIT` server-side (Session 20), but `PostComposer.tsx`
   (not in this export) needs to be checked — if its UI-side limits ever
   drift from `TIER_POST_LIMITS`/`HASHTAG_LIMIT` in `types/entities.ts`, a
   user could hit a confusing silent-reject at the rules layer with no
   inline error explaining why.
4. **⬜ Payments (Phase 3).** No Stripe/Paystack integration exists —
   `Subscription`/`Boost` are types only. Credits balance displays `0` for
   everyone. Gift Credits / Subscribe buttons are `alert()` placeholders.
5. **🟨 Video watermarking.** Only a UI overlay badge on embeds
   (`WatermarkedExternalMedia`, not in this export) — no pixel-level
   watermark for video, by deliberate zero-storage tradeoff. Native video
   uploads get no watermark at all (see `GistCard`'s comment on this).
   Revisit only if reposting/leaking becomes a measured problem.
6. **⬜ Cloudinary watermark positioning not visually confirmed against a
   live-deployed transformation.** The transform syntax is correct per
   Cloudinary's docs, but the exact offsets (`y_-70`, `y_70`, `w_0.55`) were
   never checked against a rendered image before Session 20 (network in the
   build environment can't reach Cloudinary). Once functions are deployed
   and a real anonymous gist exists, visually check the pseudonym label
   position/legibility and nudge offsets if needed.
7. **⬜ Trust & safety (Phase 4).** `isRetracted`/`editHistory` exist on
   `Gist` but nothing writes to them yet — no retraction UI, no edit-history
   viewer.
8. **⬜ Notifications + real trending algorithm (Phase 5).** Push/email
   prefs are UI-only placeholders in Settings. "Trending" in
   `lib/mock-data.ts` is just highest view count — fine for seed data, not a
   real algorithm.
9. **🟨 `firestore.indexes.json` is minimal.** Only one composite index
   exists. `useLiveGists`/`useLiveStories`/`useLiveRegists`'s queries should
   be checked against the Firestore console's "missing index" errors once
   traffic is real — that console link is the fastest way to discover which
   indexes are actually needed, rather than guessing ahead of time.
10. **⬜ `ANONYMOUS_PSEUDONYM_SALT` is a single static secret.** If it ever
    leaks, every past anonymous pseudonym becomes reversible by brute-forcing
    candidate `authorId`s against it. Rotating the salt is a one-line env
    var change but breaks pseudonym continuity for existing posts (a
    previously-consistent anonymous source's code would change) — acceptable
    for now, worth a real secret-rotation story before this matters at scale.

---

## Roadmap Checklist

### Phase 0 — Foundation (mostly done)
- [x] Firebase Auth (Google sign-in)
- [x] Firestore schema (`types/entities.ts`) + rules
- [x] Feed/Profile read paths off real Firestore data (`use-live-*` hooks)
- [x] Cloudinary direct-upload + fetch-watermarking
- [x] Mock-data fallback for a Firestore-less/empty dev environment
- [ ] Confirm all files listed under Known Tech Gap #2 exist in the working repo

### Phase 1 — Integrity & tier enforcement
- [x] Server-side character-limit enforcement per tier (Session 20, `firestore.rules`)
- [x] Server-side hashtag-limit enforcement (Session 20)
- [x] Server-side Standard-tier anonymity lock (Session 20)
- [x] Server-side Premium/Premium+-only gist editing (Session 20)
- [x] `UserInteractions` + denormalized-count reconciliation (Session 20, `functions/src/interactions.ts`) — **built, not deployed**
- [x] Anonymous pseudonym generation (Session 20, `functions/src/anonymous-pseudonym.ts`) — **built, not deployed**
- [ ] Deploy all of the above (`firebase deploy --only functions,firestore:rules`)
- [ ] Confirm `PostComposer.tsx`'s client-side limits match server-side ones

### Phase 2 — Truth Meter
- [x] `plausibilityScore` scoring backend (Session 20, `functions/src/truth-meter.ts`) — **built, not deployed**
- [ ] Deploy + set `ANTHROPIC_API_KEY` (see Deployment Guide §5)
- [ ] Decide whether/when `contextShieldUntil` gets auto-set (currently unset — Truth Meter shows as soon as a score exists)
- [ ] Re-scoring policy: currently score-once-at-creation only; consider re-running if a gist's text is edited (Premium/Premium+ editing is now allowed per Phase 1)

### Phase 3 — Payments
- [ ] Stripe integration
- [ ] Paystack integration
- [ ] Credits top-up flow
- [ ] Subscription webhook → `AllegedlyUser.hasActiveSubscription` / `tier`
- [ ] Boost purchase flow → `boosts` collection

### Phase 4 — Trust & safety
- [ ] Retraction UI + `isRetracted`/`retractionNote` write path
- [ ] Edit-history viewer

### Phase 5 — Growth
- [ ] Push/email notification preferences
- [ ] Real trending algorithm
