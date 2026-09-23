"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import SellerOnboardingDialog from "./SellerOnboardingDialog";

type Proficiency =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "fluent";

type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  date_of_birth: string | null;
  gender: string | null;
};

type Language = {
  id: string;
  language_code: string;
  proficiency: Proficiency;
  is_native: boolean;
  locales?: {
    code: string;
    name: string;
  } | null;
};

type AvailableLanguage = {
  code: string;
  name: string;
};

type SocialLink = {
  id: string;
  platform: string;
  url: string;
};

type SocialPlatform = {
  id: string;
  name: string;
  slug: string;
  url_prefix: string | null;
  placeholder: string | null;
};

interface StartSellingButtonProps {
  profile: Profile;
  languages: Language[];
  availableLanguages: AvailableLanguage[];
  socialLinks: SocialLink[];
  availablePlatforms: SocialPlatform[];
  translations: {
    start_selling: string;

    complete_your_profile: string;
    complete_your_profile_description: string;

    basic_details: string;
    basic_details_description: string;

    languages: string;
    languages_description: string;

    social_links: string;
    social_links_description: string;

    change_photo: string;
    uploading: string;
    image_formats: string;
    max_file_size: string;

    display_name: string;
    display_name_required: string;
    username: string;
    username_description: string;
    country: string;
    country_placeholder: string;
    date_of_birth: string;
    gender: string;
    select_gender: string;
    gender_female: string;
    gender_male: string;
    bio: string;
    bio_placeholder: string;

    language: string;
    proficiency: string;
    native: string;
    native_language: string;
    remove_language: string;
    no_languages: string;
    add_language: string;

    proficiency_beginner: string;
    proficiency_intermediate: string;
    proficiency_advanced: string;
    proficiency_fluent: string;

    platform: string;
    profile: string;
    remove_social_link: string;
    no_social_links: string;
    add_link: string;
    your_username: string;

    skip_for_now: string;
    back: string;
    continue: string;
    saving: string;
    finish: string;
    finishing: string;

    max_file_size_error: string;
    invalid_image_type: string;
    photo_upload_error: string;

    save_profile_error: string;
    save_languages_error: string;
    save_social_links_error: string;

    become_a_seller: string;
    become_a_seller_description: string;

    payout: string;
    payout_description: string;

    stripe: string;
    stripe_recommended: string;
    stripe_description: string;
    connect_stripe: string;
    connecting: string;

    paypal: string;
    paypal_description: string;
    paypal_email: string;

    bank_account: string;
    bank_account_description: string;
    account_holder_name: string;
    bank_name: string;
    account_number: string;
    iban: string;
    swift_code: string;

    account_holder_name_placeholder: string;
    bank_name_placeholder: string;
    account_number_placeholder: string;
    iban_placeholder: string;
    swift_code_placeholder: string;

    save_continue: string;
    paypal_email_required: string;
    bank_details_required: string;
    payout_error: string;
    stripe_connect_error: string;
  };
}

export default function StartSellingButton({
  profile,
  languages,
  availableLanguages,
  socialLinks,
  availablePlatforms,
  translations,
}: StartSellingButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="mt-5"
        onClick={() => setOpen(true)}
      >
        {translations.start_selling}
      </Button>

      <SellerOnboardingDialog
        open={open}
        onOpenChange={setOpen}
        profile={profile}
        languages={languages}
        availableLanguages={availableLanguages}
        socialLinks={socialLinks}
        availablePlatforms={availablePlatforms}
        translations={translations}
      />
    </>
  );
}