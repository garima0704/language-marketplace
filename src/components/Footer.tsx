
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
          <Link
            href="/about"
            className="text-muted transition hover:text-foreground"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-muted transition hover:text-foreground"
          >
            Contact
          </Link>

          <Link
            href="/privacy-policy"
            className="text-muted transition hover:text-foreground"
          >
            Privacy Policy
          </Link>

          <Link
            href="/cookie-policy"
            className="text-muted transition hover:text-foreground"
          >
            Cookie Policy
          </Link>

          <Link
            href="/terms"
            className="text-muted transition hover:text-foreground"
          >
            Terms
          </Link>
        </div>

        <p className="mt-6 text-sm text-muted">
          © 2026 NiceConvo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
