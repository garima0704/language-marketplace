"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Pencil,
  Loader2,
} from "lucide-react";
import { useState } from "react";

type TranslationRowData = {
  translationKey: string;
  name: string;
  section: string;
  english: string;
  translatedCount: number;
  totalLanguages: number;
  isComplete: boolean;
  isActive: boolean;
};

type Props = {
  translation: TranslationRowData;
};

function formatSection(section: string) {
  return section
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

export default function TranslationRow({
  translation,
}: Props) {
  const router = useRouter();

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleToggleActive() {
    setError("");
    setIsUpdating(true);

    try {
      const response = await fetch(
        "/api/admin/translations",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            translation_key:
              translation.translationKey,
            is_active:
              !translation.isActive,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to update translation status."
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update translation status."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="px-6 py-4 align-middle">
          <span className="font-medium text-foreground">
            {translation.name}
          </span>
        </td>

        <td className="px-6 py-4 align-middle">
          <span className="text-secondary">
            {formatSection(
              translation.section
            )}
          </span>
        </td>

        <td className="px-6 py-4 align-middle">
          <p className="max-w-xs truncate text-secondary">
            {translation.english ||
              "—"}
          </p>
        </td>

        <td className="px-6 py-4 align-middle">
          <span className="text-secondary">
            {translation.translatedCount}/
            {Math.max(
              translation.totalLanguages -
                1,
              0
            )}
          </span>
        </td>

        <td className="px-6 py-4 align-middle">
          <span className="font-medium text-secondary">
            {translation.isComplete
              ? "Complete"
              : "Incomplete"}
          </span>
        </td>

        <td className="px-6 py-4 align-middle">
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/translations/${encodeURIComponent(
                translation.translationKey
              )}`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
            >
              <Eye className="h-4 w-4" />
              View
            </Link>

            <Link
              href={`/admin/translations/${encodeURIComponent(
                translation.translationKey
              )}/edit`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>

            <button
              type="button"
              onClick={
                handleToggleActive
              }
              disabled={isUpdating}
              className="inline-flex h-9 min-w-[76px] items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-secondary transition hover:bg-muted-bg hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : translation.isActive ? (
                "Hide"
              ) : (
                "Unhide"
              )}
            </button>
          </div>
        </td>
      </tr>

      {error && (
        <tr>
          <td
            colSpan={6}
            className="px-6 pb-3"
          >
            <p className="text-xs text-foreground">
              {error}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}