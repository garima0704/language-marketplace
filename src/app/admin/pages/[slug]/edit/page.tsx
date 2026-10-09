
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import PageForm from "@/components/admin/pages/PageForm";
import PageBuilder from "@/components/admin/pages/PageBuilder";
import { getPageBuilderConfig } from "@/lib/page-builder/configs";
import type { SitePageRecord } from "@/lib/page-builder/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    locale?: string;
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "required":
      return "Please fill in all required fields.";
    case "slug":
      return "Use a valid slug with lowercase letters, numbers, and hyphens.";
    case "json":
      return "Page data must be valid JSON with an object at the top level.";
    case "locale":
      return "Please select an active language.";
    case "duplicate":
      return "A page with this slug already exists in that language.";
    case "save":
      return "The page could not be saved. Please try again.";
    default:
      return undefined;
  }
}

export default async function EditPage({
  params,
  searchParams,
}: Props) {
  await requireAdmin();

  const [{ slug }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  const supabase = await createClient();

  const { data: locales, error: localesError } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (localesError) {
    console.error("ACTIVE LOCALES FETCH ERROR:", localesError);
    throw new Error("Failed to load active languages.");
  }

  const availableLocales = locales ?? [];
  const selectedLocale =
    query.locale ??
    availableLocales.find((locale) => locale.code === "en")?.code ??
    "en";

  const { data: page, error } = await supabase
    .from("site_pages")
    .select(
      "id, title, slug, content, page_data, locale_code, is_published",
    )
    .eq("slug", slug)
    .eq("locale_code", selectedLocale)
    .maybeSingle();

  if (error) {
    console.error("EDIT SITE PAGE FETCH ERROR:", error);
    throw new Error("Failed to load the page.");
  }

  if (!page) notFound();

  const sitePage: SitePageRecord = {
    ...page,
    page_data:
      page.page_data &&
      typeof page.page_data === "object" &&
      !Array.isArray(page.page_data)
        ? (page.page_data as Record<string, unknown>)
        : {},
  };

  const config = getPageBuilderConfig(sitePage.slug);
  const errorMessage = getErrorMessage(query.error);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            {config ? `Edit ${config.label} Page` : "Edit Page"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {config
              ? config.description
              : "Update the page content, language, and publishing status."}
          </p>
        </div>

        {config ? (
          <PageBuilder
            page={sitePage}
            locales={availableLocales}
            selectedLocale={sitePage.locale_code}
            config={config}
            errorMessage={errorMessage}
          />
        ) : (
          <PageForm
            page={sitePage}
            locales={availableLocales}
            selectedLocale={sitePage.locale_code}
            errorMessage={errorMessage}
          />
        )}
      </div>
    </div>
  );
}