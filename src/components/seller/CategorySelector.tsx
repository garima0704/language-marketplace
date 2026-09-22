"use client";

import { useEffect, useMemo, useState } from "react";

type Language = {
  code: string;
  name: string;
};

type Category = {
  id: string;
  parent_id: string | null;
  level: number;
  display_order: number;
  slug: string;
};

type Props = {
  languages: Language[];
  categories: Category[];
  translations?: Record<string, string>;
  initialLanguageCode?: string;
  initialCategoryId?: string;
  onLanguageChange?: (languageCode: string) => void;
  onCategoryChange?: (categoryId: string) => void;
};

type SelectedLevels = {
  level1: string;
  level2: string;
  level3: string;
};

function getInitialLevels(
  categories: Category[],
  category?: Category
): SelectedLevels {
  if (!category) {
    return {
      level1: "",
      level2: "",
      level3: "",
    };
  }

  if (category.level === 1) {
    return {
      level1: category.id,
      level2: "",
      level3: "",
    };
  }

  if (category.level === 2) {
    return {
      level1: category.parent_id ?? "",
      level2: category.id,
      level3: "",
    };
  }

  if (category.level === 3) {
    const parentLevel2 = categories.find(
      (item) => item.id === category.parent_id
    );

    return {
      level1: parentLevel2?.parent_id ?? "",
      level2: parentLevel2?.id ?? "",
      level3: category.id,
    };
  }

  return {
    level1: "",
    level2: "",
    level3: "",
  };
}

