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

interface LanguagesSectionProps {
  profileId: string;
  languages: ProfileLanguage[];
  availableLanguages: {
    code: string;
    name: string;
  }[];
}

export default function LanguagesSection({
  profileId,
  languages,
  availableLanguages,
}: LanguagesSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Languages
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Languages you speak and your proficiency level.
            </p>
          </div>

          <Button onClick={() => setOpen(true)}>
            Edit Languages
          </Button>
        </div>

        {languages.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-xl border">
            {/* Header */}
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_90px] border-b px-4 py-3 text-sm font-medium text-muted-foreground">
              <span>Language</span>
              <span>Proficiency</span>
              <span className="text-right">Native</span>
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
                <span className="capitalize text-muted-foreground">
                  {language.proficiency}
                </span>

                {/* Native */}
                <span className="flex justify-end">
                  {language.is_native ? (
                    <span className="inline-flex whitespace-nowrap rounded-full bg-secondary px-3 py-1 text-sm font-medium text-white">
                      Native
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
              You haven't added any languages yet.
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
      />
    </>
  );
}

