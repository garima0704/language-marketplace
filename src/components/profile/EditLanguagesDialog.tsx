"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { saveOnboardingLanguages } from "@/app/actions/profile-onboarding";

type Proficiency =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "fluent";

interface AvailableLanguage {
  code: string;
  name: string;
}

interface ProfileLanguage {
  id: number;
  language_code: string;
  proficiency: Proficiency;
  is_native: boolean;
  locales?: {
    code: string;
    name: string;
  }[] | null;
}

interface EditableLanguage {
  id: string;
  language_code: string;
  name: string;
  proficiency: Proficiency;
  is_native: boolean;
}

interface EditLanguagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  languages: ProfileLanguage[];
  availableLanguages: AvailableLanguage[];
}

export default function EditLanguagesDialog({
  open,
  onOpenChange,
  languages,
  availableLanguages,
}: EditLanguagesDialogProps) {
  const [items, setItems] = useState<EditableLanguage[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setItems(
      languages.map((language) => ({
        id: String(language.id),
        language_code: language.language_code,
        name:
          language.locales?.[0]?.name ??
          language.language_code,
        proficiency: language.proficiency,
        is_native: language.is_native,
      }))
    );

    setError("");
  }, [open, languages]);

  function addLanguage() {
    const unused = availableLanguages.find(
      (language) =>
        !items.some(
          (item) => item.language_code === language.code
        )
    );

    if (!unused) return;

    setItems((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        language_code: unused.code,
        name: unused.name,
        proficiency: "intermediate",
        is_native: false,
      },
    ]);
  }

  function updateLanguage(
    id: string,
    field: keyof EditableLanguage,
    value: string | boolean
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function removeLanguage(id: string) {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function setNative(id: string, checked: boolean) {
    setItems((current) =>
      current.map((item) => ({
        ...item,
        is_native:
          checked && item.id === id,
      }))
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const result = await saveOnboardingLanguages(
      items.map((item) => ({
        language_code: item.language_code,
        proficiency: item.proficiency,
        is_native: item.is_native,
      }))
    );

    if (!result.success) {
      setError(
        result.error ?? "Failed to save languages."
      );
      setSaving(false);
      return;
    }

    setSaving(false);
    onOpenChange(false);

    window.location.reload();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="
          w-[95vw]
          max-w-3xl
          max-h-[90vh]
          overflow-y-auto
          overflow-x-hidden
          rounded-2xl
          bg-background
          p-8
        "
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Edit Languages
          </DialogTitle>

          <DialogDescription>
            Add the languages you speak and set your
            proficiency level.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-5">
          {items.length > 0 ? (
            <div>
              {/* Table Header */}
              <div
                className="
                  hidden
                  grid-cols-[minmax(0,1fr)_180px_80px_40px]
                  items-center
                  gap-4
                  px-1
                  pb-3
                  text-sm
                  font-medium
                  text-muted-foreground
                  sm:grid
                "
              >
                <span>Language</span>
                <span>Proficiency</span>
                <span className="text-center">
                  Native
                </span>
                <span />
              </div>

              {/* Language Rows */}
              <div>
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`
                      py-4
                      ${
                        index !== items.length - 1
                          ? "border-b"
                          : ""
                      }
                    `}
                  >
                    <div
                      className="
                        grid
                        gap-4
                        sm:grid-cols-[minmax(0,1fr)_180px_80px_40px]
                        sm:items-center
                      "
                    >
                      {/* Language */}
                      <div className="min-w-0">
                        <label className="mb-2 block text-sm font-medium text-foreground sm:hidden">
                          Language
                        </label>

                        <select
                          value={item.language_code}
                          onChange={(e) => {
                            const selectedLanguage =
                              availableLanguages.find(
                                (language) =>
                                  language.code ===
                                  e.target.value
                              );

                            updateLanguage(
                              item.id,
                              "language_code",
                              e.target.value
                            );

                            if (selectedLanguage) {
                              updateLanguage(
                                item.id,
                                "name",
                                selectedLanguage.name
                              );
                            }
                          }}
                          disabled={saving}
                          className="
                            h-10
                            w-full
                            min-w-0
                            rounded-md
                            border
                            border-input
                            bg-background
                            px-3
                            text-sm
                            outline-none
                            focus:border-foreground/30
                            focus:ring-0
                          "
                        >
                          {availableLanguages.map(
                            (language) => (
                              <option
                                key={language.code}
                                value={language.code}
                                disabled={items.some(
                                  (existing) =>
                                    existing.id !==
                                      item.id &&
                                    existing.language_code ===
                                      language.code
                                )}
                              >
                                {language.name}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      {/* Proficiency */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground sm:hidden">
                          Proficiency
                        </label>

                        <select
                          value={item.proficiency}
                          onChange={(e) =>
                            updateLanguage(
                              item.id,
                              "proficiency",
                              e.target.value as Proficiency
                            )
                          }
                          disabled={saving}
                          className="
                            h-10
                            w-full
                            min-w-0
                            rounded-md
                            border
                            border-input
                            bg-background
                            px-3
                            text-sm
                            outline-none
                            focus:border-foreground/30
                            focus:ring-0
                          "
                        >
                          <option value="beginner">
                            Beginner
                          </option>

                          <option value="intermediate">
                            Intermediate
                          </option>

                          <option value="advanced">
                            Advanced
                          </option>

                          <option value="fluent">
                            Fluent
                          </option>
                        </select>
                      </div>

                      {/* Native */}
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          sm:justify-center
                        "
                      >
                        <label className="text-sm font-medium text-foreground sm:hidden">
                          Native language
                        </label>

                        <input
                          type="checkbox"
                          checked={item.is_native}
                          onChange={(e) =>
                            setNative(
                              item.id,
                              e.target.checked
                            )
                          }
                          disabled={saving}
                          className="h-4 w-4 cursor-pointer"
                        />
                      </div>

                      {/* Remove */}
                      <div className="flex justify-end sm:justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeLanguage(item.id)
                          }
                          disabled={saving}
                          aria-label="Remove language"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No languages added yet.
              </p>
            </div>
          )}

          {/* Add Language */}
          <Button
            type="button"
            variant="outline"
            onClick={addLanguage}
            disabled={
              saving ||
              items.length >= availableLanguages.length
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Language
          </Button>

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="transition-opacity hover:opacity-90"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}