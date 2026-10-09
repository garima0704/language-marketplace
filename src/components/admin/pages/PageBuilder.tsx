
"use client";

import Link from "next/link";
import { useState } from "react";

import { saveSitePage } from "@/app/admin/pages/actions";
import type {
  PageBuilderConfig,
  PageSection,
  PageSectionType,
  SitePageRecord,
} from "@/lib/page-builder/types";

type Locale = {
  code: string;
  name: string;
};

type Props = {
  page: SitePageRecord | null;
  locales: Locale[];
  selectedLocale: string;
  config: PageBuilderConfig;
  errorMessage?: string;
};

type Item = Record<string, string>;

function textValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getItems(value: unknown): Item[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is Item =>
      item !== null &&
      typeof item === "object" &&
      !Array.isArray(item),
  ).map((item) => {
    const result: Item = {};

    for (const [key, value] of Object.entries(item)) {
      result[key] = typeof value === "string" ? value : "";
    }

    return result;
  });
}

function normalizeSections(
  pageData: Record<string, unknown>,
  defaults: PageSection[],
): PageSection[] {
  const saved = pageData.sections;

  if (!Array.isArray(saved) || saved.length === 0) {
    return defaults;
  }

  const validSaved = saved.filter(
    (section): section is PageSection =>
      section !== null &&
      typeof section === "object" &&
      !Array.isArray(section) &&
      typeof section.id === "string" &&
      typeof section.type === "string" &&
      typeof section.enabled === "boolean" &&
      section.data !== null &&
      typeof section.data === "object" &&
      !Array.isArray(section.data),
  );

  return validSaved.map((section) => {
    if (section.type !== "legal_sections") {
      return section;
    }

    const defaultSection = defaults.find(
      (item) => item.type === "legal_sections",
    );

    if (!defaultSection) {
      return section;
    }

    const savedItems = Array.isArray(section.data.sections)
      ? section.data.sections
      : [];

    const defaultItems = Array.isArray(defaultSection.data.sections)
      ? defaultSection.data.sections
      : [];

    const usedDefaultHeadings = new Set<string>();

    const mergedItems = savedItems.map((item, index) => {
      const savedItem =
        item !== null &&
        typeof item === "object" &&
        !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : {};

      const savedHeading =
        typeof savedItem.heading === "string"
          ? savedItem.heading.trim()
          : "";

      // Prefer matching by heading so reordered sections keep their content.
      let matchingDefault = savedHeading
        ? defaultItems.find(
            (defaultItem) =>
              defaultItem !== null &&
              typeof defaultItem === "object" &&
              !Array.isArray(defaultItem) &&
              (defaultItem as Record<string, unknown>).heading ===
                savedHeading,
          )
        : undefined;

      // If no heading matches, use the same position if it is still unused.
      if (!matchingDefault && defaultItems[index]) {
        const candidate = defaultItems[index];

        if (
          candidate !== null &&
          typeof candidate === "object" &&
          !Array.isArray(candidate)
        ) {
          const candidateHeading = (
            candidate as Record<string, unknown>
          ).heading;

          if (
            typeof candidateHeading !== "string" ||
            !usedDefaultHeadings.has(candidateHeading)
          ) {
            matchingDefault = candidate;
          }
        }
      }

      const fallback =
        matchingDefault !== null &&
        typeof matchingDefault === "object" &&
        !Array.isArray(matchingDefault)
          ? (matchingDefault as Record<string, unknown>)
          : {};

      if (typeof fallback.heading === "string") {
        usedDefaultHeadings.add(fallback.heading);
      }

      return {
        ...fallback,
        ...savedItem,
        heading: savedHeading || textValue(fallback.heading),
        body:
          typeof savedItem.body === "string"
            ? savedItem.body
            : textValue(fallback.body),
      };
    });

    // Append default subsections that are not already represented.
    const mergedHeadings = new Set(
      mergedItems
        .map((item) => item.heading)
        .filter(
          (heading): heading is string =>
            typeof heading === "string" && heading.trim().length > 0,
        ),
    );

    const missingDefaults = defaultItems.filter((item) => {
      if (
        item === null ||
        typeof item !== "object" ||
        Array.isArray(item)
      ) {
        return false;
      }

      const heading = (item as Record<string, unknown>).heading;

      return (
        typeof heading === "string" &&
        !mergedHeadings.has(heading)
      );
    });

    return {
      ...section,
      data: {
        ...defaultSection.data,
        ...section.data,
        title:
          typeof section.data.title === "string" &&
          section.data.title.trim().length > 0
            ? section.data.title
            : textValue(defaultSection.data.title),
        sections: [...mergedItems, ...missingDefaults],
      },
    };
  });
}

