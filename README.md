# Allegedly (web)

Next.js 16 (App Router) + Tailwind v4 + Firebase (Auth, Firestore) + Cloudinary.
Running locally only for now — no Vercel/production deploy yet. See
`Allegedly_Deployment_Guide.md` for full Firebase/Vercel/Stripe/Paystack/Cloudinary setup,
and `Allegedly_File_Map.md` for a session-by-session log of what's built, plus the living
Known Tech Gaps and Roadmap Checklist sections.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Copy `.env.local.example` to `.env.local` and fill in real
Firebase/Cloudinary credentials to get past mock-data mode — see the Deployment Guide.

## Notes

- Fonts (Space Grotesk, Inter, JetBrains Mono) load from Google Fonts at build time via
  `next/font/google` — needs normal internet access.
- `public/brand/` holds the logo assets — `logo-horizontal.png` (nav/footer),
  `logo-square.png` (favicon/OG image), `logo-mark-color.png` (spare, not wired up).
- Tailwind v4 config lives in `app/globals.css` (no `tailwind.config.js` — v4 uses
  `@theme` blocks in CSS).
- `firestore.rules` needs deploying via `firebase deploy --only firestore:rules` against
  a real Firebase project — see Deployment Guide §3.
