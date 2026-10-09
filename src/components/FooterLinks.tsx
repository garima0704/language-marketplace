"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type FooterLinksProps = {
  translations: {
    about: string;
    contact: string;
    privacyPolicy: string;
    cookiePolicy: string;
    terms: string;
  };
};

export default function FooterLinks({
  translations,
}: FooterLinksProps) {
  const pathname = usePathname();

  const links = [
    {
      href: "/about",
      label: translations.about,
    },
    {
      href: "/contact",
      label: translations.contact,
    },
    {
      href: "/privacy",
      label: translations.privacyPolicy,
    },
    {
      href: "/cookies",
      label: translations.cookiePolicy,
    },
    {
      href: "/terms",
      label: translations.terms,
    },
  ];

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              isActive
                ? "font-medium text-foreground underline underline-offset-4"
                : "text-muted transition hover:text-foreground"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}