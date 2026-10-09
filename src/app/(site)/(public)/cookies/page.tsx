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
heading: "What Are Cookies?",
body: "Cookies are small text files that websites store on your device when you visit them. They allow websites to remember information about your visit and help provide a consistent and useful experience.\n\nNiceConvo may use cookies and similar technologies to support authentication, remember preferences, maintain sessions, and understand how the platform is used.",
},
{
heading: "How We Use Cookies",
body: "NiceConvo may use cookies for several purposes, including:\n\n• Keeping you signed in and maintaining your authentication session.\n• Remembering preferences and settings you choose.\n• Supporting the functionality and security of the platform.\n• Understanding how users interact with NiceConvo so we can improve the service.",
},
{
heading: "Types of Cookies We May Use",
body: "The cookies used by NiceConvo may generally fall into the following categories.\n\nEssential Cookies\nThese cookies are necessary for core features of the website, such as authentication, account access, session management, and security. Without these cookies, certain parts of NiceConvo may not function properly.\n\nPreference Cookies\nThese cookies may remember choices such as language or other preferences so that NiceConvo can provide a more consistent experience.\n\nAnalytics Cookies\nWhere analytics services are used, cookies may help us understand website usage, traffic patterns, and general interaction with NiceConvo. This information can help us improve the platform.",
},
{
heading: "Authentication and Session Cookies",
body: "When you sign in to NiceConvo, cookies may be used to maintain your authenticated session and allow you to move between pages without having to sign in repeatedly.\n\nThese cookies are an important part of providing secure access to account features.",
},
{
heading: "Third-Party Cookies",
body: "Some services used by NiceConvo may place their own cookies or use similar technologies when their functionality is integrated into the platform.\n\nThese services may include providers used for authentication, analytics, payments, hosting, communications, or other platform functionality. Their use of cookies is governed by their own privacy policies and terms.",
},
{
heading: "Managing Cookies",
body: "Most web browsers allow you to control cookies through their settings. You may be able to block, delete, or restrict cookies stored on your device.\n\nHowever, disabling certain cookies may affect the functionality of NiceConvo. In particular, cookies required for authentication or security may be necessary for certain features to work correctly.",
},
{
heading: "Local Storage and Similar Technologies",
body: "NiceConvo may also use technologies such as local storage or similar browser-based mechanisms to store certain preferences or information needed for the operation of the platform.\n\nThese technologies may function differently from traditional cookies but can serve similar purposes.",
},
{
heading: "Changes to This Cookie Policy",
body: 'We may update this Cookie Policy from time to time to reflect changes to our services, technologies, or legal requirements.\n\nWhen we make changes, we will update the "Last updated" date at the top of this page.',
},
{
heading: "Contact Us",
body: "If you have questions about this Cookie Policy or how cookies and similar technologies are used on NiceConvo, please contact us through our Contact page.",
},
];

function renderParagraphs(body: string) {
return body.split(/\n\n+/).map((paragraph, index) => {
const lines = paragraph.split("\n");

return (
  <p
    key={`${index}-${paragraph.slice(0, 20)}`}
    className={
      index === 0
        ? "text-sm leading-7 text-foreground md:text-base"
        : "mt-4 text-sm leading-7 text-foreground md:text-base"
    }
  >
    {lines.map((line, lineIndex) => (
      <span key={lineIndex}>
        {lineIndex > 0 && <br />}
        {line.startsWith("• ") ? `• ${line.slice(2)}` : line}
      </span>
    ))}
  </p>
);
});
}

export default async function CookiePolicyPage() {
const page = await getSitePage("cookie-policy");
const pageData = (page?.page_data ?? {}) as PageData;
const legalSections = getLegalSections(pageData);
const sections = legalSections.length ? legalSections : defaultSections;

const title = getText(pageData, "heroTitle", page?.title || "Cookie Policy");
const lastUpdated = getText(pageData, "lastUpdated", "October 7, 2026");

return ( <div className="w-full"> <section> <div className="mx-auto max-w-4xl px-6 py-14 md:py-20"> <div className="border-b border-border pb-8"> <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted">
Legal </p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>

        <p className="mt-4 text-sm text-muted">
          Last updated: {lastUpdated}
        </p>
      </div>

      <div className="mt-12 space-y-12">
        {sections.map((section, index) => {
          const heading = section.heading?.trim() || "Untitled Section";
          const body = section.body?.trim() || "";

          return (
            <section
              key={`${index}-${heading}`}
              className={
                index === sections.length - 1
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

              {index === sections.length - 1 &&
              heading.toLowerCase() === "contact us" ? (
                <p className="text-sm leading-7 text-foreground md:text-base">
                  {body ||
                    "If you have questions about this Cookie Policy or how cookies and similar technologies are used on NiceConvo, please contact us through our Contact page."}{" "}
                  {!body.toLowerCase().includes("contact page") &&
                    !body.toLowerCase().includes("/contact") && (
                      <Link
                        href="/contact"
                        className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
                      >
                        Contact page
                      </Link>
                    )}
                </p>
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
