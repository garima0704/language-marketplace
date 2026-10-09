import Link from "next/link";

import { getSitePage } from "@/lib/sitePages";

type LegalSection = {
  heading?: string;
  body?: string;
};

type PageData = Record<string, unknown>;

const defaultSections: LegalSection[] = [
  {
    heading: "Acceptance of These Terms",
    body: `By accessing or using NiceConvo, you agree to be bound by these Terms of Service and any applicable policies referenced in them. If you do not agree with these terms, please do not use NiceConvo.

These Terms apply to visitors, registered users, subscribers, creators, and other users of the platform.`,
  },
  {
    heading: "About NiceConvo",
    body: `NiceConvo is a platform designed to help people discover, watch, publish, and learn from language-related video content.

Features and services available through NiceConvo may change over time. We may add, modify, suspend, or discontinue features at our discretion.`,
  },
  {
    heading: "Accounts",
    body: `Some NiceConvo features require you to create an account. You are responsible for providing accurate information and for keeping your account credentials secure.

You are responsible for activity that occurs through your account. If you believe your account has been accessed without authorization, please contact us as soon as possible.`,
  },
  {
    heading: "User Content",
    body: `NiceConvo may allow users and creators to upload, publish, or otherwise share videos, profile information, descriptions, comments, and other content.

You retain ownership of content that you create and provide to NiceConvo. However, by publishing content on the platform, you grant NiceConvo the permissions reasonably necessary to host, store, display, reproduce, distribute, and make that content available through the platform.

You are responsible for ensuring that you have the necessary rights and permissions for any content you upload or publish.`,
  },
  {
    heading: "Prohibited Content and Conduct",
    body: `You agree not to use NiceConvo to upload, publish, distribute, or promote content or activity that is unlawful, harmful, fraudulent, abusive, or otherwise violates these Terms.

• Content that violates applicable laws or regulations.
• Content that infringes another person's intellectual property or other rights.
• Harassment, threats, abuse, or targeted harmful behavior.
• Fraudulent, deceptive, or misleading activity.
• Attempts to interfere with, damage, or gain unauthorized access to the platform or another user's account.
• Automated or abusive activity that places unreasonable demands on NiceConvo.`,
  },
  {
    heading: "Creator Content",
    body: `Creators are responsible for the content they publish, including its accuracy, legality, quality, and compliance with these Terms.

NiceConvo does not guarantee the accuracy, completeness, or educational value of content published by individual creators. Content available on the platform represents the views and responsibility of the creator who published it.`,
  },
  {
    heading: "Subscriptions and Payments",
    body: `NiceConvo may offer paid subscriptions, creator content, or other paid features. Prices, billing terms, and available features will be presented to you before you complete a purchase.

Payments may be processed through third-party payment providers. Their terms and policies may also apply to your transaction.

Where applicable, subscription charges may automatically renew according to the terms presented at the time of purchase unless you cancel before the applicable renewal date.`,
  },
  {
    heading: "Intellectual Property",
    body: `NiceConvo and its original platform features, software, design, branding, text, graphics, and other materials are protected by applicable intellectual property laws.

Except where expressly permitted, you may not copy, modify, distribute, sell, lease, reverse engineer, or otherwise exploit NiceConvo's proprietary materials without appropriate authorization.`,
  },
  {
    heading: "Copyright Complaints",
    body: `If you believe content available on NiceConvo infringes your copyright or other intellectual property rights, please contact us with sufficient information to identify the material and explain the basis of your claim.`,
  },
  {
    heading: "Content Moderation",
    body: `We may review, restrict, remove, or disable access to content or accounts when we reasonably believe that content or activity violates these Terms, applicable law, or the safety of the platform and its users.

We may also take action against accounts involved in abuse, fraud, security violations, or other activity that may harm NiceConvo or its users.`,
  },
  {
    heading: "Third-Party Services and Links",
    body: `NiceConvo may integrate with or link to third-party services. These services may have their own terms, privacy policies, and practices.

We are not responsible for the availability, content, or practices of third-party services that are outside our control.`,
  },
  {
    heading: "Availability of the Service",
    body: `We aim to keep NiceConvo available and reliable, but we do not guarantee that the platform will always be available, uninterrupted, secure, or free from errors.

The platform may occasionally be unavailable because of maintenance, updates, technical problems, security incidents, or circumstances outside our reasonable control.`,
  },
  {
    heading: "Disclaimer",
    body: `NiceConvo is provided on an "as is" and "as available" basis to the extent permitted by applicable law.

We do not guarantee that the platform or its content will always be accurate, complete, reliable, secure, or suitable for a particular purpose.`,
  },
  {
    heading: "Limitation of Liability",
    body: `To the maximum extent permitted by applicable law, NiceConvo and its operators, affiliates, service providers, and representatives will not be liable for indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the platform.`,
  },
  {
    heading: "Account Suspension or Termination",
    body: `You may stop using NiceConvo at any time. We may suspend or terminate access to an account when reasonably necessary, including when an account or its activity violates these Terms or creates a risk to NiceConvo or its users.

Certain provisions of these Terms may continue to apply after termination, including provisions relating to intellectual property, liability, and other rights or obligations that by their nature should survive termination.`,
  },
  {
    heading: "Changes to These Terms",
    body: `We may update these Terms from time to time to reflect changes to NiceConvo, our services, or applicable legal requirements.

When changes are made, we will update the "Last updated" date at the top of this page. Your continued use of NiceConvo after updated Terms become effective means that you accept the revised Terms to the extent permitted by law.`,
  },
  {
    heading: "Governing Law",
    body: `These Terms are subject to the laws applicable to NiceConvo and its operations, without regard to conflict-of-law principles, except where applicable law requires otherwise.`,
  },
  {
    heading: "Contact Us",
    body: `If you have questions about these Terms of Service, please contact us through our Contact page.`,
  },
];

