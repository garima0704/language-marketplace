
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveSitePage } from "@/app/admin/pages/actions";

type Locale = {
  code: string;
  name: string;
};

type SitePage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  page_data: Record<string, unknown>;
  locale_code: string;
  is_published: boolean;
};

type Props = {
  page?: SitePage | null;
  locales: Locale[];
  selectedLocale?: string;
  errorMessage?: string;
};

export default function PageForm({
  page,
  locales,
  selectedLocale,
  errorMessage,
}: Props) {
  const isEditing = Boolean(page);

  return (
    <form action={saveSitePage} className="space-y-6">
      <input type="hidden" name="id" value={page?.id ?? ""} />

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-border bg-muted-bg px-4 py-3 text-sm text-foreground"
        >
          {errorMessage}
        </div>
      )}

      <div className="rounded-xl border border-border bg-background p-6">
        <h2 className="text-base font-semibold text-foreground">
          Page details
        </h2>

        <p className="mt-1 text-sm text-muted">
          Set the page name, URL, and language.
        </p>

        <div className="mt-6 grid gap-5">
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Page title
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={page?.title ?? ""}
              placeholder="About NiceConvo"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              URL slug
            </label>
            <div className="flex items-center rounded-lg border border-border focus-within:border-foreground">
              <span className="pl-3 text-sm text-muted">/</span>
              <input
                id="slug"
                name="slug"
                required
                defaultValue={page?.slug ?? ""}
                placeholder="about"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                title="Use lowercase letters, numbers, and hyphens."
                className="h-11 min-w-0 flex-1 rounded-lg bg-transparent px-2 text-sm text-foreground outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-muted">
              Use lowercase letters, numbers, and hyphens. Existing page
              slugs must remain compatible with your public routes.
            </p>
          </div>

          <div>
            <label
              htmlFor="locale_code"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Language
            </label>
            <select
              id="locale_code"
              name="locale_code"
              required
              defaultValue={
                selectedLocale ?? page?.locale_code ?? "en"
              }
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
            >
              {locales.map((locale) => (
                <option key={locale.code} value={locale.code}>
                  {locale.name} ({locale.code})
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted">
              Each language has its own page record.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <h2 className="text-base font-semibold text-foreground">
          Page content
        </h2>
        <p className="mt-1 text-sm text-muted">
          Enter HTML content for the existing content area. Structured
          page fields can be stored separately in page data.
        </p>

        <div className="mt-5">
          <label
            htmlFor="content"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            HTML content
          </label>
          <textarea
            id="content"
            name="content"
            rows={12}
            defaultValue={page?.content ?? ""}
            placeholder="<h2>About us</h2><p>Write your page content...</p>"
            className="w-full rounded-lg border border-border bg-background px-3 py-3 font-mono text-sm leading-6 text-foreground outline-none focus:border-foreground"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <h2 className="text-base font-semibold text-foreground">
          Structured page data
        </h2>
        <p className="mt-1 text-sm text-muted">
          Optional JSON data for custom page sections, headings, buttons,
          and other fields. Keep it as a valid JSON object.
        </p>

        <div className="mt-5">
          <label
            htmlFor="page_data"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Page data (JSON)
          </label>
          <textarea
            id="page_data"
            name="page_data"
            rows={14}
            defaultValue={JSON.stringify(page?.page_data ?? {}, null, 2)}
            spellCheck={false}
            className="w-full rounded-lg border border-border bg-background px-3 py-3 font-mono text-sm leading-6 text-foreground outline-none focus:border-foreground"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={page?.is_published ?? false}
            className="mt-1 h-4 w-4 accent-black"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">
              Publish this page
            </span>
            <span className="mt-1 block text-sm text-muted">
              {page?.is_published
                ? "This page is currently published."
                : "Keep this unchecked to save the page as a draft."}
            </span>
          </span>
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/pages"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium text-foreground transition hover:bg-muted-bg"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-background transition hover:opacity-90"
        >
          {isEditing ? "Save Changes" : "Create Page"}
        </button>
      </div>
    </form>
  );
}