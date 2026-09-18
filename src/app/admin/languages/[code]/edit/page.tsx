import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { Button } from "@/components/ui/button";
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
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}

          <div>
            <Link
              href="/admin/languages"
              className="text-sm text-muted transition hover:text-foreground"
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

          {/* Form */}

          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">
                Language Settings
              </h2>

              <p className="mt-1 text-sm text-muted">
                Update the basic settings for this language.
              </p>
            </div>

            <form
              action={updateLanguage}
              className="space-y-6 p-6"
            >
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
                  className="h-10 rounded-lg"
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
                  className="h-10 rounded-lg"
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
                  className="h-10 rounded-lg"
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

                  <p className="mt-1 text-xs text-muted">
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

                  <p className="mt-1 text-xs text-muted">
                    Only one language should normally be the
                    platform default.
                  </p>
                </div>
              </div>

              {/* Actions */}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/admin/languages"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted-bg"
                >
                  Cancel
                </Link>

                <Button
                  type="submit"
                  className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-background hover:opacity-90"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}