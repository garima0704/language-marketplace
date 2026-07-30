import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white mt-16">

      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">

          <Link
            href="/about"
            className="text-[#444444] hover:text-[#082645] transition"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-[#444444] hover:text-[#082645] transition"
          >
            Contact
          </Link>

          <Link
            href="/privacy-policy"
            className="text-[#444444] hover:text-[#082645] transition"
          >
            Privacy Policy
          </Link>

          <Link
            href="/cookie-policy"
            className="text-[#444444] hover:text-[#082645] transition"
          >
            Cookie Policy
          </Link>

          <Link
            href="/terms"
            className="text-[#444444] hover:text-[#082645] transition"
          >
            Terms
          </Link>

        </div>


        <p className="mt-8 text-sm text-gray-400">
          © 2026 NiceConvo. All rights reserved.
        </p>

      </div>

    </footer>
  );
}