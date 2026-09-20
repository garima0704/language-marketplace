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
};

type CategoryTranslation = {
  category_id: string;
  locale_code: string;
  name: string;
};

type Props = {
  languages: Language[];
  categories: Category[];
  categoryTranslations: CategoryTranslation[];
  localeCode?: string;
  initialLanguageCode?: string;
  initialCategoryId?: string;
  onLanguageChange?: (languageCode: string) => void;
  onCategoryChange?: (categoryId: string) => void;
  uiTranslations?: Record<string, string>;
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
  categoryTranslations,
  localeCode = "en",
  initialLanguageCode = "",
  initialCategoryId = "",
  onLanguageChange,
  onCategoryChange,
  uiTranslations,
}: Props) {
  const initialCategory = categories.find(
    (category) => category.id === initialCategoryId
  );

  const initialLevels = getInitialLevels(
    categories,
    initialCategory
  );

  const [languageCode, setLanguageCode] = useState(
    initialLanguageCode
  );

  const [level1, setLevel1] = useState(initialLevels.level1);
  const [level2, setLevel2] = useState(initialLevels.level2);
  const [level3, setLevel3] = useState(initialLevels.level3);

  useEffect(() => {
    setLanguageCode(initialLanguageCode);

    const category = categories.find(
      (item) => item.id === initialCategoryId
    );

    const levels = getInitialLevels(categories, category);

    setLevel1(levels.level1);
    setLevel2(levels.level2);
    setLevel3(levels.level3);
  }, [
    categories,
    initialCategoryId,
    initialLanguageCode,
  ]);

  /*
  * Category names use the SITE/UI locale.
  *
  * The language selected in this component is the
  * language being taught, not the language spoken in the video.
  */
  const translationMap = useMemo(() => {
    const map = new Map<string, string>();

    categoryTranslations.forEach((translation) => {
      if (translation.locale_code === localeCode) {
        map.set(
          translation.category_id,
          translation.name
        );
      }
    });

    return map;
  }, [categoryTranslations, localeCode]);

  const getName = (category: Category) => {
    return (
      translationMap.get(category.id) ??
      categoryTranslations.find(
        (translation) =>
          translation.category_id === category.id &&
          translation.locale_code === "en"
      )?.name ??
      category.id
    );
  };

  /*
   * The first UI Category selector contains LANGUAGES.
   *
   * Language is intentionally NOT stored in categories.
   * It is saved separately as videos.language_code.
   */
  const availableLanguages = useMemo(() => {
    return [...languages].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [languages]);

  /*
   * The second UI selector contains actual Category Level 1.
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
   * Category Level 2
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
   * Category Level 3
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

    onCategoryChange?.("");
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

  const categoryLabel =
    uiTranslations?.["category.category"] ??
    "Category";

  const selectCategoryLabel =
    uiTranslations?.["category.select_category"] ??
    "Select Category";

  const subcategoryLabel =
    uiTranslations?.["category.subcategory"] ??
    "Subcategory";

  const selectSubcategoryLabel =
    uiTranslations?.[
      "category.select_subcategory"
    ] ?? "Select Subcategory";

  const topicLabel =
    uiTranslations?.["category.topic"] ??
    "Topic";

  const selectTopicLabel =
    uiTranslations?.["category.select_topic"] ??
    "Select Topic";

  const subtopicLabel =
  uiTranslations?.["category.subtopic"] ??
  "Subtopic";

  const selectSubtopicLabel =
    uiTranslations?.["category.select_subtopic"] ??
    "Select Subtopic";

  const helperText =
    uiTranslations?.["category.helper"] ??
    "Select a category and continue through the available subcategories.";

  return (
    <div className="space-y-5">
      {/* Category — Language */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {categoryLabel}
        </label>

        <select
          value={languageCode}
          onChange={(event) =>
            handleLanguageChange(event.target.value)
          }
          className={selectClassName}
        >
          <option value="">
            {selectCategoryLabel}
          </option>

          {availableLanguages.map((language) => (
            <option
              key={language.code}
              value={language.code}
            >
              {language.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory — Category Level 1 */}
      {languageCode && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {subcategoryLabel}
          </label>

          <select
            value={level1}
            onChange={(event) =>
              handleLevel1Change(event.target.value)
            }
            className={selectClassName}
          >
            <option value="">
              {selectSubcategoryLabel}
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
      )}

      {/* Topic — Category Level 2 */}
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

            {/* Subtopic — Category Level 3 */}
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

      {/* Final category when Level 1 is deepest */}
      {languageCode &&
        level1 &&
        categoriesLevel2.length === 0 && (
          <input
            type="hidden"
            name="category_id"
            value={level1}
          />
        )}

      {/* Final category when Level 2 is deepest */}
      {level2 && categoriesLevel3.length === 0 && (
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