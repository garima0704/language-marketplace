import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function NewRegionPage({
  params,
}: PageProps) {
  const { code } = await params;

  const { supabase } = await requireAdmin();

  // --------------------------------------------------
  // Fetch language
  // --------------------------------------------------

  const { data: language, error: languageError } =
    await supabase
      .from("locales")
      .select("code, name")
      .eq("code", code)
      .maybeSingle();

  if (languageError) {
    console.error(
      "NEW REGION LANGUAGE FETCH ERROR:",
      languageError
    );
  }

  if (!language) {
    notFound();
  }

  // --------------------------------------------------
  // Create region
  // --------------------------------------------------

  async function createRegion(formData: FormData) {
    "use server";

    const { supabase } = await requireAdmin();

    const country = String(
      formData.get("country") ?? ""
    ).trim();

    const stateValue = String(
      formData.get("state") ?? ""
    ).trim();

    const state = stateValue || null;

    const sortOrderValue = String(
      formData.get("sort_order") ?? "0"
    );

    const sortOrder =
      Number.parseInt(sortOrderValue, 10) || 0;

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (!country) {
      throw new Error(
        "Country is required."
      );
    }

    if (sortOrder < 0) {
      throw new Error(
        "Sort order cannot be negative."
      );
    }

    // --------------------------------------------------
    // Check for duplicate region
    // --------------------------------------------------

    let duplicateQuery = supabase
      .from("language_regions")
      .select("id")
      .eq("language_code", code)
      .eq("country", country);

    if (state) {
      duplicateQuery = duplicateQuery.eq(
        "state",
        state
      );
    } else {
      duplicateQuery = duplicateQuery.is(
        "state",
        null
      );
    }

    const {
      data: existingRegion,
      error: duplicateError,
    } = await duplicateQuery.maybeSingle();

    if (duplicateError) {
      console.error(
        "CHECK REGION DUPLICATE ERROR:",
        duplicateError
      );

      throw new Error(
        "Unable to check whether this region already exists."
      );
    }

    if (existingRegion) {
      throw new Error(
        state
          ? `A region for ${country}, ${state} already exists.`
          : `A region for ${country} already exists.`
      );
    }

    // --------------------------------------------------
    // Insert region
    // --------------------------------------------------

    const { error } = await supabase
      .from("language_regions")
      .insert({
        language_code: code,
        country,
        state,
        sort_order: sortOrder,
      });

    if (error) {
      console.error(
        "CREATE REGION ERROR:",
        error
      );

      if (error.code === "23505") {
        throw new Error(
          "This region already exists."
        );
      }

      throw new Error(
        error.message ||
          "Unable to create region."
      );
    }

    redirect("/admin/languages");
  }

  return (
    <div className="min-h-full bg-light-bg">
      <div className="mx-auto max-w-3xl p-6">

        {/* ------------------------------------------------ */}
        {/* Header */}
        {/* ------------------------------------------------ */}

        <div className="mb-6">
          <Link
            href="/admin/languages"
            className="text-sm text-muted hover:text-foreground"
          >
            ← Back to Languages
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-semibold text-foreground">
              Add Region
            </h1>

            <p className="mt-1 text-sm text-muted">
              Add a region for {language.name}.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------ */}
        {/* Form */}
        {/* ------------------------------------------------ */}

        <Card className="bg-white p-6">
          <form
            action={createRegion}
            className="space-y-6"
          >
            {/* Language */}
            <div className="space-y-2">
              <Label>
                Language
              </Label>

              <div className="rounded-md border border-border bg-light-bg px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {language.name}
                  </span>

                  <span className="rounded bg-muted-bg px-2 py-0.5 text-xs font-medium text-muted">
                    {language.code}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted">
                This region will be added to {language.name}.
              </p>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">
                Country
              </Label>

              <Input
                id="country"
                name="country"
                placeholder="e.g. United States"
                required
              />

              <p className="text-xs text-muted">
                Enter the country associated with this region.
              </p>
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">
                State / Province
              </Label>

              <Input
                id="state"
                name="state"
                placeholder="e.g. California"
              />

              <p className="text-xs text-muted">
                Optional. Leave empty if the region applies
                to the entire country.
              </p>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="sort_order">
                Display Order
              </Label>

              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                min="0"
                defaultValue="0"
              />

              <p className="text-xs text-muted">
                Lower numbers appear first.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
              <Link
                href="/admin/languages"
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-light-bg"
              >
                Cancel
              </Link>

              <Button type="submit">
                Create Region
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}