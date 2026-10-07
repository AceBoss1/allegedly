"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { AllegedlyUser } from "@/types/entities";

const FIELDS: { key: keyof NonNullable<AllegedlyUser["socialLinks"]>; label: string; placeholder: string }[] = [
  { key: "email", label: "Email", placeholder: "you@example.com" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "2348012345678" },
  { key: "messenger", label: "Messenger", placeholder: "https://m.me/yourpage" },
  { key: "telegram", label: "Telegram", placeholder: "https://t.me/yourhandle" },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/yourhandle" },
];

export default function SocialLinksSection({
  userId,
  profile,
}: {
  userId: string;
  profile: AllegedlyUser;
}) {
  const [values, setValues] = useState(profile.socialLinks ?? {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, "users", userId), { socialLinks: values }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save social links", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-border-subtle bg-surface p-4">
      <h2 className="mb-3 font-mono-brand text-xs uppercase tracking-widest text-muted">
        Verified social links
      </h2>
      <p className="mb-3 text-xs text-muted">
        Shown as an icon row on your profile — Premium/Premium+ only.
      </p>
      <div className="space-y-2">
        {FIELDS.map((f) => (
          <input
            key={f.key}
            type="text"
            value={values[f.key] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            placeholder={`${f.label} — ${f.placeholder}`}
            className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-cyan"
          />
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-3 rounded-full bg-gradient-to-r from-cyan to-lime px-4 py-1.5 font-mono-brand text-xs font-semibold text-background disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save links"}
      </button>
    </section>
  );
}
