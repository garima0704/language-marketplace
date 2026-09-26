"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import CategoryTreeItem from "./CategoryTreeItem";

export type Category = {
  id: string;
  parent_id: string | null;
  slug: string;
  level: number;
  display_order: number;
  is_active: boolean;
};

export type CategoryTranslation = {
  category_id: string;
  locale_code: string;
  name: string;
};

export type CategoryTreeNode = Category & {
  name: string;
  translationCount: number;
  children: CategoryTreeNode[];
};

type CategoryTreeProps = {
  categories: Category[];
  translations: CategoryTranslation[];
  totalLanguages: number;
};

function buildTree(
  categories: Category[],
  translations: CategoryTranslation[]
): CategoryTreeNode[] {
  const translationMap = new Map<string, string>();

  for (const translation of translations) {
    if (translation.locale_code === "en") {
      translationMap.set(
        translation.category_id,
        translation.name.trim()
      );
    }
  }

  const translationCountMap = new Map<string, number>();

  for (const translation of translations) {
    if (translation.locale_code === "en") {
    continue;
  }

  translationCountMap.set(
    translation.category_id,
    (translationCountMap.get(translation.category_id) ?? 0) + 1
  );
}

  const nodeMap = new Map<string, CategoryTreeNode>();

  for (const category of categories) {
    nodeMap.set(category.id, {
      ...category,
      name:
        translationMap.get(category.id) ??
        "Unnamed Category",
      translationCount:
        translationCountMap.get(category.id) ?? 0,
      children: [],
    });
  }

  const roots: CategoryTreeNode[] = [];

  for (const category of categories) {
    const node = nodeMap.get(category.id);

    if (!node) continue;

    if (category.parent_id === null) {
      roots.push(node);
      continue;
    }

    const parent = nodeMap.get(category.parent_id);

    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }

      return a.name.localeCompare(b.name);
    });

    for (const node of nodes) {
      sortNodes(node.children);
    }
  };

  sortNodes(roots);

  return roots;
}

function filterTree(
  nodes: CategoryTreeNode[],
  search: string,
  status: "all" | "active" | "inactive",
  level: "all" | "1" | "2" | "3"
): CategoryTreeNode[] {
  const value = search.trim().toLowerCase();

  return nodes.reduce<CategoryTreeNode[]>((result, node) => {
    const filteredChildren = filterTree(
      node.children,
      search,
      status,
      level
    );

    const matchesSearch =
      !value ||
      node.name.toLowerCase().includes(value) ||
      node.slug.toLowerCase().includes(value);

    const matchesStatus =
      status === "all" ||
      (status === "active" && node.is_active) ||
      (status === "inactive" && !node.is_active);

    const matchesLevel =
      level === "all" ||
      node.level === Number(level);

    const matchesSelf =
      matchesSearch &&
      matchesStatus &&
      matchesLevel;

    if (matchesSelf || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren,
      });
    }

    return result;
  }, []);
}

export default function CategoryTree({
  categories,
  translations,
  totalLanguages,
}: CategoryTreeProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [level, setLevel] = useState<
    "all" | "1" | "2" | "3"
  >("all");

  const tree = useMemo(
    () => buildTree(categories, translations),
    [categories, translations]
  );

  const filteredTree = useMemo(
    () =>
      filterTree(
        tree,
        search,
        status,
        level
      ),
    [tree, search, status, level]
  );

  const filteredCount = useMemo(() => {
    const countNodes = (nodes: CategoryTreeNode[]): number =>
      nodes.reduce(
        (total, node) =>
          total +
          1 +
          countNodes(node.children),
        0
      );

    return countNodes(filteredTree);
  }, [filteredTree]);

  return (
    <div className="space-y-6">
      {/* Search */}

      <div className="mt-8 rounded-xl border border-border bg-background p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search categories..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground"
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | "all"
                    | "active"
                    | "inactive"
                )
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-foreground sm:w-36"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={level}
              onChange={(event) =>
                setLevel(
                  event.target.value as
                    | "all"
                    | "1"
                    | "2"
                    | "3"
                )
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-foreground sm:w-32"
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Master Category Structure
          </h2>

          <p className="mt-1 text-sm text-muted">
            Manage the master category hierarchy and translations.
          </p>
        </div>

        {filteredTree.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">
              No categories found
            </p>

            <p className="mt-1 text-sm text-muted">
              {categories.length === 0
                ? "No categories have been added yet."
                : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTree.map((node) => (
              <CategoryTreeItem
                key={node.id}
                node={node}
                totalLanguages={totalLanguages}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-muted">
        Showing {filteredCount} of{" "}
        {categories.length} categories
      </div>
    </div>
  );
}