"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
} from "lucide-react";

import LanguageRegions from "./LanguageRegions";
import type { Language, Region } from "./LanguageList";

type Props = {
  language: Language;
  regions: Region[];
};

export default function LanguageRow({
  language,
  regions,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalRegionCount = regions.filter(
    (region) =>
      region.language_code === language.code
  ).length;

  return (
    <div>
      {/* ============================================== */}
      {/* LANGUAGE ROW */}
      {/* ============================================== */}

      <div className="flex min-h-[68px] items-center gap-3 px-5 py-3">
        {/* Expand / Collapse */}

        <button
          type="button"
          onClick={() =>
            setIsExpanded((previous) => !previous)
          }
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-muted-bg hover:text-foreground"
          aria-label={
            isExpanded
              ? `Collapse ${language.name}`
              : `Expand ${language.name}`
          }
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>

        {/* Language information */}

        <button
          type="button"
          onClick={() =>
            setIsExpanded((previous) => !previous)
          }
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">
              {language.name}
            </span>

            <span className="rounded bg-muted-bg px-2 py-0.5 text-xs font-medium text-secondary">
              {language.code}
            </span>

            {language.is_default && (
              <span className="rounded bg-foreground px-2 py-0.5 text-xs font-medium text-white">
                Default
              </span>
            )}

            {!language.is_active && (
              <span className="rounded border border-border bg-light-bg px-2 py-0.5 text-xs font-medium text-secondary">
                Inactive
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-muted">
            {totalRegionCount}{" "}
            {totalRegionCount === 1
              ? "region"
              : "regions"}
          </p>
        </button>

        {/* Status */}

        <div className="hidden items-center gap-2 sm:flex">
          <span
            className={`h-2 w-2 rounded-full ${
              language.is_active
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
          />

          <span className="text-sm text-secondary">
            {language.is_active
              ? "Active"
              : "Inactive"}
          </span>
        </div>

        {/* Edit */}

        <Link
          href={`/admin/languages/${language.code}/edit`}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-foreground transition hover:bg-light-bg"
        >
          <Pencil className="h-4 w-4" />

          <span className="hidden sm:inline">
            Edit
          </span>
        </Link>
      </div>

      {/* ============================================== */}
      {/* REGIONS */}
      {/* ============================================== */}

      {isExpanded && (
        <LanguageRegions
          language={language}
          regions={regions}
        />
      )}
    </div>
  );
}