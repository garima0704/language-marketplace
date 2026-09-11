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

export default async function EditLanguagePage({
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
      .select(
        "code, name, is_default, is_active, display_order"
      )
      .eq("code", code)
      .maybeSingle();

  if (languageError) {
    console.error(
      "EDIT LANGUAGE FETCH ERROR:",
      languageError
    );
  }

  if (!language) {
    notFound();
  }

  // --------------------------------------------------
  // Update language
  // --------------------------------------------------

  async function updateLanguage(formData: FormData) {
    "use server";

    const { supabase } = await requireAdmin();

    const name = String(
      formData.get("name") ?? ""
    ).trim();

    const isActive =
      formData.get("is_active") === "on";

    const isDefault =
      formData.get("is_default") === "on";

    const displayOrderValue = String(
      formData.get("display_order") ?? "0"
    );

    const displayOrder =
      Number.parseInt(displayOrderValue, 10) || 0;

    if (!name) {
      throw new Error(
        "Language name is required."
      );
    }

    // --------------------------------------------------
    // If setting this language as default,
    // remove default from all other languages.
    // --------------------------------------------------

    if (isDefault) {
      const { error: defaultError } =
        await supabase
          .from("locales")
          .update({
            is_default: false,
          })
          .eq("is_default", true)
          .neq("code", code);

      if (defaultError) {
        console.error(
          "RESET DEFAULT LANGUAGE ERROR:",
          defaultError
        );

        throw new Error(
          "Unable to update the default language."
        );
      }
    }

    // --------------------------------------------------
    // Update language
    // --------------------------------------------------

    const { error } = await supabase
      .from("locales")
      .update({
        name,
        is_active: isActive,
        is_default: isDefault,
        display_order: displayOrder,
      })
      .eq("code", code);

    if (error) {
      console.error(
        "UPDATE LANGUAGE ERROR:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to update language."
      );
    }

    redirect("/admin/languages");
  }

  return (
    <div className="min-h-full bg-light-bg">
      <div className="mx-auto max-w-4xl p-6">

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
              Edit Language
            </h1>

            <p className="mt-1 text-sm text-muted">
              Manage the language settings and regions.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------ */}
        {/* Language Settings */}
        {/* ------------------------------------------------ */}

        <Card className="bg-white p-6">
          <form
            action={updateLanguage}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Language Settings
              </h2>

              <p className="mt-1 text-sm text-muted">
                Update the basic settings for this language.
              </p>
            </div>

            {/* Language Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Language Name
              </Label>

              <Input
                id="name"
                name="name"
                defaultValue={language.name}
                placeholder="e.g. Spanish"
                required
              />

              <p className="text-xs text-muted">
                This is the name displayed to users.
              </p>
            </div>

            {/* Language Code */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Language Code
              </Label>

              <Input
                id="code"
                name="code"
                value={language.code}
                disabled
                readOnly
              />

              <p className="text-xs text-muted">
                The language code cannot be changed because
                it is used by language regions and other
                parts of the platform.
              </p>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="display_order">
                Display Order
              </Label>

              <Input
                id="display_order"
                name="display_order"
                type="number"
                min="0"
                defaultValue={language.display_order}
              />

              <p className="text-xs text-muted">
                Lower numbers appear first.
              </p>
            </div>

            {/* Active */}
            <div className="flex items-start gap-3">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                defaultChecked={language.is_active}
                className="mt-1 h-4 w-4 rounded border-border"
              />

              <div>
                <Label htmlFor="is_active">
                  Active
                </Label>

                <p className="text-xs text-muted">
                  Active languages can be selected and used
                  throughout NiceConvo.
                </p>
              </div>
            </div>

            {/* Default */}
            <div className="flex items-start gap-3">
              <input
                id="is_default"
                name="is_default"
                type="checkbox"
                defaultChecked={language.is_default}
                className="mt-1 h-4 w-4 rounded border-border"
              />

              <div>
                <Label htmlFor="is_default">
                  Default Language
                </Label>

                <p className="text-xs text-muted">
                  Only one language should normally be the
                  platform default.
                </p>
              </div>
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
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}