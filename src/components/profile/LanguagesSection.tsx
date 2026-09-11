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
  }[] | null;
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
          >
            Edit
          </Button>
        </div>

        {languages.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-xl border">
            <div className="grid grid-cols-[1fr_1fr_auto] border-b px-4 py-3 text-sm font-medium text-muted-foreground">
              <span>Language</span>
              <span>Proficiency</span>
              <span className="text-right">Native</span>
            </div>

            {languages.map((language) => (
              <div
                key={language.id}
                className="grid grid-cols-[1fr_1fr_auto] items-center px-4 py-3 text-sm"
              >
                <span className="font-medium">
                  {language.locales?.[0]?.name ??
                    language.language_code}
                </span>

                <span className="capitalize text-muted-foreground">
                  {language.proficiency}
                </span>

                <span className="text-right">
                  {language.is_native ? (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
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