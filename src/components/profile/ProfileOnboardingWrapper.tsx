"use client";

import { useState } from "react";

import ProfileOnboardingDialog from "@/components/profile/ProfileOnboardingDialog";

type Language = {
  code: string;
  name: string;
};

type ProfileLanguage = {
  id: number;
  language_code: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "fluent";
  is_native: boolean;
  locales?: {
    code: string;
    name: string;
  }[] | null;
};

type SocialLink = {
  id?: number;
  platform: string;
  url: string;
};

interface ProfileOnboardingWrapperProps {
  shouldOpen: boolean;
  profile: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    country: string | null;
    date_of_birth: string | null;
    gender: string | null;
  };
  languages: ProfileLanguage[];
  availableLanguages: Language[];
  socialLinks: SocialLink[];
}

export default function ProfileOnboardingWrapper({
  shouldOpen,
  profile,
  languages,
  availableLanguages,
  socialLinks,
}: ProfileOnboardingWrapperProps) {
  const [open, setOpen] = useState(shouldOpen);

  return (
    <ProfileOnboardingDialog
      open={open}
      onOpenChange={setOpen}
      profile={profile}
      languages={languages}
      availableLanguages={availableLanguages}
      socialLinks={socialLinks}
    />
  );
}