import Link from "next/link";
import { getSitePage } from "@/lib/sitePages";

type LegalSection = {
  heading?: string;
  body?: string;
};

type PageData = Record<string, unknown>;

function getText(
  data: Record<string, unknown>,
  key: string,
  fallback: string,
): string {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

function getLegalSections(pageData: PageData): LegalSection[] {
  const sections = pageData.sections;

  if (!Array.isArray(sections)) return [];

  const legalSection = sections.find(
    (section) =>
      section &&
      typeof section === "object" &&
      "type" in section &&
      section.type === "legal_sections",
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

  return legalSection.data.sections.filter(
    (item): item is LegalSection =>
      item !== null &&
      typeof item === "object" &&
      ("heading" in item || "body" in item),
  );
}

const defaultSections: LegalSection[] = [
  {
    heading: "Information We Collect",
    body: `We may collect information that you provide directly to us when you create an account, use NiceConvo, publish content, contact us, or interact with features on the platform.

• **Account information:** name, username, email address, profile image, and other information associated with your account.
• **Profile information:** information you choose to add to your NiceConvo profile.
• **Content and activity:** videos, creator content, interactions, and other activity associated with your use of the platform.
• **Support information:** information you provide when contacting us or requesting assistance.`,
  },
  {
    heading: "How We Use Your Information",
    body: `We use the information we collect to operate NiceConvo, provide services, communicate with users, and improve the platform.

• Provide and maintain NiceConvo.
• Manage user accounts and authentication.
• Provide access to videos, creator content, and platform features.
• Process subscriptions and other transactions where applicable.
• Communicate with you about your account and our services.
• Improve the functionality, security, and user experience of NiceConvo.`,
  },
  {
    heading: "Cookies and Similar Technologies",
    body: `NiceConvo may use cookies and similar technologies to maintain sessions, remember preferences, support authentication, and help the platform function properly.

Some cookies may be necessary for the website to provide core functionality and may not be optional.`,
  },
  {
    heading: "Authentication",
    body: "NiceConvo may provide email and password authentication and supported third-party authentication options. Information associated with authentication is used to securely manage your account and provide access to the platform.",
  },
  {
    heading: "Payments",
    body: "If NiceConvo offers paid subscriptions or other paid services, payments may be processed through third-party payment providers. Payment information may be handled directly by those providers and is subject to their applicable terms and privacy policies.",
  },
  {
    heading: "Information Sharing",
    body: `We do not sell your personal information. We may share information with trusted service providers that help us operate, maintain, secure, and improve NiceConvo.

Information may also be disclosed when required by law or when reasonably necessary to protect the rights, safety, or security of NiceConvo, our users, or others.`,
  },
  {
    heading: "Public Information",
    body: `Information that you choose to make public through your profile, creator page, videos, or other published content may be visible to other users and visitors.

**Please consider carefully what personal information you choose to publish publicly on NiceConvo.**`,
  },
  {
    heading: "Data Security",
    body: `We use reasonable technical and organizational measures designed to protect information against unauthorized access, alteration, disclosure, or destruction.

However, no online service can guarantee absolute security, and you should understand that transmitting information over the internet always carries some level of risk.`,
  },
  {
    heading: "Data Retention",
    body: "We retain information for as long as reasonably necessary to provide our services, maintain legitimate business records, resolve disputes, enforce agreements, and comply with applicable legal obligations.",
  },
  {
    heading: "Your Choices and Rights",
    body: `Depending on applicable law, you may have rights relating to your personal information.

• Request access to certain personal information.
• Request correction or updates to information.
• Request deletion of certain information where permitted.
• Manage the information you choose to make publicly available.`,
  },
  {
    heading: "Children's Privacy",
    body: "NiceConvo does not knowingly collect personal information from children in circumstances where such collection is prohibited by applicable law. If you believe that a child has provided personal information to us improperly, please contact us.",
  },
  {
    heading: "Third-Party Services",
    body: "NiceConvo may use third-party services for hosting, authentication, storage, payments, analytics, communications, and other platform functionality. These providers may process information as necessary to provide their services.",
  },
  {
    heading: "Changes to This Privacy Policy",
    body: 'We may update this Privacy Policy from time to time. When changes are made, we will update the "Last updated" date at the top of this page.',
  },
  {
    heading: "Contact Us",
    body: "If you have questions about this Privacy Policy or how your information is handled, please contact us through our Contact page.",
  },
];

function renderInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

function renderParagraphs(body: string) {
  const blocks = body
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const isBulletList = lines.every((line) => line.startsWith("• "));

    if (isBulletList) {
      return (
        <ul
          key={index}
          className="space-y-3 text-sm leading-7 text-foreground md:text-base"
        >
          {lines.map((line, lineIndex) => (
            <li key={lineIndex} className="flex gap-3">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
              <span>{renderInlineText(line.slice(2))}</span>
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
            : "text-sm leading-7 text-foreground md:text-base"
        }
      >
        {lines.map((line, lineIndex) => (
          <span key={lineIndex}>
            {lineIndex > 0 && <br />}
            {renderInlineText(line)}
          </span>
        ))}
      </p>
    );
  });
}

export default async function PrivacyPolicyPage() {
  const page = await getSitePage("privacy-policy");
  const pageData = (page?.page_data ?? {}) as PageData;
  const savedSections = getLegalSections(pageData);
  const sections = savedSections.length ? savedSections : defaultSections;

  const title = getText(
    pageData,
    "heroTitle",
    page?.title || "Privacy Policy",
  );
  const lastUpdated = getText(pageData, "lastUpdated", "October 7, 2026");

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

          {/* Privacy Content */}
          <div className="mt-12 space-y-12">
            {sections.map((section, index) => {
              const heading = section.heading?.trim() || "Untitled Section";
              const body = section.body?.trim() || "";
              const isContactSection =
                heading.toLowerCase() === "contact us";

              return (
                <section
                  key={`${index}-${heading}`}
                  className={
                    isContactSection
                      ? "border-t border-border pt-10"
                      : undefined
                  }
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-sm font-semibold text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      {heading}
                    </h2>
                  </div>

                  {isContactSection ? (
                    <div className="space-y-4">
                      {renderParagraphs(
                        body ||
                          "If you have questions about this Privacy Policy or how your information is handled, please contact us through our Contact page.",
                      )}

                      {!body.toLowerCase().includes("contact page") &&
                        !body.toLowerCase().includes("/contact") && (
                          <p className="text-sm leading-7 text-foreground md:text-base">
                            <Link
                              href="/contact"
                              className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
                            >
                              Contact page
                            </Link>
                          </p>
                        )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {renderParagraphs(body)}
                    </div>
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