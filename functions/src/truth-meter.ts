// Phase 2: computes Gist.plausibilityScore, which types/entities.ts has
// always described as "0-100, LLM-generated" but nothing ever generated.
// GistCard already has the render-side handled (returns null and shows
// nothing when plausibilityScore is undefined — see its Phase 2 comment) so
// this is purely the missing write side.
//
// Deliberately does NOT touch consensusTrue/False/NeedsMore — those are
// community votes, reconciled from the `votes` collection in
// interactions.ts. plausibilityScore is a separate, independent signal
// (the AI estimate), shown alongside consensus in the UI, not blended into
// it — same separation the type comments already draw.

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "./lib/admin";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.TRUTH_METER_MODEL || "claude-sonnet-5";

const SYSTEM_PROMPT =
  "You estimate how plausible an unverified social-media claim (a \"gist\") sounds on its " +
  "face, using only general world knowledge and the claim's own internal consistency — you " +
  "have no ability to fact-check against real-time sources. Respond with ONLY a JSON object " +
  'of the exact shape {"score": <integer 0-100>}, nothing else, no markdown fences. 0 means ' +
  "wildly implausible, 100 means highly plausible/verifiable-sounding, 50 means genuinely " +
  "uncertain either way.";

async function scoreWithClaude(text: string): Promise<number | null> {
  if (!ANTHROPIC_API_KEY) {
    console.warn("[truth-meter] ANTHROPIC_API_KEY not set — skipping score for this gist");
    return null;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 100,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      }),
    });

    if (!response.ok) {
      console.error(`[truth-meter] Anthropic API error ${response.status}`, await response.text());
      return null;
    }

    const data = await response.json();
    const raw: string = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
    const parsed = JSON.parse(raw.trim());
    const score = Number(parsed.score);

    if (!Number.isFinite(score) || score < 0 || score > 100) {
      console.error("[truth-meter] model returned an out-of-range score", raw);
      return null;
    }

    return Math.round(score);
  } catch (err) {
    // A malformed/unparseable model response or network hiccup should never
    // crash the trigger or leave the gist half-written — just skip scoring
    // this one gist. plausibilityScore staying undefined is a safe, already-
    // handled state (GistCard renders nothing for it), not an error state.
    console.error("[truth-meter] scoring failed", err);
    return null;
  }
}

export const computeTruthMeterScore = onDocumentCreated("gists/{gistId}", async (event) => {
  const snap = event.data;
  if (!snap) return;

  const gist = snap.data();

  // Gist-Ad posts aren't claims to fact-check — scoring "buy our product"
  // as plausible/implausible is meaningless, and the Ad UI never renders
  // the Truth Meter for isGistAd posts anyway (see GistCard). Retracted
  // gists can't exist at create time (isRetracted only flips true later),
  // so no check needed for that here.
  if (gist.isGistAd) return;

  const score = await scoreWithClaude(gist.text as string);
  if (score === null) return;

  await snap.ref.update({ plausibilityScore: score });
});
