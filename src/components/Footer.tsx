import { cookies } from "next/headers";

import { getTranslations } from "@/lib/translations";
import FooterLinks from "./FooterLinks";

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
        <FooterLinks
          translations={{
            about: translations["footer.about"] ?? "About",
            contact: translations["footer.contact"] ?? "Contact",
            privacyPolicy:
              translations["footer.privacy_policy"] ?? "Privacy Policy",
            cookiePolicy:
              translations["footer.cookie_policy"] ?? "Cookie Policy",
            terms: translations["footer.terms"] ?? "Terms",
          }}
        />

        <p className="mt-6 text-sm text-muted">
          © 2026 NiceConvo.{" "}
          {translations["footer.all_rights_reserved"] ??
            "All rights reserved."}
        </p>
      </div>
    </footer>
  );
}