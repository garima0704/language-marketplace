"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import SellerOnboardingDialog from "./SellerOnboardingDialog";

type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
};

type Language = {
  id: number;
  language_code: string;
  proficiency: string;
  is_native: boolean;
  locales: {
    code: string;
    name: string;
  }[] | null;
};

type AvailableLanguage = {
  code: string;
  name: string;
};

interface StartSellingButtonProps {
  profile: Profile;
  languages: Language[];
  availableLanguages: AvailableLanguage[];
}

export default function StartSellingButton({
  profile,
  languages,
  availableLanguages,
}: StartSellingButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="mt-5"
        onClick={() => setOpen(true)}
      >
        Start Selling
      </Button>

      <SellerOnboardingDialog
        open={open}
        onOpenChange={setOpen}
        profile={profile}
        languages={languages}
        availableLanguages={availableLanguages}
      />
    </>
  );
}