"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Plus,
  Trash2,
} from "lucide-react";

import {
  saveProfileLanguages,
  saveProfile,
  saveProfileSocialLinks,
} from "@/app/actions/profile";

import { createClient } from "@/lib/supabase/client";

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
  code: string;
  name: string;
};

type ProfileLanguage = {
  id: string;
  language_code: string;
  proficiency: Proficiency;
  is_native: boolean;
  locales?: {
    code: string;
    name: string;
  } | null;
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

type PayoutMethod = "stripe" | "paypal" | "bank";

export interface SellerOnboardingDialogTranslations {
  /* Seller onboarding */

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
  username_locked_description: string;

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
  
  max_file_size_error: string;
  invalid_image_type: string;
  photo_upload_error: string;

  save_profile_error: string;
  save_languages_error: string;
  save_social_links_error: string;

  /* Seller / payout */

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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  profile: Profile;

  languages: ProfileLanguage[];
  availableLanguages: Language[];

  socialLinks: SocialLink[];
  availablePlatforms: SocialPlatform[];

  translations: SellerOnboardingDialogTranslations;
};

export default function SellerOnboardingDialog({
  open,
  onOpenChange,
  profile,
  languages: initialLanguages,
  availableLanguages,
  socialLinks: initialSocialLinks,
  availablePlatforms,
  translations,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Existing profile data is used as the initial state.
   * Therefore anything already completed in Profile Onboarding
   * automatically appears here.
   */
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [displayName, setDisplayName] = useState(
    profile.display_name || ""
  );
  const [bio, setBio] = useState(profile.bio || "");
  const [country, setCountry] = useState(profile.country || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    profile.date_of_birth || ""
  );
  const [gender, setGender] = useState(profile.gender || "");

  const [languages, setLanguages] =
    useState<ProfileLanguage[]>(initialLanguages);

  const [socialLinks, setSocialLinks] =
    useState<SocialLink[]>(initialSocialLinks);

  const [payoutMethod, setPayoutMethod] =
    useState<PayoutMethod>("stripe");

  const [paypalEmail, setPaypalEmail] = useState("");

  const [accountHolderName, setAccountHolderName] =
    useState("");

  const [bankName, setBankName] = useState("");

  const [accountNumber, setAccountNumber] =
    useState("");

  const [iban, setIban] = useState("");

  const [swiftCode, setSwiftCode] =
    useState("");

  /*
   * Keep the dialog synchronized with the latest profile data.
   *
   * This matters if the parent refreshes the profile after
   * Profile Onboarding or another profile update.
   */
  useEffect(() => {
    if (!open) return;

    setAvatarUrl(profile.avatar_url || "");
    setDisplayName(profile.display_name || "");
    setBio(profile.bio || "");
    setCountry(profile.country || "");
    setDateOfBirth(profile.date_of_birth || "");
    setGender(profile.gender || "");

    setLanguages(initialLanguages);
    setSocialLinks(initialSocialLinks);

    setStep(1);
    setError("");
  }, [
    open,
    profile,
    initialLanguages,
    initialSocialLinks,
  ]);

  /*
   * ---------------------------------------------------------
   * Profile / Step 1
   * ---------------------------------------------------------
   */

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (file.size > 5 * 1024 * 1024) {
      setError(translations.max_file_size_error);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(translations.invalid_image_type);
      return;
    }

    try {
      setLoading(true);

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${profile.id}/${Date.now()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch {
      setError(translations.photo_upload_error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextFromProfile = async () => {
    setError("");

    if (!displayName.trim()) {
      setError(translations.display_name_required);
      return;
    }

    try {
      setLoading(true);

      const result = await saveProfile({
        display_name: displayName.trim(),
        avatar_url: avatarUrl || null,
        bio: bio.trim() || null,
        country: country.trim() || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
      });

      if (!result?.success) {
        throw new Error(
          result?.error || translations.save_profile_error
        );
      }

      setStep(2);
    } catch {
      setError(translations.save_profile_error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Languages / Step 2
   * ---------------------------------------------------------
   */

  const handleAddLanguage = () => {
    const firstAvailable = availableLanguages.find(
      (language) =>
        !languages.some(
          (item) => item.language_code === language.code
        )
    );

    if (!firstAvailable) return;

    setLanguages((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        language_code: firstAvailable.code,
        proficiency: "beginner",
        is_native: current.length === 0,
        locales: {
          code: firstAvailable.code,
          name: firstAvailable.name,
        },
      },
    ]);
  };

  const handleRemoveLanguage = (id: string) => {
    setLanguages((current) =>
      current.filter((language) => language.id !== id)
    );
  };

  const handleLanguageChange = (
    id: string,
    languageCode: string
  ) => {
    const language = availableLanguages.find(
      (item) => item.code === languageCode
    );

    setLanguages((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              language_code: languageCode,
              locales: language
                ? {
                    code: language.code,
                    name: language.name,
                  }
                : item.locales,
            }
          : item
      )
    );
  };

  const handleProficiencyChange = (
    id: string,
    proficiency: Proficiency
  ) => {
    setLanguages((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, proficiency }
          : item
      )
    );
  };

  const handleNativeChange = (
    id: string,
    checked: boolean
  ) => {
    setLanguages((current) =>
      current.map((item) => ({
        ...item,
        is_native: checked
          ? item.id === id
          : item.id === id
            ? false
            : item.is_native,
      }))
    );
  };

  const handleNextFromLanguages = async () => {
    setError("");

    try {
      setLoading(true);

      const result = await saveProfileLanguages(
        languages.map((language) => ({
          language_code: language.language_code,
          proficiency: language.proficiency,
          is_native: language.is_native,
        }))
      );

      if (!result?.success) {
        throw new Error(
          result?.error || translations.save_languages_error
        );
      }

      setStep(3);
    } catch (error) {
      console.error("Failed to save languages:", error);
      setError(translations.save_languages_error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Social Links / Step 3
   * ---------------------------------------------------------
   */

  const handleAddSocialLink = () => {
    if (!availablePlatforms.length) return;

    setSocialLinks((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        platform: availablePlatforms[0].slug,
        url: "",
      },
    ]);
  };

  const handleRemoveSocialLink = (id: string) => {
    setSocialLinks((current) =>
      current.filter((link) => link.id !== id)
    );
  };

  const handleSocialPlatformChange = (
    id: string,
    platform: string
  ) => {
    setSocialLinks((current) =>
      current.map((link) =>
        link.id === id
          ? { ...link, platform }
          : link
      )
    );
  };

  const handleSocialUrlChange = (
    id: string,
    url: string
  ) => {
    setSocialLinks((current) =>
      current.map((link) =>
        link.id === id
          ? { ...link, url }
          : link
      )
    );
  };

  const handleNextFromSocialLinks = async () => {
    setError("");

    try {
      setLoading(true);

      const cleanedLinks = socialLinks
        .filter((link) => link.url.trim())
        .map((link) => ({
          platform: link.platform,
          url: link.url.trim(),
        }));

      const result = await saveProfileSocialLinks(cleanedLinks);

      if (!result?.success) {
        throw new Error(
          result?.error || translations.save_social_links_error
        );
      }

      setStep(4);
    } catch (error) {
      console.error("Failed to save social links:", error);
      setError(translations.save_social_links_error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Payout / Step 4
   * ---------------------------------------------------------
   */

  const setCreatorAndContinue = async () => {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        is_creator: true,
      })
      .eq("id", profile.id);

    if (profileError) {
      throw profileError;
    }

    onOpenChange(false);
    router.push("/seller/dashboard");
    router.refresh();
  };

  const handleStripeConnect = async () => {
    setError("");

    try {
      setLoading(true);

      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result?.url) {
        throw new Error(
          result?.error ||
            translations.stripe_connect_error
        );
      }

      /*
       * Stripe onboarding continues outside NiceConvo.
       * The API is responsible for creating/continuing the
       * Stripe Connect onboarding flow.
       */
      window.location.href = result.url;
    } catch {
      setError(translations.stripe_connect_error);
      setLoading(false);
    }
  };

  const handleSavePayPal = async () => {
    setError("");

    if (!paypalEmail.trim()) {
      setError(translations.paypal_email_required);
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(translations.payout_error);
      }

      const { error: payoutError } = await supabase
        .from("creator_payout_accounts")
        .insert({
          user_id: user.id,
          provider: "paypal",
          paypal_email: paypalEmail.trim(),
          is_default: true,
          status: "pending",
        });

      if (payoutError) {
        throw payoutError;
      }

      await setCreatorAndContinue();
    } catch {
      setError(translations.payout_error);
      setLoading(false);
    }
  };

  const handleSaveBank = async () => {
    setError("");

    if (
      !accountHolderName.trim() ||
      !bankName.trim() ||
      !accountNumber.trim()
    ) {
      setError(translations.bank_details_required);
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(translations.payout_error);
      }

      const { error: payoutError } = await supabase
        .from("creator_payout_accounts")
        .insert({
          user_id: user.id,
          provider: "bank",
          account_holder_name:
            accountHolderName.trim(),
          bank_name: bankName.trim(),
          account_number: accountNumber.trim(),
          iban: iban.trim() || null,
          swift_code: swiftCode.trim() || null,
          is_default: true,
          status: "pending",
        });

      if (payoutError) {
        throw payoutError;
      }

      await setCreatorAndContinue();
    } catch {
      setError(translations.payout_error);
      setLoading(false);
    }
  };

  const handleSavePayout = async () => {
    if (payoutMethod === "paypal") {
      await handleSavePayPal();
      return;
    }

    if (payoutMethod === "bank") {
      await handleSaveBank();
      return;
    }

    await handleStripeConnect();
  };

  /*
   * ---------------------------------------------------------
   * Navigation
   * ---------------------------------------------------------
   */

  const handleBack = () => {
    if (loading) return;

    setError("");

    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 4) {
      setStep(3);
    }
  };

  const handleDialogChange = (value: boolean) => {
    if (loading) return;

    onOpenChange(value);

    if (!value) {
      setStep(1);
      setError("");
    }
  };

  /*
   * ---------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------
   */

  const getProficiencyLabel = (
    proficiency: Proficiency
  ) => {
    switch (proficiency) {
      case "beginner":
        return translations.proficiency_beginner;
      case "intermediate":
        return translations.proficiency_intermediate;
      case "advanced":
        return translations.proficiency_advanced;
      case "fluent":
        return translations.proficiency_fluent;
    }
  };

  const getPlatform = (slug: string) =>
    availablePlatforms.find(
      (platform) => platform.slug === slug
    );

  return (
    <Dialog
      open={open}
      onOpenChange={handleDialogChange}
    >
      <DialogContent
        showCloseButton={!loading}
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === 1
              ? translations.basic_details
              : step === 2
                ? translations.languages
                : step === 3
                  ? translations.social_links
                  : translations.become_a_seller}
          </DialogTitle>

          <DialogDescription>
            {step === 1
              ? translations.basic_details_description
              : step === 2
                ? translations.languages_description
                : step === 3
                  ? translations.social_links_description
                  : translations.become_a_seller_description}
          </DialogDescription>
        </DialogHeader>


        {/* Progress */}

        <div className="mt-4 flex items-center">
          {[
            {
              number: 1,
              label: translations.basic_details,
            },
            {
              number: 2,
              label: translations.languages,
            },
            {
              number: 3,
              label: translations.social_links,
            },
            {
              number: 4,
              label: translations.payout,
            },
          ].map((item, index) => (
            <div
              key={item.number}
              className="flex flex-1 items-center"
            >
              <div className="flex items-center gap-2">
                <div
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                    step >= item.number
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {item.number}
                </div>

                <span
                  className={[
                    "hidden text-sm sm:block",
                    step >= item.number
                      ? "font-medium"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </div>

              {index < 3 && (
                <div className="mx-3 h-px flex-1 bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* ================================================= */}
        {/* STEP 1 - BASIC DETAILS */}
        {/* ================================================= */}

        {step === 1 && (
          <div className="space-y-6 pt-4">
            <div className="rounded-xl border p-5">
              <div className="grid gap-6 md:grid-cols-[150px_minmax(0,1fr)]">
                {/* Avatar */}

                <div className="flex flex-col items-center">
                  <Avatar className="h-28 w-28">
                    <AvatarImage
                      src={avatarUrl}
                      alt={displayName}
                    />

                    <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                      {displayName
                        .split(" ")
                        .filter(Boolean)
                        .map((name) => name.charAt(0))
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={handleAvatarUpload}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-full"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={loading}
                  >
                    {loading
                      ? translations.uploading
                      : translations.change_photo}
                  </Button>

                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    {translations.image_formats}
                    <br />
                    {translations.max_file_size}
                  </p>
                </div>

                {/* Details */}

                <div className="space-y-5">
                  {/* Display Name */}

                  <div className="space-y-2">
                    <Label htmlFor="seller-display-name">
                      {translations.display_name}
                    </Label>

                    <Input
                      id="seller-display-name"
                      value={displayName}
                      onChange={(event) =>
                        setDisplayName(event.target.value)
                      }
                      disabled={loading}
                    />
                  </div>

                  {/* Username */}

                  <div className="space-y-2">
                    <Label htmlFor="seller-username">
                      {translations.username}
                    </Label>

                    <Input
                      id="seller-username"
                      value={`@${profile.username}`}
                      disabled
                    />

                    <p className="text-xs text-muted-foreground">
                      {translations.username_locked_description}
                    </p>
                  </div>

                  {/* Country */}

                  <div className="space-y-2">
                    <Label htmlFor="seller-country">
                      {translations.country}
                    </Label>

                    <Input
                      id="seller-country"
                      value={country}
                      onChange={(event) =>
                        setCountry(event.target.value)
                      }
                      disabled={loading}
                      placeholder={
                        translations.country_placeholder
                      }
                    />
                  </div>

                  {/* Date of Birth + Gender */}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="seller-dob">
                        {translations.date_of_birth}
                      </Label>

                      <Input
                        id="seller-dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(event) =>
                          setDateOfBirth(event.target.value)
                        }
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seller-gender">
                        {translations.gender}
                      </Label>

                      <select
                        id="seller-gender"
                        value={gender}
                        onChange={(event) =>
                          setGender(event.target.value)
                        }
                        disabled={loading}
                        className="
                          h-10
                          w-full
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
                        <option value="">
                          {translations.select_gender}
                        </option>

                        <option value="female">
                          {translations.gender_female}
                        </option>

                        <option value="male">
                          {translations.gender_male}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Bio */}

                  <div className="space-y-2">
                    <Label htmlFor="seller-bio">
                      {translations.bio}
                    </Label>

                    <Textarea
                      id="seller-bio"
                      value={bio}
                      onChange={(event) =>
                        setBio(event.target.value)
                      }
                      disabled={loading}
                      placeholder={translations.bio_placeholder}
                      rows={4}
                      maxLength={500}
                    />

                    <div className="flex justify-end">
                      <span className="text-xs text-muted-foreground">
                        {bio.length}/500
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={loading}
                onClick={() => setStep(2)}
              >
                {translations.skip_for_now}
              </Button>

              <Button
                type="button"
                disabled={loading}
                onClick={handleNextFromProfile}
              >
                {loading
                  ? translations.saving
                  : translations.continue}
              </Button>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* STEP 2 - LANGUAGES */}
        {/* ================================================= */}

        {step === 2 && (
          <div className="space-y-6 pt-4">
            {languages.length > 0 ? (
              <div className="overflow-hidden rounded-xl border">
                <div
                  className="
                    hidden
                    grid-cols-[minmax(0,1fr)_180px_90px_40px]
                    items-center
                    gap-4
                    border-b
                    bg-light-bg
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-muted-foreground/70
                    sm:grid
                  "
                >
                  <span>{translations.language}</span>
                  <span>{translations.proficiency}</span>
                  <span className="text-center">
                    {translations.native}
                  </span>
                  <span />
                </div>

                <div>
                  {languages.map((language, index) => (
                    <div
                      key={language.id}
                      className={`
                        px-4
                        py-4
                        ${
                          index !== languages.length - 1
                            ? "border-b"
                            : ""
                        }
                      `}
                    >
                      <div
                        className="
                          grid
                          gap-4
                          sm:grid-cols-[minmax(0,1fr)_180px_90px_40px]
                          sm:items-center
                        "
                      >
                        {/* Language */}

                        <div className="min-w-0">
                          <label className="mb-2 block text-sm font-medium sm:hidden">
                            {translations.language}
                          </label>

                          <select
                            value={language.language_code}
                            onChange={(event) =>
                              handleLanguageChange(
                                language.id,
                                event.target.value
                              )
                            }
                            disabled={loading}
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
                            "
                          >
                            {availableLanguages.map(
                              (available) => (
                                <option
                                  key={available.code}
                                  value={available.code}
                                  disabled={languages.some(
                                    (existing) =>
                                      existing.id !==
                                        language.id &&
                                      existing.language_code ===
                                        available.code
                                  )}
                                >
                                  {available.name}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* Proficiency */}

                        <div>
                          <label className="mb-2 block text-sm font-medium sm:hidden">
                            {translations.proficiency}
                          </label>

                          <select
                            value={language.proficiency}
                            onChange={(event) =>
                              handleProficiencyChange(
                                language.id,
                                event.target.value as Proficiency
                              )
                            }
                            disabled={loading}
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
                            "
                          >
                            {(
                              [
                                "beginner",
                                "intermediate",
                                "advanced",
                                "fluent",
                              ] as Proficiency[]
                            ).map((value) => (
                              <option
                                key={value}
                                value={value}
                              >
                                {getProficiencyLabel(value)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Native */}

                        <div className="flex items-center justify-between sm:justify-center">
                          <label className="text-sm font-medium sm:hidden">
                            {translations.native_language}
                          </label>

                          <input
                            type="checkbox"
                            checked={language.is_native}
                            onChange={(event) =>
                              handleNativeChange(
                                language.id,
                                event.target.checked
                              )
                            }
                            disabled={loading}
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
                              handleRemoveLanguage(language.id)
                            }
                            disabled={loading}
                            aria-label={
                              translations.remove_language
                            }
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
              <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {translations.no_languages}
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddLanguage}
              disabled={
                loading ||
                languages.length >= availableLanguages.length
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              {translations.add_language}
            </Button>

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                {translations.back}
              </Button>

              <Button
                type="button"
                onClick={handleNextFromLanguages}
                disabled={loading}
              >
                {loading
                  ? translations.saving
                  : translations.continue}
              </Button>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* STEP 3 - SOCIAL LINKS */}
        {/* ================================================= */}

        {step === 3 && (
          <div className="space-y-6 pt-4">
            {socialLinks.length > 0 ? (
              <div className="overflow-hidden rounded-xl border">
                <div
                  className="
                    hidden
                    grid-cols-[180px_minmax(0,1fr)_40px]
                    items-center
                    gap-4
                    border-b
                    bg-light-bg
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-muted-foreground/70
                    sm:grid
                  "
                >
                  <span>{translations.platform}</span>
                  <span>{translations.profile}</span>
                  <span />
                </div>

                <div>
                  {socialLinks.map((link, index) => {
                    const platform = getPlatform(link.platform);

                    let value = link.url;

                    if (
                      platform &&
                      value.startsWith(platform.url_prefix || "")
                    ) {
                      value = value.slice(
                        (platform.url_prefix || "").length
                      );
                    }

                    return (
                      <div
                        key={link.id}
                        className={`
                          px-4
                          py-4
                          ${
                            index !== socialLinks.length - 1
                              ? "border-b"
                              : ""
                          }
                        `}
                      >
                        <div
                          className="
                            grid
                            gap-4
                            sm:grid-cols-[180px_minmax(0,1fr)_40px]
                            sm:items-center
                          "
                        >
                          {/* Platform */}

                          <div className="min-w-0">
                            <label className="mb-2 block text-sm font-medium sm:hidden">
                              {translations.platform}
                            </label>

                            <select
                              value={link.platform}
                              disabled={loading}
                              onChange={(event) =>
                                handleSocialPlatformChange(
                                  link.id,
                                  event.target.value
                                )
                              }
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
                              "
                            >
                              {availablePlatforms.map(
                                (available) => (
                                  <option
                                    key={available.id}
                                    value={available.slug}
                                    disabled={socialLinks.some(
                                      (existing) =>
                                        existing.id !== link.id &&
                                        existing.platform ===
                                          available.slug
                                    )}
                                  >
                                    {available.name}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {/* Profile */}

                          <div className="min-w-0">
                            <label className="mb-2 block text-sm font-medium sm:hidden">
                              {translations.profile}
                            </label>

                            <div className="flex min-w-0">
                              <span
                                className="
                                  flex
                                  h-10
                                  max-w-[55%]
                                  shrink-0
                                  items-center
                                  overflow-hidden
                                  whitespace-nowrap
                                  rounded-l-md
                                  border
                                  border-r-0
                                  border-input
                                  bg-light-bg
                                  px-3
                                  text-sm
                                  text-muted-foreground
                                "
                                title={
                                  platform?.url_prefix || ""
                                }
                              >
                                {platform?.url_prefix}
                              </span>

                              <Input
                                value={value}
                                onChange={(event) =>
                                  handleSocialUrlChange(
                                    link.id,
                                    event.target.value
                                  )
                                }
                                placeholder={
                                  platform?.placeholder ??
                                  translations.your_username
                                }
                                disabled={loading}
                                className="h-10 min-w-0 rounded-l-none"
                              />
                            </div>
                          </div>

                          {/* Remove */}

                          <div className="flex justify-end sm:justify-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveSocialLink(link.id)
                              }
                              disabled={loading}
                              aria-label={
                                translations.remove_social_link
                              }
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {translations.no_social_links}
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddSocialLink}
              disabled={
                loading ||
                socialLinks.length >= availablePlatforms.length
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              {translations.add_link}
            </Button>

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                {translations.back}
              </Button>

              <Button
                type="button"
                onClick={handleNextFromSocialLinks}
                disabled={loading}
              >
                {loading
                  ? translations.saving
                  : translations.continue}
              </Button>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* STEP 4 - PAYOUT */}
        {/* ================================================= */}

        {step === 4 && (
          <div className="space-y-6 pt-4">
            {/* Stripe */}

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                setPayoutMethod("stripe")
              }
              className={`w-full rounded-xl border p-5 text-left transition ${
                payoutMethod === "stripe"
                  ? "border-foreground"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {translations.stripe}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {translations.stripe_description}
                  </p>
                </div>

                <span className="shrink-0 rounded-full border px-2 py-1 text-xs">
                  {translations.stripe_recommended}
                </span>
              </div>
            </button>

            {/* PayPal */}

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                setPayoutMethod("paypal")
              }
              className={`w-full rounded-xl border p-5 text-left transition ${
                payoutMethod === "paypal"
                  ? "border-foreground"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <p className="font-medium">
                {translations.paypal}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {translations.paypal_description}
              </p>
            </button>

            {payoutMethod === "paypal" && (
              <div className="space-y-2">
                <Label htmlFor="paypal-email">
                  {translations.paypal_email}
                </Label>

                <Input
                  id="paypal-email"
                  type="email"
                  value={paypalEmail}
                  onChange={(event) =>
                    setPaypalEmail(event.target.value)
                  }
                  disabled={loading}
                />
              </div>
            )}

            {/* Bank */}

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                setPayoutMethod("bank")
              }
              className={`w-full rounded-xl border p-5 text-left transition ${
                payoutMethod === "bank"
                  ? "border-foreground"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <p className="font-medium">
                {translations.bank_account}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {translations.bank_account_description}
              </p>
            </button>

            {payoutMethod === "bank" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="account-holder">
                    {translations.account_holder_name}
                  </Label>

                  <Input
                    id="account-holder"
                    placeholder={
                      translations.account_holder_name_placeholder
                    }
                    value={accountHolderName}
                    onChange={(event) =>
                      setAccountHolderName(
                        event.target.value
                      )
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-name">
                    {translations.bank_name}
                  </Label>

                  <Input
                    id="bank-name"
                    placeholder={
                      translations.bank_name_placeholder
                    }
                    value={bankName}
                    onChange={(event) =>
                      setBankName(event.target.value)
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-number">
                    {translations.account_number}
                  </Label>

                  <Input
                    id="account-number"
                    placeholder={
                      translations.account_number_placeholder
                    }
                    value={accountNumber}
                    onChange={(event) =>
                      setAccountNumber(
                        event.target.value
                      )
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iban">
                    {translations.iban}
                  </Label>

                  <Input
                    id="iban"
                    placeholder={
                      translations.iban_placeholder
                    }
                    value={iban}
                    onChange={(event) =>
                      setIban(event.target.value)
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="swift">
                    {translations.swift_code}
                  </Label>

                  <Input
                    id="swift"
                    placeholder={
                      translations.swift_code_placeholder
                    }
                    value={swiftCode}
                    onChange={(event) =>
                      setSwiftCode(event.target.value)
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleBack}
              >
                {translations.back}
              </Button>

              {payoutMethod === "stripe" ? (
                <Button
                  type="button"
                  disabled={loading}
                  onClick={handleStripeConnect}
                >
                  {loading
                    ? translations.connecting
                    : translations.connect_stripe}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={loading}
                  onClick={handleSavePayout}
                >
                  {loading
                    ? translations.saving
                    : translations.save_continue}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}