export default function CategorySelector({
  languages,
  categories,
  translations = {},
  initialLanguageCode = "",
  initialCategoryId = "",
  onLanguageChange,
  onCategoryChange,
}: Props) {
  const initialCategory = categories.find(
    (category) => category.id === initialCategoryId
  );

  const initialLevels = getInitialLevels(
    categories,
    initialCategory
  );

  const [languageCode, setLanguageCode] =
    useState(initialLanguageCode);

  const [level1, setLevel1] = useState(
    initialLevels.level1
  );

  const [level2, setLevel2] = useState(
    initialLevels.level2
  );

  const [level3, setLevel3] = useState(
    initialLevels.level3
  );

  useEffect(() => {
    setLanguageCode(initialLanguageCode);

    const category = categories.find(
      (item) => item.id === initialCategoryId
    );

    const levels = getInitialLevels(
      categories,
      category
    );

    setLevel1(levels.level1);
    setLevel2(levels.level2);
    setLevel3(levels.level3);
  }, [
    categories,
    initialCategoryId,
    initialLanguageCode,
  ]);

  const getCategoryTranslationKey = (category: Category) => {
  const parts: string[] = [category.slug];

  let current = category;

  while (current.parent_id) {
    const parent = categories.find(
      (item) => item.id === current.parent_id
    );

    if (!parent) break;

    parts.unshift(parent.slug);
    current = parent;
  }

  return `category.${parts.join(".")}`;
};

const getName = (category: Category) => {
  const key = getCategoryTranslationKey(category);

  return (
    translations[key] ??
    category.slug ??
    category.id
  );
};

console.log(
  "CATEGORY DEBUG",
  categories.map((category) => ({
    slug: category.slug,
    key: getCategoryTranslationKey(category),
    translation:
      translations[getCategoryTranslationKey(category)],
  }))
);

  const languagesList = useMemo(() => {
    return [...languages].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [languages]);

  /*
   * Level 1 = Category
   */
  const categoriesLevel1 = useMemo(() => {
    return categories
      .filter(
        (category) =>
          category.level === 1 &&
          category.parent_id === null
      )
      .sort(
        (a, b) =>
          a.display_order - b.display_order
      );
  }, [categories]);

  /*
   * Level 2 = Topic
   */
  const categoriesLevel2 = useMemo(() => {
    if (!level1) return [];

    return categories
      .filter(
        (category) =>
          category.level === 2 &&
          category.parent_id === level1
      )
      .sort(
        (a, b) =>
          a.display_order - b.display_order
      );
  }, [categories, level1]);

  /*
   * Level 3 = Subtopic
   */
  const categoriesLevel3 = useMemo(() => {
    if (!level2) return [];

    return categories
      .filter(
        (category) =>
          category.level === 3 &&
          category.parent_id === level2
      )
      .sort(
        (a, b) =>
          a.display_order - b.display_order
      );
  }, [categories, level2]);

  function handleLanguageChange(value: string) {
    setLanguageCode(value);
    onLanguageChange?.(value);
  }

  function handleLevel1Change(value: string) {
    setLevel1(value);
    setLevel2("");
    setLevel3("");

    const hasLevel2 = categories.some(
      (category) =>
        category.level === 2 &&
        category.parent_id === value
    );

    if (!hasLevel2) {
      onCategoryChange?.(value);
    } else {
      onCategoryChange?.("");
    }
  }

  function handleLevel2Change(value: string) {
    setLevel2(value);
    setLevel3("");

    const hasLevel3 = categories.some(
      (category) =>
        category.level === 3 &&
        category.parent_id === value
    );

    if (!hasLevel3) {
      onCategoryChange?.(value);
    } else {
      onCategoryChange?.("");
    }
  }

  function handleLevel3Change(value: string) {
    setLevel3(value);
    onCategoryChange?.(value);
  }

  const selectClassName =
    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10";

  const languageLabel =
    translations["category.language"] ??
    "Language";

  const selectLanguageLabel =
    translations["category.select_language"] ??
    "Select Language";

  const categoryLabel =
    translations["category.category"] ??
    "Category";

  const selectCategoryLabel =
    translations["category.select_category"] ??
    "Select Category";

  const topicLabel =
    translations["category.topic"] ??
    "Topic";

  const selectTopicLabel =
    translations["category.select_topic"] ??
    "Select Topic";

  const subtopicLabel =
    translations["category.subtopic"] ??
    "Subtopic";

  const selectSubtopicLabel =
    translations["category.select_subtopic"] ??
    "Select Subtopic";

  const helperText =
    translations["category.helper"] ??
    "Select the language learners want to learn, then choose what the video is about.";

  return (
    <div className="space-y-5">
      {/* Language */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {languageLabel}
        </label>

        <select
          name="language_code"
          value={languageCode}
          onChange={(event) =>
            handleLanguageChange(event.target.value)
          }
          className={selectClassName}
        >
          <option value="">
            {selectLanguageLabel}
          </option>

          {languagesList.map((language) => (
            <option
              key={language.code}
              value={language.code}
            >
              {translations[`language.${language.code}`] ?? language.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category - Level 1 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {categoryLabel}
        </label>

        <select
          value={level1}
          onChange={(event) =>
            handleLevel1Change(event.target.value)
          }
          className={selectClassName}
        >
          <option value="">
            {selectCategoryLabel}
          </option>

          {categoriesLevel1.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {getName(category)}
            </option>
          ))}
        </select>
      </div>

      {/* Topic - Level 2 */}
      {level1 && categoriesLevel2.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {topicLabel}
          </label>

          <select
            value={level2}
            onChange={(event) =>
              handleLevel2Change(event.target.value)
            }
            className={selectClassName}
          >
            <option value="">
              {selectTopicLabel}
            </option>

            {categoriesLevel2.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {getName(category)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Subtopic - Level 3 */}
      {level2 && categoriesLevel3.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {subtopicLabel}
          </label>

          <select
            name="category_id"
            value={level3}
            onChange={(event) =>
              handleLevel3Change(event.target.value)
            }
            className={selectClassName}
          >
            <option value="">
              {selectSubtopicLabel}
            </option>

            {categoriesLevel3.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {getName(category)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* If Level 1 is the final category */}
      {level1 &&
        categoriesLevel2.length === 0 && (
          <input
            type="hidden"
            name="category_id"
            value={level1}
          />
        )}

      {/* If Level 2 is the final category */}
      {level2 &&
        categoriesLevel3.length === 0 && (
          <input
            type="hidden"
            name="category_id"
            value={level2}
          />
        )}

      <p className="text-xs text-muted-foreground">
        {helperText}
      </p>
    </div>
  );
}