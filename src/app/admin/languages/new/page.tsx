import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function NewLanguagePage() {
  const { supabase } = await requireAdmin();

  async function createLanguage(formData: FormData) {
    "use server";

    const { supabase } = await requireAdmin();

    const name = String(
      formData.get("name") ?? ""
    ).trim();

    const code = String(
      formData.get("code") ?? ""
    )
      .trim()
      .toLowerCase();

    const isActive =
      formData.get("is_active") === "on";

    const isDefault =
      formData.get("is_default") === "on";

    const displayOrderValue = String(
      formData.get("display_order") ?? "0"
    );

    const displayOrder =
      Number.parseInt(displayOrderValue, 10) || 0;

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (!name) {
      throw new Error(
        "Language name is required."
      );
    }

    if (!code) {
      throw new Error(
        "Language code is required."
      );
    }

    if (
      !/^[a-z]{2,10}(-[a-z]{2,10})?$/.test(
        code
      )
    ) {
      throw new Error(
        "Invalid language code. Example: en, es, fr, de, zh."
      );
    }

    // --------------------------------------------------
    // Make this language the only default
    // --------------------------------------------------

    if (isDefault) {
      const { error: defaultError } =
        await supabase
          .from("locales")
          .update({
            is_default: false,
          })
          .eq("is_default", true);

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
    // Insert language
    // --------------------------------------------------

    const { error } = await supabase
      .from("locales")
      .insert({
        code,
        name,
        is_default: isDefault,
        is_active: isActive,
        display_order: displayOrder,
      });

    if (error) {
      console.error(
        "CREATE LANGUAGE ERROR:",
        error
      );

      if (error.code === "23505") {
        throw new Error(
          "A language with this code already exists."
        );
      }

      throw new Error(
        error.message ||
          "Unable to create language."
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
                Add Language
              </h1>

              <p className="mt-1 text-sm text-muted">
                Add a new master language to NiceConvo.
              </p>
            </div>
          </div>

          {/* Form */}

          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">
                Language Details
              </h2>

              <p className="mt-1 text-sm text-muted">
                Configure the basic settings for this language.
              </p>
            </div>

            <form
              action={createLanguage}
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
                  placeholder="e.g. Spanish"
                  required
                  className="h-10 rounded-lg"
                />

                <p className="text-xs text-muted">
                  The name shown to users.
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
                  placeholder="e.g. es"
                  maxLength={10}
                  required
                  className="h-10 rounded-lg"
                />

                <p className="text-xs text-muted">
                  Use a language code such as{" "}
                  <span className="font-medium">
                    en, es, fr, de, zh
                  </span>
                  .
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
                  defaultValue="0"
                  min="0"
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
                  defaultChecked
                  className="mt-1 h-4 w-4 rounded border-border"
                />

                <div>
                  <Label htmlFor="is_active">
                    Active
                  </Label>

                  <p className="mt-1 text-xs text-muted">
                    Active languages can be used throughout
                    NiceConvo.
                  </p>
                </div>
              </div>

              {/* Default */}

              <div className="flex items-start gap-3">
                <input
                  id="is_default"
                  name="is_default"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-border"
                />

                <div>
                  <Label htmlFor="is_default">
                    Default Language
                  </Label>

                  <p className="mt-1 text-xs text-muted">
                    Set this as the default language for
                    the platform.
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
                  Create Language
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}