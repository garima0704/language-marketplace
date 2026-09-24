"use client";

import { useState } from "react";
import { calculateAge } from "@/lib/utils";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import EditProfileDialog from "./EditProfileDialog";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  date_of_birth: string | null;
  gender: string | null;
  is_creator: boolean;
  created_at: string;
}

interface BasicDetailsTranslations {
  edit_profile: string;
  bio: string;
  no_bio: string;
  years_old: string;
  creator: string;

  edit_basic_details: string;
  change_photo: string;
  uploading: string;
  image_formats: string;
  max_file_size: string;

  display_name: string;
  display_name_required: string;

  username: string;
  username_locked_description: string;

  country: string;
  country_placeholder: string;

  date_of_birth: string;

  gender: string;
  select_gender: string;
  gender_female: string;
  gender_male: string;

  bio_placeholder: string;

  cancel: string;
  saving: string;
  save_changes: string;

  max_file_size_error: string;
  invalid_image_type: string;
  photo_upload_error: string;
}

interface BasicDetailsSectionProps {
  profile: Profile;
  translations: BasicDetailsTranslations;
}

export default function BasicDetailsSection({
  profile,
  translations,
}: BasicDetailsSectionProps) {
  const [open, setOpen] = useState(false);

  const initials =
    profile.display_name
      ?.split(" ")
      .filter(Boolean)
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase() || "U";

  const genderLabels: Record<string, string> = {
    female: translations.gender_female,
    male: translations.gender_male,
  };

  const gender = profile.gender
    ? genderLabels[profile.gender] ?? profile.gender
    : "";

  const age = calculateAge(profile.date_of_birth);
  return (
    <>
      <Card className="rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col gap-8">
          {/* Header */}

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={profile.avatar_url ?? ""}
                />

                <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold">
                  {profile.display_name}
                </h1>

                <p className="text-muted-foreground">
                  @{profile.username}
                </p>

                {/* Gender / Age / Country */}

                {(gender ||
                  age !== null ||
                  profile.country) && (
                  <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                    {gender && (
                      <span>{gender}</span>
                    )}

                    {age !== null && (
                      <>
                        {gender && <span>·</span>}

                        <span>
                          {age} {translations.years_old}
                        </span>
                      </>
                    )}

                    {profile.country && (
                      <>
                        {(gender || age !== null) && (
                          <span>·</span>
                        )}

                        <span>
                          {profile.country}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Creator */}

                {profile.is_creator && (
                  <span className="inline-flex whitespace-nowrap rounded-full bg-secondary px-3 py-1 text-sm font-medium text-white">
                    {translations.creator}
                  </span>
                )}
              </div>
            </div>

            <Button onClick={() => setOpen(true)}>
              {translations.edit_profile}
            </Button>
          </div>

          {/* Bio */}

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold">
              {translations.bio}
            </h2>

            <div className="mt-3">
              {profile.bio ? (
                <p className="leading-7 text-muted-foreground">
                  {profile.bio}
                </p>
              ) : (
                <p className="italic text-muted-foreground">
                  {translations.no_bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <EditProfileDialog
        open={open}
        onOpenChange={setOpen}
        profile={profile}
        translations={{
          title: translations.edit_basic_details,
          change_photo: translations.change_photo,
          uploading: translations.uploading,
          image_formats: translations.image_formats,
          max_file_size: translations.max_file_size,

          display_name: translations.display_name,
          display_name_required:
            translations.display_name_required,

          username: translations.username,
          username_locked_description:
            translations.username_locked_description,

          country: translations.country,
          country_placeholder:
            translations.country_placeholder,

          date_of_birth:
            translations.date_of_birth,

          gender: translations.gender,
          select_gender:
            translations.select_gender,
          gender_female:
            translations.gender_female,
          gender_male:
            translations.gender_male,

          bio: translations.bio,
          bio_placeholder:
            translations.bio_placeholder,

          cancel: translations.cancel,
          saving: translations.saving,
          save_changes:
            translations.save_changes,

          max_file_size_error:
            translations.max_file_size_error,
          invalid_image_type:
            translations.invalid_image_type,
          photo_upload_error:
            translations.photo_upload_error,
        }}
      />
    </>
  );
}