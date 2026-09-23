"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import EditLanguagesDialog from "./EditLanguagesDialog";

interface ProfileLanguage {
  id: number;
  language_code: string;
  proficiency:
    | "beginner"
    | "intermediate"
    | "advanced"
    | "fluent";
  is_native: boolean;
  locales?: {
    code: string;
    name: string;
  } | null;
}

interface LanguagesSectionTranslations {
  title: string;
  description: string;
  edit_languages: string;
  language: string;
  proficiency: string;
  native: string;
  no_languages: string;

  dialog_title: string;
  dialog_description: string;
  native_language: string;
  remove_language: string;
  no_languages_dialog: string;
  add_language: string;
  cancel: string;
  saving: string;
  save_changes: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  fluent: string;
  save_error: string;
}

interface LanguagesSectionProps {
  profileId: string;
  languages: ProfileLanguage[];
  availableLanguages: {
    code: string;
    name: string;
  }[];
  translations: LanguagesSectionTranslations;
}

export default function LanguagesSection({
  profileId,
  languages,
  availableLanguages,
  translations,
}: LanguagesSectionProps) {
  const [open, setOpen] = useState(false);

  const proficiencyLabels: Record<
    ProfileLanguage["proficiency"],
    string
  > = {
    beginner: translations.beginner,
    intermediate: translations.intermediate,
    advanced: translations.advanced,
    fluent: translations.fluent,
  };

  return (
    <>
      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {translations.title}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {translations.description}
            </p>
          </div>

          <Button onClick={() => setOpen(true)}>
            {translations.edit_languages}
          </Button>
        </div>

        {languages.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-xl border">
            {/* Header */}
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_90px] border-b px-4 py-3 text-sm font-medium text-muted-foreground">
              <span>{translations.language}</span>

              <span>{translations.proficiency}</span>

              <span className="text-right">
                {translations.native}
              </span>
            </div>

            {/* Languages */}
            {languages.map((language) => (
              <div
                key={language.id}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_90px] items-center px-4 py-3 text-sm"
              >
                {/* Language */}
                <span className="min-w-0 font-medium">
                  {language.locales?.name ??
                    language.language_code}
                </span>

                {/* Proficiency */}
                <span className="text-muted-foreground">
                  {proficiencyLabels[language.proficiency]}
                </span>

                {/* Native */}
                <span className="flex justify-end">
                  {language.is_native ? (
                    <span className="inline-flex whitespace-nowrap rounded-full bg-secondary px-3 py-1 text-sm font-medium text-white">
                      {translations.native}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      —
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed p-5 text-center">
            <p className="text-sm text-muted-foreground">
              {translations.no_languages}
            </p>
          </div>
        )}
      </Card>

      <EditLanguagesDialog
        open={open}
        onOpenChange={setOpen}
        profileId={profileId}
        languages={languages}
        availableLanguages={availableLanguages}
        translations={{
          title: translations.dialog_title,
          description: translations.dialog_description,
          language: translations.language,
          proficiency: translations.proficiency,
          native_language: translations.native_language,
          native: translations.native,
          remove_language: translations.remove_language,
          no_languages: translations.no_languages_dialog,
          add_language: translations.add_language,
          cancel: translations.cancel,
          saving: translations.saving,
          save_changes: translations.save_changes,
          beginner: translations.beginner,
          intermediate: translations.intermediate,
          advanced: translations.advanced,
          fluent: translations.fluent,
          save_error: translations.save_error,
        }}
      />
    </>
  );
}