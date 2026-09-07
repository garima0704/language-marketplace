"use client";

import { useEffect, useMemo, useState } from "react";

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
  initialCategoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
};

export default function CategorySelector({
  categories,
  translations,
  localeCode = "en",
  initialCategoryId = "",
  onCategoryChange,
}: Props) {
  const initialCategory = categories.find(
  (category) => category.id === initialCategoryId
);

function getInitialLevels(category: Category | undefined) {
  if (!category) {
    return {
      level1: "",
      level2: "",
      level3: "",
      level4: "",
    };
  }

  // Level 1 category
  if (category.level === 1) {
    return {
      level1: category.id,
      level2: "",
      level3: "",
      level4: "",
    };
  }

  // Level 2 category
  if (category.level === 2) {
    return {
      level1: category.parent_id ?? "",
      level2: category.id,
      level3: "",
      level4: "",
    };
  }

  // Level 3 category
  if (category.level === 3) {
    const parentLevel2 = categories.find(
      (item) => item.id === category.parent_id
    );

    return {
      level1: parentLevel2?.parent_id ?? "",
      level2: parentLevel2?.id ?? "",
      level3: category.id,
      level4: "",
    };
  }

  // Level 4 category
  if (category.level === 4) {
    const parentLevel3 = categories.find(
      (item) => item.id === category.parent_id
    );

    const parentLevel2 = categories.find(
      (item) => item.id === parentLevel3?.parent_id
    );

    return {
      level1: parentLevel2?.parent_id ?? "",
      level2: parentLevel2?.id ?? "",
      level3: parentLevel3?.id ?? "",
      level4: category.id,
    };
  }

  return {
    level1: "",
    level2: "",
    level3: "",
    level4: "",
  };
}

const initialLevels = getInitialLevels(initialCategory);

const [level1, setLevel1] = useState(initialLevels.level1);
const [level2, setLevel2] = useState(initialLevels.level2);
const [level3, setLevel3] = useState(initialLevels.level3);
const [level4, setLevel4] = useState(initialLevels.level4);

useEffect(() => {
  const category = categories.find(
    (category) => category.id === initialCategoryId
  );

  const levels = getInitialLevels(category);

  setLevel1(levels.level1);
  setLevel2(levels.level2);
  setLevel3(levels.level3);
  setLevel4(levels.level4);
}, [categories, initialCategoryId]);

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

    onCategoryChange?.("");
  }

  function handleLevel2Change(value: string) {
  setLevel2(value);
  setLevel3("");
  setLevel4("");

  if (categories.filter(
    (category) =>
      category.level === 3 &&
      category.parent_id === value
  ).length === 0) {
    onCategoryChange?.(value);
  } else {
    onCategoryChange?.("");
  }
}

  function handleLevel3Change(value: string) {
  setLevel3(value);
  setLevel4("");

  const hasLevel4 = categories.some(
    (category) =>
      category.level === 4 &&
      category.parent_id === value
  );

  if (!hasLevel4) {
    onCategoryChange?.(value);
  } else {
    onCategoryChange?.("");
  }
}

  function handleLevel4Change(value: string) {
  setLevel4(value);
  onCategoryChange?.(value);
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
              handleLevel4Change(e.target.value)
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

      {/* If Level 2 is the final category */}
      {level2 && categoriesLevel3.length === 0 && (
        <input
          type="hidden"
          name="category_id"
          value={level2}
        />
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