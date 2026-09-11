import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
} from "lucide-react";

import type { CategoryTreeNode } from "./CategoryTree";

type CategoryTreeItemProps = {
  node: CategoryTreeNode;
  totalLanguages: number;
};

export default function CategoryTreeItem({
  node,
  totalLanguages,
}: CategoryTreeItemProps) {
  const hasChildren = node.children.length > 0;

  const translationPercentage =
    totalLanguages > 0
      ? Math.round(
          (node.translationCount / totalLanguages) * 100
        )
      : 0;

  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {hasChildren ? (
            <details open={node.level === 1}>
              <summary className="group flex cursor-pointer list-none items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted-bg">
                {/* Expand / collapse icon */}

                <span className="shrink-0 text-muted">
                  <ChevronRight className="h-4 w-4 group-open:hidden" />
                  <ChevronDown className="hidden h-4 w-4 group-open:block" />
                </span>

                {/* Category information */}

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">
                      {node.name}
                    </span>

                    <span className="rounded-full bg-muted-bg px-2 py-0.5 text-xs text-muted">
                      Level {node.level}
                    </span>

                    {!node.is_active && (
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                        Inactive
                      </span>
                    )}
                  </span>

                  <span className="mt-1 block text-xs text-muted">
                    {node.translationCount}/{totalLanguages} languages
                    {" · "}
                    {translationPercentage}% translated
                  </span>
                </span>
              </summary>

              {/* Children */}

              <div className="ml-4 mt-2 border-l border-border pl-4">
                <div className="space-y-1">
                  {node.children.map((child) => (
                    <CategoryTreeItem
                      key={child.id}
                      node={child}
                      totalLanguages={totalLanguages}
                    />
                  ))}
                </div>
              </div>
            </details>
          ) : (
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-border" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">
                    {node.name}
                  </span>

                  <span className="rounded-full bg-muted-bg px-2 py-0.5 text-xs text-muted">
                    Level {node.level}
                  </span>

                  {!node.is_active && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                      Inactive
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-muted">
                  {node.translationCount}/{totalLanguages} languages
                  {" · "}
                  {translationPercentage}% translated
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}

        <div className="flex shrink-0 items-center gap-2 pt-2">
          <Link
            href={`/admin/categories/${node.id}/translations`}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted-bg"
          >
            Translations
          </Link>

          <Link
            href={`/admin/categories/${node.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted-bg"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}