import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import CategoryTranslationsForm from "@/components/admin/categories/CategoryTranslationsForm";

export default async function CategoryTranslationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("id", id)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  const { data: englishTranslation } = await supabase
    .from("category_translations")
    .select("name")
    .eq("category_id", id)
    .eq("locale_code", "en")
    .maybeSingle();

  const { data: locales } = await supabase
    .from("locales")
    .select("code, name")
    .order("name");

  const { data: translations } = await supabase
    .from("category_translations")
    .select("category_id, locale_code, name")
    .eq("category_id", id);

  const categoryName = englishTranslation?.name ?? category.slug;

  return (
  <div className="min-h-full bg-light-bg">
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/categories"
            className="text-sm text-muted hover:text-foreground"
          >
            ← Back to Categories
          </Link>

          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            Category Translations
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage translations for{" "}
            <span className="font-medium text-foreground">
              {categoryName}
            </span>
          </p>
        </div>

        <Link
          href={`/admin/categories/${id}/edit`}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted-bg"
        >
          Edit Category
        </Link>
      </div>

      {/* Translation Form */}
      <CategoryTranslationsForm
        categoryId={id}
        categoryName={categoryName}
        locales={locales ?? []}
        translations={translations ?? []}
      />
    </div>
  </div>
);
}