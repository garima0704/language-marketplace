"use client";

import { useMemo, useState } from "react";

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
  categories: Category[];
  translations: CategoryTranslation[];
  localeCode?: string;
};

export default function CategorySelector({
  categories,
  translations,
  localeCode = "en",
}: Props) {
  const [level1, setLevel1] = useState("");
  const [level2, setLevel2] = useState("");
  const [level3, setLevel3] = useState("");
  const [level4, setLevel4] = useState("");

  const translationMap = useMemo(() => {
    const map = new Map<string, string>();

    translations.forEach((translation) => {
      if (translation.locale_code === localeCode) {
        map.set(translation.category_id, translation.name);
      }
    });

    return map;
  }, [translations, localeCode]);

  const getName = (category: Category) => {
    return (
      translationMap.get(category.id) ||
      `Category ${category.id}`
    );
  };

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

  const categoriesLevel4 = useMemo(() => {
    if (!level3) return [];

    return categories
      .filter(
        (category) =>
          category.level === 4 &&
          category.parent_id === level3
      )
      .sort(
        (a, b) =>
          a.display_order - b.display_order
      );
  }, [categories, level3]);

  function handleLevel1Change(value: string) {
    setLevel1(value);
    setLevel2("");
    setLevel3("");
    setLevel4("");
  }

  function handleLevel2Change(value: string) {
    setLevel2(value);
    setLevel3("");
    setLevel4("");
  }

  function handleLevel3Change(value: string) {
    setLevel3(value);
    setLevel4("");
  }

  const selectClassName =
    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <div className="space-y-5">

      {/* Level 1 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Category
        </label>

        <select
          value={level1}
          onChange={(e) =>
            handleLevel1Change(e.target.value)
          }
          className={selectClassName}
        >
          <option value="">
            Select Category
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

      {/* Level 2 */}
      {level1 && categoriesLevel2.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Subcategory
          </label>

          <select
            value={level2}
            onChange={(e) =>
              handleLevel2Change(e.target.value)
            }
            className={selectClassName}
          >
            <option value="">
              Select Subcategory
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

      {/* Level 3 */}
      {level2 && categoriesLevel3.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Subcategory
          </label>

          <select
            value={level3}
            onChange={(e) =>
              handleLevel3Change(e.target.value)
            }
            className={selectClassName}
          >
            <option value="">
              Select Subcategory
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

      {/* Level 4 */}
      {level3 && categoriesLevel4.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Topic
          </label>

          <select
            name="category_id"
            value={level4}
            onChange={(e) =>
              setLevel4(e.target.value)
            }
            className={selectClassName}
            required
          >
            <option value="">
              Select Topic
            </option>

            {categoriesLevel4.map((category) => (
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

      {/* If Level 3 is the final category */}
      {level3 && categoriesLevel4.length === 0 && (
        <input
          type="hidden"
          name="category_id"
          value={level3}
        />
      )}

      <p className="text-xs text-muted-foreground">
        Select a category and continue through the
        available subcategories.
      </p>
    </div>
  );
}