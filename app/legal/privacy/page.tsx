import { SITE_CONFIG } from "@/lib/site-config";

export const metadata = {
  title: "Privacy Policy — Allegedly",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-muted text-sm">Draft — last updated July 19, 2026. Not yet reviewed by counsel.</p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> email, username, display name, password hash,
          date of birth (for age verification), and — for Verified Source/Corporate
          tiers — identity verification data collected via a third-party verification
          provider.
        </li>
        <li>
          <strong>Content:</strong> gists, comments, votes, reports, and direct messages you
          send through the Platform.
        </li>
        <li>
          <strong>Payment data:</strong> handled entirely by Stripe and Paystack. We receive
          a subscription/transaction status and identifier from them, never your full card
          number.
        </li>
        <li>
          <strong>Device and usage data:</strong> IP address, device identifiers, log data,
          and approximate location (for geo-fenced Gist Spots), collected automatically.
        </li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To operate the Platform: authenticate you, serve your feed, process votes and the Truth Meter, and deliver notifications.</li>
        <li>To enforce our Terms and Community Guidelines, including investigating reports.</li>
        <li>To process payments and manage subscriptions and Boost purchases.</li>
        <li>To comply with legal obligations, including valid law enforcement requests.</li>
      </ul>

      <h2>3. What "Anonymous" actually means</h2>
      <p>
        This is the single most important thing to understand before posting on Allegedly.
        When a Basic-tier gist is displayed as <strong>"Anonymous,"</strong> that is a
        <strong> public-facing</strong> label only. Internally, every post remains linked to
        the account that created it. We retain this link so that we can:
      </p>
      <ul>
        <li>enforce our Community Guidelines against repeat or coordinated abuse,</li>
        <li>respond to valid legal process (e.g., a subpoena in a defamation claim, or a law enforcement request involving a threat of violence), and</li>
        <li>investigate reports of harassment, doxxing, or impersonation.</li>
      </ul>
      <p>
        We do not disclose the identity behind an anonymous post to other users, and we push
        back on overbroad legal requests — but we cannot promise that an anonymous post is
        untraceable, including to a court that orders us to disclose it. If your safety
        depends on true, backend-level anonymity, Allegedly is not the right tool for that
        post.
      </p>

      <h2>4. Anonymous tip inbox (Verified Sources)</h2>
      <p>
        Verified Source accounts may enable an anonymous tip inbox. Tips submitted this way
        are designed so that the sender's identity is not shown to the recipient. [The exact
        technical guarantee here — whether Allegedly itself retains sender identity
        server-side for legal-compliance reasons, the same way it does for "Anonymous" posts
        above — needs to be decided and disclosed accurately before this feature ships. Do
        not represent this feature as stronger than it technically is.]
      </p>

      <h2>5. Who we share data with</h2>
      <ul>
        <li><strong>Service providers:</strong> Firebase/Google Cloud (hosting, database), Stripe and Paystack (payments), our identity-verification vendor, and email/notification providers.</li>
        <li><strong>Legal requests:</strong> law enforcement or courts, when compelled by valid legal process, or where we believe disclosure is necessary to prevent imminent harm.</li>
        <li><strong>Never:</strong> we do not sell your personal data to advertisers or data brokers.</li>
      </ul>

      <h2>6. Data retention</h2>
      <p>
        We retain account and content data for as long as your account is active, and for a
        limited period after deletion to comply with legal obligations, resolve disputes, and
        enforce our agreements. [Specific retention windows per data type to be finalized.]
      </p>

      <h2>7. Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, export, or
        delete your personal data. You can manage most of this directly in Settings, or
        contact <strong>{SITE_CONFIG.emails.privacy}</strong>. [This section needs
        jurisdiction-specific detail — e.g., GDPR/UK GDPR rights for EU/UK users, NDPR rights
        for Nigerian users, and applicable US state privacy laws — added by counsel.]
      </p>

      <h2>8. Children's privacy</h2>
      <p>
        Allegedly is restricted to users 18 and older and is not directed at children. We do
        not knowingly collect data from anyone under 18; if we learn we have, we will delete
        the account and associated data.
      </p>

      <h2>9. International data transfers</h2>
      <p>
        We are built on infrastructure that may process and store data outside your country
        of residence. [Transfer mechanism — e.g., standard contractual clauses — to be
        finalized once hosting regions and user base composition are settled.]
      </p>

      <h2>10. Cookies and similar technologies</h2>
      <p>
        We use essential cookies/local storage for authentication, session management, and
        the age-confirmation gate. [Add a cookie table and consent banner copy once
        analytics/advertising tooling is chosen — needed for GDPR/ePrivacy compliance if
        serving EU users.]
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We'll update the date above and, for material changes, notify you through the
        Platform.
      </p>

      <h2>12. Contact</h2>
      <p>Privacy questions or data requests: <strong>{SITE_CONFIG.emails.privacy}</strong>.</p>
    </>
  );
}
