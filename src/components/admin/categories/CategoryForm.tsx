"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import {
  createCategory,
  updateCategory,
} from "@/app/actions/admin/categories";

type ParentOption = {
  id: string;
  name: string;
  level: number;
};

type CategoryFormProps = {
  mode: "create" | "edit";
  categoryId?: string;

  initialName?: string;
  initialParentId?: string | null;
  initialDisplayOrder?: number;
  initialIsActive?: boolean;

  parentOptions: ParentOption[];
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryForm({
  mode,
  categoryId,
  initialName = "",
  initialParentId = null,
  initialDisplayOrder = 0,
  initialIsActive = true,
  parentOptions,
}: CategoryFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [parentId, setParentId] = useState<string | null>(
    initialParentId
  );
  const [displayOrder, setDisplayOrder] = useState(
    initialDisplayOrder
  );
  const [isActive, setIsActive] = useState(initialIsActive);

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const generatedSlug = useMemo(
    () => slugify(name),
    [name]
  );

  const selectedParent = parentOptions.find(
    (parent) => parent.id === parentId
  );

  const calculatedLevel = selectedParent
    ? selectedParent.level + 1
    : 1;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("English category name is required.");
      return;
    }

    if (!generatedSlug) {
      setError(
        "A valid URL slug could not be generated from this name."
      );
      return;
    }

    if (calculatedLevel > 4) {
      setError(
        "Categories can only be nested up to 4 levels."
      );
      return;
    }

    startTransition(async () => {
      const input = {
        name: trimmedName,
        parentId,
        displayOrder: Number(displayOrder) || 0,
        isActive,
      };

      const result =
        mode === "create"
          ? await createCategory(input)
          : await updateCategory(categoryId!, input);

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      router.push("/admin/categories");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-background"
    >
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-base font-semibold text-foreground">
          {mode === "create"
            ? "Create Category"
            : "Edit Category"}
        </h2>

        <p className="mt-1 text-sm text-muted">
          The English name is the master category name.
          Translations can be managed separately.
        </p>
      </div>

      <div className="space-y-6 p-6">
        {/* --------------------------------------------------
            English Name
        -------------------------------------------------- */}

        <div>
          <label
            htmlFor="category-name"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            English Category Name
          </label>

          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="e.g. Medical"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary"
          />

          <p className="mt-2 text-xs text-muted">
            This name is used to generate the category slug
            automatically.
          </p>
        </div>

        {/* --------------------------------------------------
            Generated Slug
        -------------------------------------------------- */}

        <div>
          <label
            htmlFor="category-slug"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            URL Slug
          </label>

          <input
            id="category-slug"
            type="text"
            value={generatedSlug}
            readOnly
            className="w-full cursor-not-allowed rounded-lg border border-border bg-muted-bg px-3 py-2.5 text-sm text-muted outline-none"
          />

          <p className="mt-2 text-xs text-muted">
            Generated automatically. Admin cannot edit the slug.
          </p>
        </div>

        {/* --------------------------------------------------
            Parent
        -------------------------------------------------- */}

        <div>
          <label
            htmlFor="category-parent"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Parent Category
          </label>

          <select
            id="category-parent"
            value={parentId ?? ""}
            onChange={(event) =>
              setParentId(event.target.value || null)
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
          >
            <option value="">
              No Parent — Main Category
            </option>

            {parentOptions.map((parent) => (
              <option
                key={parent.id}
                value={parent.id}
              >
                {"— ".repeat(parent.level - 1)}
                {parent.name}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-muted">
            Choose a parent to place this category inside
            the existing hierarchy.
          </p>
        </div>

        {/* --------------------------------------------------
            Level
        -------------------------------------------------- */}

        <div>
          <label
            htmlFor="category-level"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Category Level
          </label>

          <input
            id="category-level"
            type="text"
            value={`Level ${calculatedLevel}`}
            readOnly
            className="w-full cursor-not-allowed rounded-lg border border-border bg-muted-bg px-3 py-2.5 text-sm text-muted outline-none"
          />

          <p className="mt-2 text-xs text-muted">
            Level is calculated automatically from the parent.
            Maximum level is 4.
          </p>
        </div>

        {/* --------------------------------------------------
            Display Order
        -------------------------------------------------- */}

        <div>
          <label
            htmlFor="category-order"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Display Order
          </label>

          <input
            id="category-order"
            type="number"
            min="0"
            value={displayOrder}
            onChange={(event) =>
              setDisplayOrder(Number(event.target.value))
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
          />

          <p className="mt-2 text-xs text-muted">
            Lower numbers appear first.
          </p>
        </div>

        {/* --------------------------------------------------
            Active
        -------------------------------------------------- */}

        <div className="flex items-center justify-between rounded-lg border border-border bg-muted-bg p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Active Category
            </p>

            <p className="mt-1 text-xs text-muted">
              Inactive categories can remain in the database
              but can be hidden from the website.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsActive((value) => !value)}
            aria-pressed={isActive}
            className={`relative h-6 w-11 rounded-full transition ${
              isActive
                ? "bg-primary"
                : "bg-border"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-background transition ${
                isActive
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        {/* --------------------------------------------------
            Error
        -------------------------------------------------- */}

        {error && (
          <div className="rounded-lg border border-border bg-muted-bg px-4 py-3 text-sm text-foreground">
            {error}
          </div>
        )}
      </div>

      {/* --------------------------------------------------
          Footer
      -------------------------------------------------- */}

      <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          disabled={isPending}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />

          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Category"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}