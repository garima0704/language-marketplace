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
  // --------------------------------------------------
  // English names are the master category names
  // --------------------------------------------------

  const translationMap = new Map<string, string>();

  for (const translation of translations) {
    if (translation.locale_code === "en") {
      translationMap.set(
        translation.category_id,
        translation.name.trim()
      );
    }
  }

  // --------------------------------------------------
  // Count translations per category
  // --------------------------------------------------

  const translationCountMap = new Map<string, number>();

  for (const translation of translations) {
    translationCountMap.set(
      translation.category_id,
      (translationCountMap.get(translation.category_id) ?? 0) + 1
    );
  }

  // --------------------------------------------------
  // Create tree nodes
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Build hierarchy using parent_id
  //
  // parent_id = null → master/top-level category
  // --------------------------------------------------

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
      // Fallback for orphaned categories
      roots.push(node);
    }
  }

  // --------------------------------------------------
  // Sort by display order, then name
  // --------------------------------------------------

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

export default function CategoryTree({
  categories,
  translations,
  totalLanguages,
}: CategoryTreeProps) {
  const tree = buildTree(
    categories,
    translations
  );

  if (tree.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background p-10 text-center">
        <p className="text-sm text-muted">
          No categories found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">
          Master Category Structure
        </h2>

        <p className="mt-1 text-sm text-muted">
          Manage the master category hierarchy and translations.
        </p>
      </div>

      <div className="divide-y divide-border">
        {tree.map((node) => (
          <CategoryTreeItem
            key={node.id}
            node={node}
            totalLanguages={totalLanguages}
          />
        ))}
      </div>
    </div>
  );
}