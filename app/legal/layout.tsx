import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 pt-10">
          <div className="rounded-xl border border-amber/40 bg-amber/10 px-5 py-4 text-sm text-foreground/90">
            <p className="font-mono-brand text-xs uppercase tracking-widest text-amber mb-1">
              // draft — not legal advice
            </p>
            This document is a working draft written to scope Allegedly's legal surface
            area (defamation exposure, anonymous posting, user-generated content, age
            restriction, and payment terms). It has not been reviewed by an attorney and
            should not be published or relied on as-is. Have qualified counsel in your
            operating jurisdiction(s) review and finalize it — particularly the governing
            law, arbitration, and liability sections — before this goes live.
          </div>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-cyan underline underline-offset-2"
          >
            ← Back to Allegedly
          </Link>
        </div>
        <article className="prose prose-invert mx-auto max-w-3xl px-6 py-10 prose-headings:font-display prose-a:text-cyan">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
}