function createSection(type: PageSectionType): PageSection {
  const defaults: Record<PageSectionType, Record<string, unknown>> = {
    hero: {
      eyebrow: "",
      title: "",
      description: "",
      primaryLabel: "",
      primaryUrl: "",
      secondaryLabel: "",
      secondaryUrl: "",
    },
    feature_cards: {
      title: "",
      items: [{ title: "", description: "", icon: "message-circle" }],
    },
    text: {
      eyebrow: "",
      title: "",
      paragraphs: [""],
      style: "default",
    },
    contact_details: {
      title: "Contact information",
      items: [{ label: "Email", value: "" }],
    },
    contact_form: {
      title: "Get in touch",
      description: "",
    },
    legal_sections: {
      title: "",
      sections: [{ heading: "", body: "" }],
    },
    cta: {
      title: "",
      description: "",
      buttonLabel: "",
      buttonUrl: "",
    },
  };

  return {
    id: `${type}-${crypto.randomUUID()}`,
    type,
    enabled: true,
    data: defaults[type],
  };
}

const sectionLabels: Record<PageSectionType, string> = {
  hero: "Hero",
  feature_cards: "Feature cards",
  text: "Text section",
  contact_details: "Contact details",
  contact_form: "Contact form",
  legal_sections: "Legal sections",
  cta: "Call to action",
};

function Field({
  label,
  name,
  value,
  onChange,
  multiline = false,
  placeholder,
}: {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const className =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground";

  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium text-foreground">
        {label}
      </span>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
          className={className}    
        />
      ) : (
        <input
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={className}
        />  
      )}
    </label>
  );
}

