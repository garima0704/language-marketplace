
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import PageForm from "@/components/admin/pages/PageForm";

type Props = {
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

export default async function NewPage({ searchParams }: Props) {
  await requireAdmin();

  const params = await searchParams;
  const supabase = await createClient();

  const { data: locales, error } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("ACTIVE LOCALES FETCH ERROR:", error);
    throw new Error("Failed to load active languages.");
  }

  const availableLocales = locales ?? [];
  const selectedLocale =
    availableLocales.find((locale) => locale.code === params.locale)?.code ??
    availableLocales.find((locale) => locale.code === "en")?.code ??
    availableLocales[0]?.code ??
    "en";

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Add Page
          </h1>
          <p className="mt-1 text-sm text-muted">
            Create a website page or a new language version.
          </p>
        </div>

        <PageForm
          locales={availableLocales}
          selectedLocale={selectedLocale}
          errorMessage={getErrorMessage(params.error)}
        />
      </div>
    </div>
  );
}