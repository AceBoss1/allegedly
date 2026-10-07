import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GistTicker from "@/components/GistTicker";
import RedirectIfAuthed from "@/components/auth/RedirectIfAuthed";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { SITE_CONFIG } from "@/lib/site-config";

const STEPS = [
  {
    n: "01",
    title: "Post it — allegedly",
    body: "Every organic post is automatically prefixed 'Allegedly.' Standard accounts stay permanently anonymous. Premium and Premium+ accounts can attach their name for more reach.",
  },
  {
    n: "02",
    title: "The crowd weighs in",
    body: "An AI plausibility score and community votes — True, False, or Needs More Gist — combine into a live Truth Meter on every post.",
  },
  {
    n: "03",
    title: "It spreads, or it doesn't",
    body: "Re-Allegedly a post with your own angle, Boost it to Trending, or watch the consensus shift as more sources weigh in.",
  },
];

const TIERS = [
  {
    name: "Standard",
    price: "Free",
    tagline: "Permanently anonymous",
    features: ["180-character posts", "Always posted as Anonymous", "Vote on the Truth Meter", "0% ad revenue share"],
  },
  {
    name: "Premium",
    price: "Paid",
    tagline: "Identity confirmed, content isn't",
    features: [
      "360-character posts, editable after posting",
      "Anonymity optional per post",
      "50% ad revenue share on eligible posts",
      "Boost & Context Shield access",
    ],
    highlight: true,
  },
  {
    name: "Premium+",
    price: "Paid",
    tagline: "Gist-Ad label, toggle on when you need it",
    features: [
      "720-character posts, higher visibility",
      "Post organically, or label any post a Gist-Ad",
      "60% ad revenue share on eligible posts",
      "Access to all 4 Gist-Ad products (below)",
    ],
  },
];