export default function PageBuilder({
  page,
  locales,
  selectedLocale,
  config,
  errorMessage,
}: Props) {
  const [title, setTitle] = useState(page?.title ?? config.label);
  const [slug, setSlug] = useState(page?.slug ?? config.slug);
  const [localeCode, setLocaleCode] = useState(
    page?.locale_code ?? selectedLocale,
  );
  const [isPublished, setIsPublished] = useState(
    page?.is_published ?? false,
  );
  const [sections, setSections] = useState(() =>
    normalizeSections(
      page?.page_data ?? {},
      config.defaultSections,
    ),
  );

  function updateSection(
    index: number,
    updater: (section: PageSection) => PageSection,
  ) {
    setSections((current) =>
      current.map((section, i) =>
        i === index ? updater(section) : section,
      ),
    );
  }

  function updateData(
    index: number,
    key: string,
    value: unknown,
  ) {
    updateSection(index, (section) => ({
      ...section,
      data: { ...section.data, [key]: value },
    }));
  }

  function updateItem(
    index: number,
    listKey: string,
    itemIndex: number,
    key: string,
    value: string,
  ) {
    const section = sections[index];
    const items = getItems(section.data[listKey]);

    const updated = items.map((item, i) =>
      i === itemIndex ? { ...item, [key]: value } : item,
    );

    updateData(index, listKey, updated);
  }

  
  function addItem(index: number, listKey: string) {
    const section = sections[index];
    const existing = getItems(section.data[listKey]);

    let newItem: Item;

    if (section.type === "contact_details") {
      newItem = { label: "", value: "" };
    } else if (
      section.type === "legal_sections" &&
      listKey === "sections"
    ) {
      newItem = { heading: "", body: "" };
    } else {
      newItem = {
        title: "",
        description: "",
        icon: "message-circle",
      };
    }

    updateData(index, listKey, [...existing, newItem]);
  }

  function removeItem(index: number, listKey: string, itemIndex: number) {
    const section = sections[index];
    const items = getItems(section.data[listKey]);

    updateData(
      index,
      listKey,
      items.filter((_, i) => i !== itemIndex),
    );
  }

  function moveSection(index: number, direction: -1 | 1) {
    setSections((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function renderSectionFields(section: PageSection, index: number) {
    const data = section.data;

    switch (section.type) {
      case "hero":
        return (
          <div className="grid gap-4">
            <Field
              label="Eyebrow"
              value={textValue(data.eyebrow)}
              onChange={(v) => updateData(index, "eyebrow", v)}
            />
            <Field
              label="Heading"
              value={textValue(data.title)}
              onChange={(v) => updateData(index, "title", v)}
            />
            <Field
              label="Description"
              multiline
              value={textValue(data.description)}
              onChange={(v) => updateData(index, "description", v)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Primary button label"
                value={textValue(data.primaryLabel)}
                onChange={(v) => updateData(index, "primaryLabel", v)}
              />
              <Field
                label="Primary button URL"
                value={textValue(data.primaryUrl)}
                onChange={(v) => updateData(index, "primaryUrl", v)}
                placeholder="/"
              />
              <Field
                label="Secondary button label"
                value={textValue(data.secondaryLabel)}
                onChange={(v) => updateData(index, "secondaryLabel", v)}
              />
              <Field
                label="Secondary button URL"
                value={textValue(data.secondaryUrl)}
                onChange={(v) => updateData(index, "secondaryUrl", v)}
                placeholder="/sellers"
              />
            </div>
          </div>
        );

      case "feature_cards":
        return (
          <div className="space-y-4">
            <Field
              label="Section heading"
              value={textValue(data.title)}
              onChange={(v) => updateData(index, "title", v)}
            />
            {getItems(data.items).map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="space-y-3 rounded-lg border border-border p-4"
              >
                <Field
                  label="Card heading"
                  value={item.title ?? ""}
                  onChange={(v) =>
                    updateItem(index, "items", itemIndex, "title", v)
                  }
                />
                <Field
                  label="Card description"
                  multiline
                  value={item.description ?? ""}
                  onChange={(v) =>
                    updateItem(index, "items", itemIndex, "description", v)
                  }
                />
                <Field
                  label="Icon name"
                  value={item.icon ?? ""}
                  onChange={(v) =>
                    updateItem(index, "items", itemIndex, "icon", v)
                  }
                  placeholder="message-circle"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index, "items", itemIndex)}
                  className="text-sm text-muted underline"
                >
                  Remove card
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem(index, "items")}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted-bg"
            >
              + Add card
            </button>
          </div>
        );

      case "text":
        return (
          <div className="grid gap-4">
            <Field
              label="Eyebrow"
              value={textValue(data.eyebrow)}
              onChange={(v) => updateData(index, "eyebrow", v)}
            />
            <Field
              label="Heading"
              value={textValue(data.title)}
              onChange={(v) => updateData(index, "title", v)}
            />
            <Field
              label="Paragraphs (one paragraph per line)"
              multiline
              value={
                Array.isArray(data.paragraphs)
                  ? data.paragraphs.map(textValue).join("\n\n")
                  : ""
              }
              onChange={(v) =>
                updateData(
                  index,
                  "paragraphs",
                  v.split(/\n\s*\n/).map((paragraph) => paragraph.trim()),
                )
              }
            />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-foreground">
                Background style
              </span>
              <select
                value={textValue(data.style) || "default"}
                onChange={(event) =>
                  updateData(index, "style", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="default">Default</option>
                <option value="muted">Muted background</option>
              </select>
            </label>
          </div>
        );

      case "legal_sections":
        return (
          <div className="space-y-4">
            <Field
              label="Introduction heading"
              value={textValue(data.title)}
              onChange={(v) => updateData(index, "title", v)}
            />
            {getItems(data.sections).map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="space-y-3 rounded-lg border border-border p-4"
              >
                <Field
                  label="Section heading"
                  value={item.heading ?? ""}
                  onChange={(v) =>
                    updateItem(index, "sections", itemIndex, "heading", v)
                  }
                />
                <Field
                  label="Section text"
                  multiline
                  value={item.body ?? ""}
                  onChange={(v) =>
                    updateItem(index, "sections", itemIndex, "body", v)
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    removeItem(index, "sections", itemIndex)
                  }
                  className="text-sm text-muted underline"
                >
                  Remove subsection
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem(index, "sections")}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted-bg"
            >
              + Add legal subsection
            </button>
          </div>
        );

      case "contact_details":
        return (
          <div className="space-y-4">
            <Field
              label="Section heading"
              value={textValue(data.title)}
              onChange={(v) => updateData(index, "title", v)}
            />
            {getItems(data.items).map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="space-y-3 rounded-lg border border-border p-4"
              >
                <Field
                  label="Label"
                  value={item.label ?? ""}
                  onChange={(v) =>
                    updateItem(index, "items", itemIndex, "label", v)
                  }
                />
                <Field
                  label="Value"
                  value={item.value ?? ""}
                  onChange={(v) =>
                    updateItem(index, "items", itemIndex, "value", v)
                  }
                />
                <button
                  type="button"
                  onClick={() => removeItem(index, "items", itemIndex)}
                  className="text-sm text-muted underline"
                >
                  Remove detail
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem(index, "items")}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted-bg"
            >
              + Add contact detail
            </button>
          </div>
        );

      case "contact_form":
        return (
          <div className="grid gap-4">
            <Field
              label="Form heading"
              value={textValue(data.title)}
              onChange={(v) => updateData(index, "title", v)}
            />
            <Field
              label="Description"
              multiline
              value={textValue(data.description)}
              onChange={(v) => updateData(index, "description", v)}
            />
            <p className="text-xs text-muted">
              This section controls its heading and description. The actual
              form submission must remain connected to your existing form
              implementation.
            </p>
          </div>
        );

      case "cta":
        return (
          <div className="grid gap-4">
            <Field
              label="Heading"
              value={textValue(data.title)}
              onChange={(v) => updateData(index, "title", v)}
            />
            <Field
              label="Description"
              multiline
              value={textValue(data.description)}
              onChange={(v) => updateData(index, "description", v)}
            />
            <Field
              label="Button label"
              value={textValue(data.buttonLabel)}
              onChange={(v) => updateData(index, "buttonLabel", v)}
            />
            <Field
              label="Button URL"
              value={textValue(data.buttonUrl)}
              onChange={(v) => updateData(index, "buttonUrl", v)}
              placeholder="/"
            />
          </div>
        );
    }
  }

  return (
    <form action={saveSitePage} className="space-y-6">
      <input type="hidden" name="id" value={page?.id ?? ""} />
      <input type="hidden" name="content" value={page?.content ?? ""} />
      <input
        type="hidden"
        name="page_data"
        value={JSON.stringify({
          ...(page?.page_data ?? {}),
          sections,
        })}
      />
      <input type="hidden" name="locale_code" value={localeCode} />
      <input
        type="hidden"
        name="is_published"
        value={isPublished ? "on" : ""}
      />

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-border bg-muted-bg px-4 py-3 text-sm"
        >
          {errorMessage}
        </div>
      )}

      <section className="rounded-xl border border-border bg-background p-6">
        <h2 className="text-base font-semibold">Page details</h2>
        <p className="mt-1 text-sm text-muted">{config.description}</p>

        <div className="mt-5 grid gap-4">
          <Field
            label="Page title"
            name="title"
            value={title}
            onChange={setTitle}
          />
          <Field
            label="URL slug"
            name="slug"
            value={slug}
            onChange={(value) =>
              setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
          />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Language</span>
            <select
              value={localeCode}
              onChange={(event) => setLocaleCode(event.target.value)}
              disabled={Boolean(page)}
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-60"
            >
              {locales.map((locale) => (
                <option key={locale.code} value={locale.code}>
                  {locale.name} ({locale.code})
                </option>
              ))}
            </select>
            {page && (
              <span className="block text-xs text-muted">
                To edit another language, open that language’s page record.
              </span>
            )}
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-background p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Page sections</h2>
            <p className="mt-1 text-sm text-muted">
              Add, edit, reorder, or hide sections. The section order here
              determines the display order.
            </p>
          </div>

          <select
            aria-label="Add section"
            value=""
            onChange={(event) => {
              const type = event.target.value as PageSectionType;
              if (type) setSections((current) => [...current, createSection(type)]);
            }}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="">+ Add section</option>
            {config.allowedSections.map((type) => (
              <option key={type} value={type}>
                {sectionLabels[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 space-y-4">
          {sections.map((section, index) => (
            <article
              key={section.id}
              className="rounded-xl border border-border p-4 sm:p-5"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    {index + 1}. {sectionLabels[section.type]}
                  </h3>
                  <label className="mt-2 inline-flex items-center gap-2 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(event) =>
                        updateSection(index, (current) => ({
                          ...current,
                          enabled: event.target.checked,
                        }))
                      }
                    />
                    Show this section
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveSection(index, -1)}
                    className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-40"
                    aria-label="Move section up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === sections.length - 1}
                    onClick={() => moveSection(index, 1)}
                    className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-40"
                    aria-label="Move section down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSections((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                    className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted-bg"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {renderSectionFields(section, index)}
            </article>
          ))}

          {sections.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted">
              No sections yet. Use “Add section” to begin building this page.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-background p-6">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="mt-1 h-4 w-4 accent-black"
          />
          <span>
            <span className="block text-sm font-medium">Publish this page</span>
            <span className="mt-1 block text-sm text-muted">
              {isPublished
                ? "The page will be published when you save."
                : "The page will remain a draft."}
            </span>
          </span>
        </label>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/pages"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium hover:bg-muted-bg"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-background hover:opacity-90"
        >
          {page ? "Save Changes" : "Create Page"}
        </button>
      </div>
    </form>
  );
}