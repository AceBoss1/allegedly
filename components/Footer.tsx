import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface/40">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <div className="relative h-8 w-36">
              <Image
                src="/brand/logo-horizontal.png"
                alt="Allegedly"
                fill
                sizes="128px"
                className="object-contain object-left"
              />
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Every post starts unverified. The community decides what's credible from there.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="font-mono-brand text-xs uppercase tracking-widest text-muted mb-3">
                Legal
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/legal/terms" className="hover:text-cyan transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="hover:text-cyan transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/community-guidelines"
                    className="hover:text-cyan transition-colors"
                  >
                    Community Guidelines
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono-brand text-xs uppercase tracking-widest text-muted mb-3">
                Product
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/#how-it-works" className="hover:text-cyan transition-colors">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/#tiers" className="hover:text-cyan transition-colors">
                    Tiers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border-subtle pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Allegedly. Unverified by design.</p>
          <p>18+. All posts are user-generated claims, not statements of fact by Allegedly.</p>
        </div>
      </div>
    </footer>
  );
}
