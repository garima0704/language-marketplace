import type {
PageBuilderConfig,
PageSection,
PageSectionType,
} from "./types";

const aboutSections: PageSection[] = [
{
id: "about-hero",
type: "hero",
enabled: true,
data: {
eyebrow: "About NiceConvo",
title: "Learn languages through real conversations.",
description:
"Practical language learning through video content created around real situations, useful topics, and everyday communication.",
primaryLabel: "Explore Videos",
primaryUrl: "/",
secondaryLabel: "Meet Creators",
secondaryUrl: "/sellers",
},
},
{
id: "about-features",
type: "feature_cards",
enabled: true,
data: {
title: "",
items: [
{
title: "Real Conversations",
description:
"Learn from language used in meaningful, everyday situations.",
icon: "message-circle",
},
{
title: "Practical Video Learning",
description:
"Explore video content built around useful topics and communication.",
icon: "play",
},
{
title: "Learn From Creators",
description:
"Discover content created by people who share their knowledge.",
icon: "users",
},
],
},
},
{
id: "about-mission",
type: "text",
enabled: true,
data: {
eyebrow: "Our Approach",
title:
"Language learning should feel useful, practical, and connected to real life.",
paragraphs: [
"Learning a language is about more than memorising words. It is about understanding how people communicate in everyday situations.",
"NiceConvo is built around that idea, bringing practical language-learning videos and creators together in one place.",
],
style: "muted",
},
},
{
id: "about-cta",
type: "cta",
enabled: true,
data: {
title: "Ready to start learning?",
description:
"Explore language-learning videos and discover conversations created for practical learning.",
buttonLabel: "Explore NiceConvo",
buttonUrl: "/",
},
},
];

const contactSections: PageSection[] = [
{
id: "contact-hero",
type: "hero",
enabled: true,
data: {
eyebrow: "Contact NiceConvo",
title: "We'd love to hear from you.",
description:
"Have a question, feedback, or need help with NiceConvo? Send us a message and we'll get back to you.",
primaryLabel: "",
primaryUrl: "",
secondaryLabel: "",
secondaryUrl: "",
},
},
{
id: "contact-details",
type: "contact_details",
enabled: true,
data: {
eyebrow: "Get In Touch",
title: "How can we help?",
description:
"Whether you are a learner, creator, or simply exploring NiceConvo, we're happy to hear from you.",
items: [
{
label: "Email",
value: "[support@niceconvo.com](mailto:support@niceconvo.com)",
},
{
label: "General Questions",
value:
"For questions about learning, creators, videos, subscriptions, or your account, use the form and we'll help you find the right answer.",
},
],
},
},
{
id: "contact-form",
type: "contact_form",
enabled: true,
data: {
title: "Send us a message",
description:
"Fill out the form below and we'll get back to you.",
},
},
{
id: "contact-cta",
type: "cta",
enabled: true,
data: {
title: "Ready to start learning?",
description:
"Explore language-learning videos and discover conversations created for practical learning.",
buttonLabel: "Explore NiceConvo",
buttonUrl: "/",
},
},
];

const legalSections: PageSectionType[] = [
"hero",
"text",
"legal_sections",
];

const cookiePolicySections: PageSection[] = [
{
id: "cookie-policy-content",
type: "legal_sections",
enabled: true,
data: {
title: "Cookie Policy",
sections: [
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
],
},
},
];


const privacyPolicySections: PageSection[] = [
  {
    id: "privacy-policy-content",
    type: "legal_sections",
    enabled: true,
    data: {
      title: "Privacy Policy",
      sections: [
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
      ],
    },
  },
];

