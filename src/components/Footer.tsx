import Link from "next/link";
import { cookies } from "next/headers";

import { getTranslations } from "@/lib/translations";

export default async function Footer() {
  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const translations = await getTranslations(
    [
      "footer.about",
      "footer.contact",
      "footer.privacy_policy",
      "footer.cookie_policy",
      "footer.terms",
      "footer.all_rights_reserved",
    ],
    locale
  );

  return (
    <footer className="mt-12 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
          <Link
            href="/about"
            className="text-muted transition hover:text-foreground"
          >
            {translations["footer.about"] ?? "About"}
          </Link>

          <Link
            href="/contact"
            className="text-muted transition hover:text-foreground"
          >
            {translations["footer.contact"] ?? "Contact"}
          </Link>

          <Link
            href="/privacy-policy"
            className="text-muted transition hover:text-foreground"
          >
            {translations["footer.privacy_policy"] ??
              "Privacy Policy"}
          </Link>

          <Link
            href="/cookie-policy"
            className="text-muted transition hover:text-foreground"
          >
            {translations["footer.cookie_policy"] ??
              "Cookie Policy"}
          </Link>

          <Link
            href="/terms"
            className="text-muted transition hover:text-foreground"
          >
            {translations["footer.terms"] ?? "Terms"}
          </Link>
        </div>

        <p className="mt-6 text-sm text-muted">
          © 2026 NiceConvo.{" "}
          {translations["footer.all_rights_reserved"] ??
            "All rights reserved."}
        </p>
      </div>
    </footer>
  );
}