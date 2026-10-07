import { SITE_CONFIG } from "@/lib/site-config";

export const metadata = {
  title: "Terms of Service — Allegedly",
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="text-muted text-sm">Draft — last updated July 19, 2026. Not yet reviewed by counsel.</p>

      <h2>1. What Allegedly is</h2>
      <p>
        Allegedly ("we," "us," the "Platform") is a social platform for sharing and
        discussing unverified claims — "gists" — about people, companies, and events. Every
        organically posted gist is prefixed "Allegedly" and carries a Truth Meter reflecting
        an automated plausibility estimate and community voting. <strong>Allegedly does not
        verify, endorse, or fact-check the content of any gist</strong>, including gists
        posted by accounts with a "Verified Source" badge. That badge confirms the poster's
        real-world identity was confirmed by us — it says nothing about whether their post
        is true.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old to create an account or use Allegedly. By creating
        an account you represent that you meet this requirement. We may request additional
        age verification at any time and may suspend accounts we cannot verify as belonging
        to an adult.
      </p>

      <h2>3. Accounts and tiers</h2>
      <p>Allegedly offers three account tiers, each with different posting rules:</p>
      <ul>
        <li>
          <strong>Basic</strong> — free, and permanently anonymous. Basic posts are always
          displayed as "Anonymous" to other users; this does not mean the post is untraceable
          to us internally (see Privacy Policy §3).
        </li>
        <li>
          <strong>Verified Source</strong> — a paid tier requiring identity confirmation.
          Verified Source users may choose anonymity per post, and receive a revenue share on
          eligible posts as described in our then-current monetization terms.
        </li>
        <li>
          <strong>Corporate GIST-AD</strong> — a paid tier for organizations. Corporate posts
          are always labeled "GIST-AD," are never anonymous, and must be posted under a
          verified corporate identity.
        </li>
      </ul>
      <p>
        You are responsible for all activity on your account and for keeping your credentials
        secure.
      </p>

      <h2>4. Your content and your responsibility for it</h2>
      <p>
        You alone are responsible for the gists, comments, and other content you post
        ("User Content"). By posting, you represent that you have a good-faith basis for what
        you're claiming and that your post does not violate these Terms, our{" "}
        <a href="/legal/community-guidelines">Community Guidelines</a>, or applicable law —
        including defamation, harassment, and privacy law in your jurisdiction and the
        jurisdiction of anyone you post about.
      </p>
      <p>
        Allegedly does not pre-screen User Content and is not the "publisher" of User Content
        in the way a newspaper is of its own reporting. Prohibited content is described in the
        Community Guidelines and includes, at minimum: content that is illegal, that doxxes a
        private individual, that sexualizes a minor, that makes a specific and knowingly false
        factual claim with actual malice intended to harm someone, or that threatens violence.
      </p>
      <p>
        You grant Allegedly a worldwide, non-exclusive, royalty-free license to host, display,
        reproduce, and distribute your User Content on and through the Platform, including in
        connection with the Truth Meter, Re-Allegedly resharing, and Boost placement.
      </p>

      <h2>5. Retraction and edits</h2>
      <p>
        Verified Source and Corporate accounts may edit a gist after posting. Any edit that
        materially changes a factual claim will be marked with a visible "Retracted/Corrected"
        history trail, viewable by anyone who can see the original post. Basic accounts cannot
        edit posts once published.
      </p>

      <h2>6. Reporting, moderation, and takedowns</h2>
      <p>
        Any user may report a gist or comment. We may remove content, label it, restrict its
        reach, or suspend accounts that violate these Terms or our Community Guidelines, at
        our discretion and without prior notice where we believe removal is urgent (e.g.,
        threats, doxxing, or content involving a minor).
      </p>
      <p>
        If you believe content about you is defamatory or otherwise unlawful, contact us at{" "}
        <strong>{SITE_CONFIG.emails.legal}</strong>{" "}
        with the URL, a description of the harm, and your contact information. We will
        review reports promptly and may remove, label, or leave content up pending further
        information, consistent with applicable law.
      </p>
      <p>
        If you believe your copyrighted work was posted without authorization, send a
        takedown notice to the same address containing: identification of the work,
        identification of the material and its location on the Platform, your contact
        information, a good-faith statement that use is unauthorized, and a statement made
        under penalty of perjury that you are authorized to act on the copyright owner's
        behalf. [This section needs to be finalized against the DMCA agent registration
        requirements in your operating jurisdiction(s).]
      </p>

      <h2>7. Paid tiers, subscriptions, and Boost</h2>
      <p>
        Verified Source and Corporate GIST-AD subscriptions renew automatically until
        cancelled. Boost purchases are one-time, non-recurring payments for temporary
        increased visibility of a single gist. All payments are processed by Stripe or
        Paystack; Allegedly does not store your card details. [Refund policy, proration
        rules, and currency handling to be finalized with counsel and reflected here and in
        checkout flows.]
      </p>

      <h2>8. Termination</h2>
      <p>
        You may delete your account at any time in Settings. We may suspend or terminate
        your account for violating these Terms, the Community Guidelines, or applicable law,
        or if required by legal process.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        THE PLATFORM AND ALL USER CONTENT ARE PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND.
        ALLEGEDLY DOES NOT WARRANT THE ACCURACY, RELIABILITY, OR TRUTHFULNESS OF ANY GIST,
        TRUTH METER SCORE, OR OTHER USER CONTENT. [Standard disclaimer language — to be
        finalized by counsel against your operating jurisdiction's consumer-protection
        rules.]
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        [Placeholder. This section caps Allegedly's liability and needs to be drafted by
        counsel with reference to your entity's jurisdiction of incorporation and the
        jurisdictions you operate in.]
      </p>

      <h2>11. Dispute resolution</h2>
      <p>
        [Placeholder for arbitration clause / class-action waiver / venue selection —
        enforceability varies significantly by jurisdiction and must be drafted by counsel.]
      </p>

      <h2>12. Governing law</h2>
      <p>
        [Placeholder. To be set once the operating entity's jurisdiction of incorporation is
        finalized.]
      </p>

      <h2>13. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. We'll post the updated date above and,
        for material changes, provide notice through the Platform.
      </p>

      <h2>14. Contact</h2>
      <p>Questions about these Terms: <strong>{SITE_CONFIG.emails.legal}</strong>.</p>
    </>
  );
}