// Gist-Ad is a per-post label Premium+ accounts can toggle on — not a
// separate tier of its own anymore. Four products, two of which share ad
// revenue with the organic gist they're attached to.
const GIST_AD_PRODUCTS = [
  {
    name: "Sponsored gist",
    description: "A dedicated native post promoting your brand, product, or campaign for maximum organic reach.",
  },
  {
    name: "Allegedly Spotlight",
    description: "Got a guide, report, tool, or event worth sharing? We'll put it in front of feed, discover, and gist spots.",
  },
  {
    name: "Co-branded gist",
    description: "Collaborative posts alongside a trending gist on topics your audience already cares about.",
    revShare: true,
  },
  {
    name: "Brand mention",
    description: "Your brand woven naturally into an original post — editorial feel, no banner-ad energy.",
    revShare: true,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <RedirectIfAuthed />
      <Nav />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <p className="font-mono-brand text-xs uppercase tracking-widest text-cyan mb-4">
              // {SITE_CONFIG.accessCohortLabel.toLowerCase()} — unverified by design
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              Every rumor
              <br />
              deserves a{" "}
              <span className="gradient-text">hearing</span>.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
              Allegedly is the gossip network built around one honest idea: post the claim,
              show it's unverified, and let the crowd decide what to believe. No pretending
              everything on here is fact. No pretending it isn't interesting.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                id="early-access"
                href="#join"
                className="rounded-xl bg-gradient-to-r from-cyan to-lime px-6 py-3 font-semibold text-background hover:opacity-90 transition-opacity"
              >
                Join the {SITE_CONFIG.accessCohortLabel}
              </a>
              <a
                href="#how-it-works"
                className="rounded-xl border border-border-subtle px-6 py-3 font-semibold text-foreground hover:border-muted transition-colors"
              >
                See how it works
              </a>
            </div>
            <p className="mt-6 text-xs text-muted">
              18+ only · <span className="text-foreground/80">real posts, not real facts</span> until the community says otherwise
            </p>
          </div>

          <GistTicker />
        </section>

        {/* Trust strip */}
        <section className="border-y border-border-subtle bg-surface/60">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <p className="font-mono-brand text-xs uppercase tracking-widest text-cyan mb-3 text-center">
              // what allegedly actually is
            </p>
            <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-muted">
              {SITE_CONFIG.description}
            </p>
            <p className="mt-4 text-center text-xs text-muted">
              Read the full{" "}
              <a href="/legal/community-guidelines" className="text-cyan underline underline-offset-2">
                Community Guidelines
              </a>
              .
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono-brand text-xs uppercase tracking-widest text-cyan mb-3">
            // how it works
          </p>
          <h2 className="font-display text-3xl font-bold mb-12">Three steps, no pretending.</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="relative rounded-2xl border border-border-subtle bg-surface p-6">
                <span className="font-display text-3xl font-bold text-border-subtle">{step.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tiers */}
        <section id="tiers" className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono-brand text-xs uppercase tracking-widest text-cyan mb-3">
            // account tiers
          </p>
          <h2 className="font-display text-3xl font-bold mb-12">Pick your level of exposure.</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`gradient-border relative rounded-2xl p-6 ${
                  tier.highlight ? "bg-surface-raised" : "bg-surface"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-cyan to-lime px-3 py-1 font-mono-brand text-[10px] font-semibold uppercase tracking-widest text-background">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted">{tier.tagline}</p>
                <p className="mt-4 font-display text-2xl font-bold gradient-text">{tier.price}</p>
                <ul className="mt-6 space-y-3 text-sm text-foreground/90">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-lime">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Gist-Ad products */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono-brand text-xs uppercase tracking-widest text-cyan mb-3">
            // gist-ad, for premium+
          </p>
          <h2 className="font-display text-3xl font-bold mb-3">Gist-Ad is a label, not a tier.</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted mb-12">
            Any Premium+ account can toggle Gist-Ad on for a specific post — organic gists
            stay organic. Four products, two of which share ad revenue with the organic
            gist they're attached to.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {GIST_AD_PRODUCTS.map((product) => (
              <div key={product.name} className="rounded-2xl border border-amber/30 bg-surface p-6">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-amber/20 px-1.5 py-0.5 font-mono-brand text-[9px] uppercase tracking-widest text-amber">
                    Gist-Ad
                  </span>
                  <h3 className="font-display text-lg font-semibold">{product.name}</h3>
                </div>
                <p className="mt-2 text-sm text-muted">{product.description}</p>
                {product.revShare && (
                  <p className="mt-3 font-mono-brand text-[10px] uppercase tracking-widest text-lime">
                    Original gist owner gets ad share
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-lime/30 bg-lime/5 p-6">
            <div className="flex items-center gap-2">
              <span className="rounded bg-lime/20 px-1.5 py-0.5 font-mono-brand text-[9px] uppercase tracking-widest text-lime">
                Sponsored
              </span>
              <h3 className="font-display text-lg font-semibold">Gist-Boost</h3>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Separate from Gist-Ad and open to every tier: pay to push any gist to Trending
              Allegedly for a limited window. While active, it carries a plain "Sponsored"
              label — no Gist-Ad product attached, just paid reach.
            </p>
          </div>
        </section>

        {/* Join */}
        <section id="join" className="mx-auto max-w-2xl px-6 py-20 text-center">
          <p className="font-mono-brand text-xs uppercase tracking-widest text-cyan mb-3">
            // {SITE_CONFIG.accessCohortLabel.toLowerCase()} access
          </p>
          <h2 className="font-display text-3xl font-bold mb-4">
            Join the {SITE_CONFIG.accessCohortLabel} test.
          </h2>
          <p className="text-muted mb-8">
            Allegedly is in closed {SITE_CONFIG.accessCohortLabel.toLowerCase()} testing.
            Sign in with Google to create an account — you'll land straight in the feed, and
            you won't see this page again next time you come back signed in.
          </p>
          <div className="flex justify-center">
            <GoogleSignInButton label={`Continue with Google — join the ${SITE_CONFIG.accessCohortLabel.toLowerCase()}`} />
          </div>
          <p className="mt-4 text-xs text-muted">
            By continuing you accept our{" "}
            <a href="/legal/terms" className="text-cyan underline underline-offset-2">
              Terms
            </a>{" "}
            and{" "}
            <a href="/legal/community-guidelines" className="text-cyan underline underline-offset-2">
              Community Guidelines
            </a>
            . 18+ only.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