function getText(
  data: PageData,
  key: string,
  fallback: string,
): string {
  const value = data[key];

  return typeof value === "string" && value.trim()
    ? value
    : fallback;
}

function getLegalSections(pageData: PageData): LegalSection[] {
  const savedSections = pageData.sections;

  if (!Array.isArray(savedSections)) return [];

  const legalSection = savedSections.find(
    (section) =>
      section !== null &&
      typeof section === "object" &&
      !Array.isArray(section) &&
      "type" in section &&
      section.type === "legal_sections" &&
      "enabled" in section &&
      section.enabled === true,
  );

  if (
    !legalSection ||
    typeof legalSection !== "object" ||
    !("data" in legalSection) ||
    !legalSection.data ||
    typeof legalSection.data !== "object" ||
    !("sections" in legalSection.data) ||
    !Array.isArray(legalSection.data.sections)
  ) {
    return [];
  }

  return legalSection.data.sections
    .filter(
      (section): section is LegalSection =>
        section !== null &&
        typeof section === "object" &&
        !Array.isArray(section) &&
        "heading" in section &&
        "body" in section &&
        typeof section.heading === "string" &&
        typeof section.body === "string",
    )
    .filter(
      (section) =>
        section.heading.trim().length > 0 ||
        section.body.trim().length > 0,
    );
}

function renderInlineText(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

function renderContactText(text: string) {
  const parts = text.split(/(Contact page)/g);

  return parts.map((part, index) => {
    if (part === "Contact page") {
      return (
        <Link
          key={index}
          href="/contact"
          className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          Contact page
        </Link>
      );
    }

    return (
      <span key={index}>
        {renderInlineText(part)}
      </span>
    );
  });
}

function renderParagraphs(body: string, isContact = false) {
  const blocks = body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const isBulletList = lines.every((line) =>
      line.startsWith("• "),
    );

    if (isBulletList) {
      return (
        <ul
          key={index}
          className="mt-5 space-y-3 text-sm leading-7 text-foreground md:text-base"
        >
          {lines.map((line, itemIndex) => (
            <li key={itemIndex} className="flex gap-3">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
              <span>
                {renderInlineText(line.slice(2))}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p
        key={index}
        className={
          index === 0
            ? "text-sm leading-7 text-foreground md:text-base"
            : "mt-4 text-sm leading-7 text-foreground md:text-base"
        }
      >
        {isContact
          ? renderContactText(block)
          : renderInlineText(block)}
      </p>
    );
  });
}

export default async function TermsPage() {
  const page = await getSitePage("terms");

  const pageData = (page?.page_data ?? {}) as PageData;
  const savedSections = getLegalSections(pageData);
  const sections = savedSections.length
    ? savedSections
    : defaultSections;

  const title = getText(
    pageData,
    "heroTitle",
    page?.title || "Terms of Service",
  );

  const lastUpdated = getText(
    pageData,
    "lastUpdated",
    "October 7, 2026",
  );

  return (
    <div className="w-full">
      {/* Header */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
          <div className="border-b border-border pb-8">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted">
              Legal
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>

            <p className="mt-4 text-sm text-muted">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Terms Content */}
          <div className="mt-12 space-y-12">
            {sections.map((section, index) => {
              const isContact =
                section.heading?.trim().toLowerCase() ===
                "contact us";

              return (
                <section
                  key={`${section.heading}-${index}`}
                  className={
                    isContact
                      ? "border-t border-border pt-10"
                      : ""
                  }
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-sm font-semibold text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      {section.heading}
                    </h2>
                  </div>

                  {renderParagraphs(
                    section.body ?? "",
                    isContact,
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}