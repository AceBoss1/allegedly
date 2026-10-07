import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This rule flags `setState()` called in an effect's early-return
      // branch (e.g. "no signed-in user yet, so reset to empty state and
      // bail before subscribing") as if it were the same hazard as setState
      // in the main body of every render. It isn't — the pattern below is
      // used throughout lib/use-auth.tsx, lib/interactions.tsx, and
      // lib/gist-spot-membership.tsx and is the standard shape for a
      // conditional Firestore/Auth listener. Downgraded to a warning rather
      // than rewritten into less readable derived-state gymnastics for no
      // runtime benefit.
      "react-hooks/set-state-in-effect": "warn",
      // The "// eyebrow" mono-font section labels (e.g. "// how it works")
      // used throughout the landing/legal pages are literal copy, not JS
      // comments — this rule's heuristic can't tell the difference and
      // flags every one of them.
      "react/jsx-no-comment-textnodes": "off",
      // Plain apostrophes/quotes in copy (contractions, quoted claims) are
      // intentional and render fine; this rule only guards against a very
      // old JSX parsing footgun that no longer applies.
      "react/no-unescaped-entities": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
