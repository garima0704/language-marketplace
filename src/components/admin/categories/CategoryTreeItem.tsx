"use client";

import { useState } from "react";
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

  const [isExpanded, setIsExpanded] = useState(false);

  const requiredTranslations = Math.max(
    totalLanguages - 1,
    0
  );

  const translationPercentage =
    requiredTranslations > 0
      ? Math.round(
          (node.translationCount / requiredTranslations) * 100
        )
      : 100;

  return (
    <div>
      {/* CATEGORY ROW */}

      <div className="flex min-h-[68px] items-center gap-3 px-5 py-3">
        {/* Expand / Collapse */}

        {hasChildren ? (
          <button
            type="button"
            onClick={() =>
              setIsExpanded((previous) => !previous)
            }
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-muted-bg hover:text-foreground"
            aria-label={
              isExpanded
                ? `Collapse ${node.name}`
                : `Expand ${node.name}`
            }
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        ) : (
          <div className="h-8 w-8 shrink-0" />
        )}

        {/* Category information */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">
              {node.name}
            </span>

            <span className="rounded bg-muted-bg px-2 py-0.5 text-xs font-medium text-secondary">
              Level {node.level}
            </span>
          </div>

          <p className="mt-1 text-xs text-muted">
            {node.translationCount}/{requiredTranslations} languages
            {" · "}
            {translationPercentage}% translated
          </p>
        </div>

        {/* Status */}

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <span
            className={`h-2 w-2 rounded-full ${
              node.is_active
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
          />

          <span className="text-sm text-secondary">
            {node.is_active
              ? "Active"
              : "Inactive"}
          </span>
        </div>

        {/* Translations */}

        <Link
          href={`/admin/categories/${node.id}/translations`}
          className="hidden h-9 shrink-0 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground transition hover:bg-light-bg sm:inline-flex"
        >
          Translations
        </Link>

        {/* Edit */}

        <Link
          href={`/admin/categories/${node.id}/edit`}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
        >
          <Pencil className="h-4 w-4" />

          <span className="hidden sm:inline">
            Edit
          </span>
        </Link>
      </div>

      {/* CHILDREN */}

      {hasChildren && isExpanded && (
        <div className="ml-11 border-l border-border pl-4">
          <div>
            {node.children.map((child) => (
              <CategoryTreeItem
                key={child.id}
                node={child}
                totalLanguages={totalLanguages}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}