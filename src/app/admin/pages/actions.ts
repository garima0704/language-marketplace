"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_SLUGS = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type PageData = Record<string, unknown>;

type BuilderSection = {
type?: unknown;
data?: unknown;
};

function getReturnPath(id: string, slug: string, localeCode: string) {
const safeSlug = encodeURIComponent(slug || "new");
const safeLocale = encodeURIComponent(localeCode || "en");

return id
? `/admin/pages/${safeSlug}/edit?locale=${safeLocale}`
: `/admin/pages/new?locale=${safeLocale}`;
}

function redirectWithError(
id: string,
slug: string,
localeCode: string,
error: string,
): never {
redirect(
`${getReturnPath(id, slug, localeCode)}&error=${encodeURIComponent(error)}`,
);
}

function isRecord(value: unknown): value is Record<string, unknown> {
return (
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
);
}

function getString(value: unknown): string | undefined {
return typeof value === "string" ? value : undefined;
}

function getSections(pageData: PageData): BuilderSection[] {
if (!Array.isArray(pageData.sections)) {
return [];
}

return pageData.sections.filter(isRecord) as BuilderSection[];
}

function getSection(
sections: BuilderSection[],
type: string,
): PageData | undefined {
const section = sections.find((item) => item.type === type);

return isRecord(section?.data) ? section.data : undefined;
}

/**

* Keep the existing public page components compatible with the new builder.
* The public About page continues using its original JSX and CSS classes.
  */
  function syncLegacyPageData(slug: string, pageData: PageData): PageData {
  const sections = getSections(pageData);
  const result: PageData = { ...pageData };

if (slug !== "about") {
return result;
}

const hero = getSection(sections, "hero");

if (hero) {
const title = getString(hero.title);
const titleSecondLine = getString(hero.titleSecondLine);
const eyebrow = getString(hero.eyebrow);
const description = getString(hero.description);
const primaryLabel = getString(hero.primaryLabel);
const secondaryLabel = getString(hero.secondaryLabel);

if (eyebrow !== undefined) result.heroEyebrow = eyebrow;
if (description !== undefined) result.heroDescription = description;
if (primaryLabel !== undefined) result.heroPrimaryButton = primaryLabel;
if (secondaryLabel !== undefined) result.heroSecondaryButton = secondaryLabel;

if (title !== undefined) {
  // Keep the original two-line heading for the default About page.
  if (title === "Learn languages through real conversations.") {
    result.heroTitle = "Learn languages through";
    result.heroTitleSecondLine = "real conversations.";
  } else {
    result.heroTitle = title;

    if (titleSecondLine !== undefined) {
      result.heroTitleSecondLine = titleSecondLine;
    } else {
      result.heroTitleSecondLine = "";
    }
  }
}

const primaryUrl = getString(hero.primaryUrl);
const secondaryUrl = getString(hero.secondaryUrl);

if (primaryUrl !== undefined) result.heroPrimaryUrl = primaryUrl;
if (secondaryUrl !== undefined) result.heroSecondaryUrl = secondaryUrl;
}

const features = getSection(sections, "feature_cards");

if (features && Array.isArray(features.items)) {
const items = features.items.filter(isRecord);

items.slice(0, 3).forEach((item, index) => {
  const number = index + 1;
  const title = getString(item.title);
  const description = getString(item.description);

  if (title !== undefined) {
    result[`feature${["One", "Two", "Three"][index]}Title`] = title;
  }

  if (description !== undefined) {
    result[
      `feature${["One", "Two", "Three"][index]}Description`
    ] = description;
  }

  // Keep the existing page's fixed icons and visual layout unchanged.
  void number;
});
}

const mission = getSection(sections, "text");

if (mission) {
const eyebrow = getString(mission.eyebrow);
const title = getString(mission.title);

if (eyebrow !== undefined) result.approachEyebrow = eyebrow;
if (title !== undefined) result.missionTitle = title;

if (Array.isArray(mission.paragraphs)) {
  const first = getString(mission.paragraphs[0]);
  const second = getString(mission.paragraphs[1]);

  if (first !== undefined) result.missionParagraphOne = first;
  if (second !== undefined) result.missionParagraphTwo = second;
}
}

const cta = getSection(sections, "cta");

if (cta) {
const title = getString(cta.title);
const description = getString(cta.description);
const buttonLabel = getString(cta.buttonLabel);
const buttonUrl = getString(cta.buttonUrl);

if (title !== undefined) result.ctaTitle = title;
if (description !== undefined) result.ctaDescription = description;
if (buttonLabel !== undefined) result.ctaButton = buttonLabel;
if (buttonUrl !== undefined) result.ctaButtonUrl = buttonUrl;
}

return result;
}

export async function saveSitePage(formData: FormData) {
await requireAdmin();

const supabase = await createClient();

const id = String(formData.get("id") ?? "").trim();
const title = String(formData.get("title") ?? "").trim();

const slug = String(formData.get("slug") ?? "")
.trim()
.toLowerCase()
.replace(/^\/+|\/+$/g, "");

const localeCode = String(formData.get("locale_code") ?? "en")
.trim()
.toLowerCase();

const content = String(formData.get("content") ?? "");
const pageDataRaw = String(formData.get("page_data") ?? "{}");
const isPublished = formData.get("is_published") === "on";

if (!title || !slug || !localeCode) {
redirectWithError(id, slug, localeCode, "required");
}

if (!ALLOWED_SLUGS.test(slug)) {
redirectWithError(id, slug, localeCode, "slug");
}

let submittedPageData: PageData;

try {
const parsed: unknown = JSON.parse(pageDataRaw);

if (!isRecord(parsed)) {
  throw new Error("Page data must be a JSON object.");
}

submittedPageData = parsed;
} catch {
redirectWithError(id, slug, localeCode, "json");
}

const { data: locale, error: localeError } = await supabase
.from("locales")
.select("code")
.eq("code", localeCode)
.eq("is_active", true)
.maybeSingle();

if (localeError || !locale) {
redirectWithError(id, slug, localeCode, "locale");
}

let existingPageData: PageData = {};

if (id) {
const { data: existing, error: existingError } = await supabase
.from("site_pages")
.select("id, page_data")
.eq("id", id)
.maybeSingle();

if (existingError || !existing) {
  redirect("/admin/pages?error=not-found");
}

if (isRecord(existing.page_data)) {
  existingPageData = existing.page_data;
}
}

// Preserve previously stored fields while saving the builder sections.
const mergedPageData: PageData = {
...existingPageData,
...submittedPageData,
};

const pageData = syncLegacyPageData(slug, mergedPageData);

const values = {
title,
slug,
locale_code: localeCode,
content,
page_data: pageData,
is_published: isPublished,
updated_at: new Date().toISOString(),
};

if (id) {
const { error } = await supabase
.from("site_pages")
.update(values)
.eq("id", id);

if (error) {
  console.error("UPDATE SITE PAGE ERROR:", error);

  redirectWithError(
    id,
    slug,
    localeCode,
    error.code === "23505" ? "duplicate" : "save",
  );
}
} else {
const { error } = await supabase
.from("site_pages")
.insert(values);


if (error) {
  console.error("INSERT SITE PAGE ERROR:", error);

  redirectWithError(
    "",
    slug,
    localeCode,
    error.code === "23505" ? "duplicate" : "save",
  );
}
}

revalidatePath("/admin/pages");
revalidatePath(`/${slug}`);
revalidatePath("/privacy");
revalidatePath("/cookies");
revalidatePath("/terms");
revalidatePath("/about");
revalidatePath("/contact");

redirect("/admin/pages?saved=1");
}