const termsSections: PageSection[] = [
  {
    id: "terms-content",
    type: "legal_sections",
    enabled: true,
    data: {
      title: "Terms of Service",
      sections: [
        {
          heading: "Acceptance of These Terms",
          body: "By accessing or using NiceConvo, you agree to be bound by these Terms of Service and any applicable policies referenced in them. If you do not agree with these terms, please do not use NiceConvo.\n\nThese Terms apply to visitors, registered users, subscribers, creators, and other users of the platform.",
        },
        {
          heading: "About NiceConvo",
          body: "NiceConvo is a platform designed to help people discover, watch, publish, and learn from language-related video content.\n\nFeatures and services available through NiceConvo may change over time. We may add, modify, suspend, or discontinue features at our discretion.",
        },
        {
          heading: "Accounts",
          body: "Some NiceConvo features require you to create an account. You are responsible for providing accurate information and for keeping your account credentials secure.\n\nYou are responsible for activity that occurs through your account. If you believe your account has been accessed without authorization, please contact us as soon as possible.",
        },
        {
          heading: "User Content",
          body: "NiceConvo may allow users and creators to upload, publish, or otherwise share videos, profile information, descriptions, comments, and other content.\n\nYou retain ownership of content that you create and provide to NiceConvo. However, by publishing content on the platform, you grant NiceConvo the permissions reasonably necessary to host, store, display, reproduce, distribute, and make that content available through the platform.\n\nYou are responsible for ensuring that you have the necessary rights and permissions for any content you upload or publish.",
        },
        {
          heading: "Prohibited Content and Conduct",
          body: "You agree not to use NiceConvo to upload, publish, distribute, or promote content or activity that is unlawful, harmful, fraudulent, abusive, or otherwise violates these Terms.\n\n• Content that violates applicable laws or regulations.\n• Content that infringes another person's intellectual property or other rights.\n• Harassment, threats, abuse, or targeted harmful behavior.\n• Fraudulent, deceptive, or misleading activity.\n• Attempts to interfere with, damage, or gain unauthorized access to the platform or another user's account.\n• Automated or abusive activity that places unreasonable demands on NiceConvo.",
        },
        {
          heading: "Creator Content",
          body: "Creators are responsible for the content they publish, including its accuracy, legality, quality, and compliance with these Terms.\n\nNiceConvo does not guarantee the accuracy, completeness, or educational value of content published by individual creators. Content available on the platform represents the views and responsibility of the creator who published it.",
        },
        {
          heading: "Subscriptions and Payments",
          body: "NiceConvo may offer paid subscriptions, creator content, or other paid features. Prices, billing terms, and available features will be presented to you before you complete a purchase.\n\nPayments may be processed through third-party payment providers. Their terms and policies may also apply to your transaction.\n\nWhere applicable, subscription charges may automatically renew according to the terms presented at the time of purchase unless you cancel before the applicable renewal date.",
        },
        {
          heading: "Intellectual Property",
          body: "NiceConvo and its original platform features, software, design, branding, text, graphics, and other materials are protected by applicable intellectual property laws.\n\nExcept where expressly permitted, you may not copy, modify, distribute, sell, lease, reverse engineer, or otherwise exploit NiceConvo's proprietary materials without appropriate authorization.",
        },
        {
          heading: "Copyright Complaints",
          body: "If you believe content available on NiceConvo infringes your copyright or other intellectual property rights, please contact us with sufficient information to identify the material and explain the basis of your claim.",
        },
        {
          heading: "Content Moderation",
          body: "We may review, restrict, remove, or disable access to content or accounts when we reasonably believe that content or activity violates these Terms, applicable law, or the safety of the platform and its users.\n\nWe may also take action against accounts involved in abuse, fraud, security violations, or other activity that may harm NiceConvo or its users.",
        },
        {
          heading: "Third-Party Services and Links",
          body: "NiceConvo may integrate with or link to third-party services. These services may have their own terms, privacy policies, and practices.\n\nWe are not responsible for the availability, content, or practices of third-party services that are outside our control.",
        },
        {
          heading: "Availability of the Service",
          body: "We aim to keep NiceConvo available and reliable, but we do not guarantee that the platform will always be available, uninterrupted, secure, or free from errors.\n\nThe platform may occasionally be unavailable because of maintenance, updates, technical problems, security incidents, or circumstances outside our reasonable control.",
        },
        {
          heading: "Disclaimer",
          body: "NiceConvo is provided on an \"as is\" and \"as available\" basis to the extent permitted by applicable law.\n\nWe do not guarantee that the platform or its content will always be accurate, complete, reliable, secure, or suitable for a particular purpose.",
        },
        {
          heading: "Limitation of Liability",
          body: "To the maximum extent permitted by applicable law, NiceConvo and its operators, affiliates, service providers, and representatives will not be liable for indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the platform.",
        },
        {
          heading: "Account Suspension or Termination",
          body: "You may stop using NiceConvo at any time. We may suspend or terminate access to an account when reasonably necessary, including when an account or its activity violates these Terms or creates a risk to NiceConvo or its users.\n\nCertain provisions of these Terms may continue to apply after termination, including provisions relating to intellectual property, liability, and other rights or obligations that by their nature should survive termination.",
        },
        {
          heading: "Changes to These Terms",
          body: "We may update these Terms from time to time to reflect changes to NiceConvo, our services, or applicable legal requirements.\n\nWhen changes are made, we will update the \"Last updated\" date at the top of this page. Your continued use of NiceConvo after updated Terms become effective means that you accept the revised Terms to the extent permitted by law.",
        },
        {
          heading: "Governing Law",
          body: "These Terms are subject to the laws applicable to NiceConvo and its operations, without regard to conflict-of-law principles, except where applicable law requires otherwise.",
        },
        {
          heading: "Contact Us",
          body: "If you have questions about these Terms of Service, please contact us through our Contact page.",
        },
      ],
    },
  },
];

export const pageBuilderConfigs: Record<string, PageBuilderConfig> = {
about: {
  slug: "about",
  label: "About",
  description: "Manage the About page sections and content.",
  allowedSections: ["hero", "feature_cards", "text", "cta"],
  defaultSections: aboutSections,
},

contact: {
  slug: "contact",
  label: "Contact",
  description: "Manage the contact page sections and content.",
  allowedSections: [
  "hero",
  "contact_details",
  "contact_form",
  "cta",
  ],
  defaultSections: contactSections,
},

"privacy-policy": {
  slug: "privacy-policy",
  label: "Privacy Policy",
  description: "Manage the privacy policy content.",
  allowedSections: legalSections,
  defaultSections: privacyPolicySections,
},

"cookie-policy": {
  slug: "cookie-policy",
  label: "Cookies",
  description: "Manage the cookie policy content.",
  allowedSections: legalSections,
  defaultSections: cookiePolicySections,
},

terms: {
  slug: "terms",
  label: "Terms of Service",
  description: "Manage the terms of service content.",
  allowedSections: legalSections,
  defaultSections: termsSections,
},
};

export function getPageBuilderConfig(
slug: string,
): PageBuilderConfig | null {
return pageBuilderConfigs[slug] ?? null;
}
