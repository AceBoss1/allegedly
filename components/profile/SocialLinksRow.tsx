import type { AllegedlyUser } from "@/types/entities";

// Matches the link-in-bio reference screenshot's style: colored circle
// per platform, white glyph, small icon row. Fixed five platforms rather
// than an open list — see AllegedlyUser.socialLinks's doc comment.
const PLATFORMS: {
  key: keyof NonNullable<AllegedlyUser["socialLinks"]>;
  label: string;
  bg: string;
  href: (value: string) => string;
  glyph: string;
}[] = [
  { key: "email", label: "Email", bg: "#7c5cff", href: (v) => `mailto:${v}`, glyph: "✉" },
  { key: "whatsapp", label: "WhatsApp", bg: "#25D366", href: (v) => `https://wa.me/${v.replace(/\D/g, "")}`, glyph: "☎" },
  { key: "messenger", label: "Messenger", bg: "#00B2FF", href: (v) => v, glyph: "◆" },
  { key: "telegram", label: "Telegram", bg: "#229ED9", href: (v) => v, glyph: "➤" },
  { key: "x", label: "X", bg: "#000000", href: (v) => v, glyph: "𝕏" },
];

export default function SocialLinksRow({ socialLinks }: { socialLinks?: AllegedlyUser["socialLinks"] }) {
  if (!socialLinks) return null;
  const active = PLATFORMS.filter((p) => socialLinks[p.key]);
  if (active.length === 0) return null;

  return (
    <div className="mt-3 flex gap-2">
      {active.map((p) => (
        <a
          key={p.key}
          href={p.href(socialLinks[p.key]!)}
          target="_blank"
          rel="noopener noreferrer"
          title={p.label}
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-white"
          style={{ backgroundColor: p.bg }}
        >
          {p.glyph}
        </a>
      ))}
    </div>
  );
}
