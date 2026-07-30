import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
          <Link
            href="/about"
            className="text-[#444444] transition hover:text-[#082645]"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-[#444444] transition hover:text-[#082645]"
          >
            Contact
          </Link>

          <Link
            href="/privacy-policy"
            className="text-[#444444] transition hover:text-[#082645]"
          >
            Privacy Policy
          </Link>

          <Link
            href="/cookie-policy"
            className="text-[#444444] transition hover:text-[#082645]"
          >
            Cookie Policy
          </Link>

          <Link
            href="/terms"
            className="text-[#444444] transition hover:text-[#082645]"
          >
            Terms
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          © 2026 NiceConvo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}