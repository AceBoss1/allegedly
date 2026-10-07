import { SITE_CONFIG } from "@/lib/site-config";

export const metadata = {
  title: "Community Guidelines — Allegedly",
};

export default function CommunityGuidelinesPage() {
  return (
    <>
      <h1>Community Guidelines</h1>
      <p className="text-muted text-sm">Draft — last updated July 19, 2026. Not yet reviewed by counsel.</p>

      <h2>The idea behind Allegedly</h2>
      <p>
        Allegedly exists for gossip, tips, and claims that haven't been proven yet — that's
        the point of the "Allegedly" prefix and the Truth Meter. Good-faith speculation,
        workplace gossip, industry rumors, and "I heard that..." posts are exactly what this
        platform is for. What we don't allow is using that framing as cover to deliberately
        hurt someone you know is telling the truth about, or to target someone with content
        that has nothing to do with a good-faith claim at all.
      </p>

      <h2>Not allowed, ever</h2>
      <ul>
        <li><strong>Doxxing:</strong> posting a private individual's home address, phone number, workplace schedule, or other information intended to enable someone to locate or contact them offline.</li>
        <li><strong>Sexual content involving minors</strong> in any form. We report this to the relevant authorities and law enforcement.</li>
        <li><strong>Threats of violence</strong> against any person or group.</li>
        <li><strong>Non-consensual intimate imagery.</strong></li>
        <li><strong>Coordinated harassment</strong> — organizing or participating in a pile-on against one person or account.</li>
        <li><strong>Impersonation</strong> of a real person without clearly disclosing it's a parody/commentary account.</li>
        <li><strong>Knowingly false claims made with actual malice</strong> — i.e., you post something you know is false, specifically to damage someone. Speculation and "I heard" gossip is not this; deliberately fabricating a specific, damaging lie is.</li>
        <li><strong>Hate speech</strong> targeting a protected characteristic (race, religion, ethnicity, gender, sexual orientation, disability, etc.).</li>
      </ul>

      <h2>The Truth Meter isn't a fact-check</h2>
      <p>
        The plausibility score and community votes on a gist reflect an AI estimate and how
        other users voted — not a determination by Allegedly of what's true. Don't rely on a
        high Truth Meter score as proof of anything, and don't treat a low score as proof a
        claim is false. Vote honestly; don't organize vote brigades to push a score in either
        direction, on your own posts or anyone else's.
      </p>

      <h2>If you're a Verified Source</h2>
      <p>
        Your badge tells readers we confirmed who you are — it does not tell them your posts
        are accurate, and you're not shielded from these Guidelines because you're verified.
        If anything, verified posts carry more weight and more scrutiny. If you got something
        wrong, edit it — the retraction trail is a feature, not a penalty.
      </p>

      <h2>If you're posting as Corporate GIST-AD</h2>
      <p>
        Your posts are always labeled and never anonymous. Sponsored or promotional content
        must be posted through this tier, not disguised as an organic Basic or Verified
        Source gist. Undisclosed sponsored posting on the organic feed will be removed and
        may result in account suspension.
      </p>

      <h2>Reporting</h2>
      <p>
        Tap the report icon on any gist, comment, or profile. Tell us what's wrong — we route
        reports differently depending on severity (e.g., threats and doxxing are reviewed
        faster than a disputed plausibility score). You can also email{" "}
        <strong>{SITE_CONFIG.emails.trust}</strong> for anything urgent or sensitive.
      </p>

      <h2>What happens if you break these rules</h2>
      <p>Consequences scale with severity and history, and may skip steps for severe violations:</p>
      <ol>
        <li>Warning and content label/removal</li>
        <li>Temporary restriction on posting, voting, or messaging</li>
        <li>Account suspension</li>
        <li>Permanent ban, and where applicable, a report to law enforcement</li>
      </ol>

      <h2>Retraction is encouraged, not punished</h2>
      <p>
        If new information shows your gist was wrong, correct it. A visible "Retracted/
        Corrected" trail is a trust signal for readers and for you — it is not treated as a
        violation on its own. Deliberately never correcting a claim you know is false is what
        gets you in trouble, not the correction itself.
      </p>

      <h2>Changes to these Guidelines</h2>
      <p>
        We'll update the date above as these evolve, and material changes will be announced
        on the Platform.
      </p>
    </>
  );
}
