// Single source of truth for anything domain-dependent: site URL, contact emails,
// and canonical brand copy. Change domains later by setting NEXT_PUBLIC_SITE_DOMAIN
// in your environment (or editing the fallback below) — nothing else in the codebase
// should ever hardcode "allegedly.name.ng" or an @ email address directly.

const DOMAIN = (process.env.NEXT_PUBLIC_SITE_DOMAIN || "allegedly.name.ng").trim();

// Single place controlling whether we call new sign-ups "alpha" or "beta"
// testers — flip this one value (or set NEXT_PUBLIC_ACCESS_COHORT) rather
// than hunting down every "alpha" string in the join flow and Nav CTA.
const ACCESS_COHORT: "alpha" | "beta" =
  process.env.NEXT_PUBLIC_ACCESS_COHORT === "beta" ? "beta" : "alpha";

export const SITE_CONFIG = {
  name: "Allegedly",
  tagline: "The Viral Gist Platform",
  domain: DOMAIN,
  url: `https://${DOMAIN}`,
  accessCohort: ACCESS_COHORT,
  accessCohortLabel: ACCESS_COHORT === "beta" ? "Beta" : "Alpha",

  // Canonical brand description — used for the landing page's About copy and as the
  // default SEO/OG description. Keep this in sync if the official wording changes.
  description:
    'Allegedly is the #1 gossip social network/platform for sharing and discussing ' +
    'unverified claims — "gists" — about people, companies, and events. Every ' +
    'organically posted gist is prefixed "Allegedly" and carries a Truth Meter ' +
    'reflecting an automated plausibility estimate and community voting. Allegedly ' +
    "does not verify, endorse, or fact-check the content of any gist, including " +
    'gists posted by accounts with a "Verified Source" badge. That badge confirms ' +
    "the poster's real-world identity was confirmed by us — it says nothing about " +
    "whether their post is true.",

  emails: {
    legal: `legal@${DOMAIN}`,
    privacy: `privacy@${DOMAIN}`,
    trust: `trust@${DOMAIN}`,
  },
} as const;
