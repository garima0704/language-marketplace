"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

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
  completeProfileOnboarding,
  dismissProfileOnboarding,
  saveOnboardingLanguages,
  saveOnboardingProfile,
  saveOnboardingSocialLinks,
} from "@/app/actions/profile-onboarding";

import { createClient } from "@/lib/supabase/client";

type Proficiency =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "fluent";

type Language = {
  code: string;
  name: string;
};

type ProfileLanguage = {
  id: number;
  language_code: string;
  proficiency: Proficiency;
  is_native: boolean;
  locales?: {
    code: string;
    name: string;
  } | null;
};

type SocialLink = {
  id: number;
  platform: string;
  url: string;
};

type SocialPlatform = {
  id: number;
  name: string;
  slug: string;
  url_prefix: string;
  placeholder: string | null;
};

interface ProfileOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

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
  availablePlatforms: SocialPlatform[];
}

const GENDER_OPTIONS = [
  {
    value: "female",
    label: "Female",
  },
  {
    value: "male",
    label: "Male",
  },
];

const PROFICIENCIES: {
  value: Proficiency;
  label: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
  },
  {
    value: "intermediate",
    label: "Intermediate",
  },
  {
    value: "advanced",
    label: "Advanced",
  },
  {
    value: "fluent",
    label: "Fluent",
  },
];

export default function ProfileOnboardingDialog({
  open,
  onOpenChange,
  profile,
  languages: initialLanguages,
  availableLanguages,
  socialLinks: initialSocialLinks,
  availablePlatforms,
}: ProfileOnboardingDialogProps) {
  const router = useRouter();
  const supabase = createClient();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] =
    useState(profile.avatar_url ?? "");

  const [displayName, setDisplayName] =
    useState(profile.display_name ?? "");

  const [bio, setBio] =
    useState(profile.bio ?? "");

  const [country, setCountry] =
    useState(profile.country ?? "");

  const [dateOfBirth, setDateOfBirth] =
    useState(profile.date_of_birth ?? "");

  const [gender, setGender] =
    useState(profile.gender ?? "");

  const [languages, setLanguages] =
    useState<ProfileLanguage[]>(
      initialLanguages
    );

  const [socialLinks, setSocialLinks] =
    useState<SocialLink[]>(
      initialSocialLinks
    );

  async function handleAvatarUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setError(null);

    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Maximum file size is 5 MB.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG and WebP files are allowed."
      );
      return;
    }

    setLoading(true);

    try {
      const fileExt =
        file.name.split(".").pop();

      const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(fileName, file, {
            upsert: true,
          });

      if (uploadError) {
        console.error(
          "Avatar upload error:",
          uploadError.message
        );

        setError(
          "Unable to upload profile photo."
        );

        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleNextFromProfile() {
    setError(null);

    const trimmedDisplayName =
      displayName.trim();

    if (!trimmedDisplayName) {
      setError(
        "Please enter your display name."
      );
      return;
    }

    setLoading(true);

    const result =
      await saveOnboardingProfile({
        display_name: trimmedDisplayName,
        bio: bio.trim(),
        country: country.trim(),
        date_of_birth:
          dateOfBirth || null,
        gender: gender || null,
        avatar_url:
          avatarUrl || null,
      });

    setLoading(false);

    if (!result.success) {
      setError(
        result.error ||
          "Unable to save your profile."
      );
      return;
    }

    setStep(2);
  }

  async function handleNextFromLanguages() {
    setError(null);
    setLoading(true);

    const result =
      await saveOnboardingLanguages(
        languages.map((language) => ({
          language_code:
            language.language_code,
          proficiency:
            language.proficiency,
          is_native:
            language.is_native,
        }))
      );

    setLoading(false);

    if (!result.success) {
      setError(
        result.error ||
          "Unable to save your languages."
      );
      return;
    }

    setStep(3);
  }

  async function handleFinish() {
    setError(null);
    setLoading(true);

    const cleanedLinks = socialLinks
      .map((item) => {
        const platform =
          availablePlatforms.find(
            (available) =>
              available.slug ===
              item.platform
          );

        if (!platform) return null;

        const value = item.url.trim();

        if (!value) return null;

        return {
          platform: platform.slug,
          url: value.startsWith(
            platform.url_prefix
          )
            ? value
            : `${platform.url_prefix}${value}`,
        };
      })
      .filter(
        (
          item
        ): item is {
          platform: string;
          url: string;
        } => item !== null
      );

    const socialResult =
      await saveOnboardingSocialLinks(
        cleanedLinks
      );

    if (!socialResult.success) {
      setLoading(false);

      setError(
        socialResult.error ||
          "Unable to save your social links."
      );

      return;
    }

    const result =
      await completeProfileOnboarding();

    setLoading(false);

    if (!result.success) {
      setError(
        result.error ||
          "Unable to complete profile setup."
      );
      return;
    }

    onOpenChange(false);
    router.refresh();
  }

  async function handleSkip() {
    setError(null);
    setLoading(true);

    const result =
      await dismissProfileOnboarding();

    setLoading(false);

    if (!result.success) {
      setError(
        result.error ||
          "Unable to dismiss onboarding."
      );
      return;
    }

    onOpenChange(false);
    router.refresh();
  }

  function addLanguage() {
    setError(null);

    const unused =
      availableLanguages.find(
        (language) =>
          !languages.some(
            (item) =>
              item.language_code ===
              language.code
          )
      );

    if (!unused) return;

    setLanguages((current) => [
      ...current,
      {
        id: Date.now(),
        language_code: unused.code,
        proficiency: "intermediate",
        is_native: false,
        locales: {
            code: unused.code,
            name: unused.name,
          },
      },
    ]);
  }

  function updateLanguage(
    id: number,
    field:
      | "language_code"
      | "proficiency",
    value: string
  ) {
    setLanguages((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (field === "language_code") {
          const selected =
            availableLanguages.find(
              (language) =>
                language.code === value
            );

          return {
            ...item,
            language_code: value,
            locales: selected
              ? {
                    code: selected.code,
                    name: selected.name,
                  }
              : item.locales,
          };
        }

        return {
          ...item,
          proficiency:
            value as Proficiency,
        };
      })
    );
  }

  function setNativeLanguage(
    id: number,
    checked: boolean
  ) {
    setLanguages((current) =>
      current.map((item) => ({
        ...item,
        is_native:
          checked && item.id === id,
      }))
    );
  }

  function removeLanguage(id: number) {
    setLanguages((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  }

  function addSocialLink() {
    setError(null);

    const unusedPlatform =
      availablePlatforms.find(
        (platform) =>
          !socialLinks.some(
            (item) =>
              item.platform ===
              platform.slug
          )
      );

    if (!unusedPlatform) return;

    setSocialLinks((current) => [
      ...current,
      {
        id: Date.now(),
        platform: unusedPlatform.slug,
        url: "",
      },
    ]);
  }

  function updateSocialPlatform(
    id: number,
    platform: string
  ) {
    setSocialLinks((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              platform,
              url: "",
            }
          : item
      )
    );
  }

  function updateSocialUrl(
    id: number,
    value: string
  ) {
    setSocialLinks((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              url: value,
            }
          : item
      )
    );
  }

  function removeSocialLink(id: number) {
    setSocialLinks((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  }

  function handleDialogChange(
    value: boolean
  ) {
    if (!value && !loading) {
      setStep(1);
      setError(null);
    }

    onOpenChange(value);
  }

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((name) =>
        name.charAt(0)
      )
      .join("")
      .toUpperCase() || "U";

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
            Complete Your Profile
          </DialogTitle>

          <DialogDescription>
            Set up the information other
            NiceConvo users will see when
            they visit your profile.
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}

        <div className="mt-4 flex items-center">
          {[
            {
              number: 1,
              label: "Basic Details",
            },
            {
              number: 2,
              label: "Languages",
            },
            {
              number: 3,
              label: "Social Links",
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

              {index < 2 && (
                <div className="mx-3 h-px flex-1 bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* Error */}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* =====================================================
            STEP 1 — BASIC DETAILS
        ====================================================== */}

        {step === 1 && (
          <div className="space-y-6">
            <div className="pt-4">
              <h3 className="text-lg font-semibold">
                Basic Details
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Add a few details so other NiceConvo users can
                learn more about you.
              </p>
            </div>

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
                      {initials}
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
                    Change Photo
                  </Button>

                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    JPG, PNG or WebP
                    <br />
                    Maximum 5 MB
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-5">
                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="onboarding-display-name">
                      Display Name
                    </Label>

                    <Input
                      id="onboarding-display-name"
                      value={displayName}
                      onChange={(event) =>
                        setDisplayName(event.target.value)
                      }
                      disabled={loading}
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="onboarding-username">
                      Username
                    </Label>

                    <Input
                      id="onboarding-username"
                      value={`@${profile.username}`}
                      disabled
                    />

                    <p className="text-xs text-muted-foreground">
                      This appears in your public profile URL.
                    </p>
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <Label htmlFor="onboarding-country">
                      Country
                    </Label>

                    <Input
                      id="onboarding-country"
                      value={country}
                      onChange={(event) =>
                        setCountry(event.target.value)
                      }
                      disabled={loading}
                      placeholder="e.g. India"
                    />
                  </div>

                  {/* Date of Birth + Gender */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <Label htmlFor="onboarding-dob">
                        Date of Birth
                      </Label>

                      <Input
                        id="onboarding-dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(event) =>
                          setDateOfBirth(event.target.value)
                        }
                        disabled={loading}
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <Label htmlFor="onboarding-gender">
                        Gender
                      </Label>

                      <select
                        id="onboarding-gender"
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
                          Select gender
                        </option>

                        {GENDER_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="onboarding-bio">
                      Bio
                    </Label>

                    <Textarea
                      id="onboarding-bio"
                      value={bio}
                      onChange={(event) =>
                        setBio(event.target.value)
                      }
                      disabled={loading}
                      placeholder="Tell people a little about yourself..."
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
                onClick={handleSkip}
              >
                Skip for now
              </Button>

              <Button
                type="button"
                disabled={loading}
                onClick={handleNextFromProfile}
              >
                {loading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </div>
        )}

        {/* =====================================================
            STEP 2 — LANGUAGES
        ====================================================== */}

        {step === 2 && (
          <div className="space-y-6">
            <div className="pt-2">
              <h3 className="text-lg font-semibold">
                Languages
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Add the languages you speak and
                set your proficiency level.
              </p>
            </div>

            {languages.length > 0 ? (
              <div className="overflow-hidden rounded-xl border">
                {/* Header */}

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
                  <span>Language</span>
                  <span>Proficiency</span>
                  <span className="text-center">
                    Native
                  </span>
                  <span />
                </div>

                {/* Rows */}

                <div>
                  {languages.map(
                    (language, index) => (
                      <div
                        key={language.id}
                        className={`
                          px-4
                          py-4
                          ${
                            index !==
                            languages.length - 1
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
                              Language
                            </label>

                            <select
                              value={
                                language.language_code
                              }
                              onChange={(event) =>
                                updateLanguage(
                                  language.id,
                                  "language_code",
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
                                    key={
                                      available.code
                                    }
                                    value={
                                      available.code
                                    }
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
                              Proficiency
                            </label>

                            <select
                              value={
                                language.proficiency
                              }
                              onChange={(event) =>
                                updateLanguage(
                                  language.id,
                                  "proficiency",
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
                              {PROFICIENCIES.map(
                                (option) => (
                                  <option
                                    key={
                                      option.value
                                    }
                                    value={
                                      option.value
                                    }
                                  >
                                    {option.label}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {/* Native */}

                          <div className="flex items-center justify-between sm:justify-center">
                            <label className="text-sm font-medium sm:hidden">
                              Native language
                            </label>

                            <input
                              type="checkbox"
                              checked={
                                language.is_native
                              }
                              onChange={(event) =>
                                setNativeLanguage(
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
                                removeLanguage(
                                  language.id
                                )
                              }
                              disabled={loading}
                              aria-label="Remove language"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No languages added yet.
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={addLanguage}
              disabled={
                loading ||
                languages.length >=
                  availableLanguages.length
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Language
            </Button>

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
                disabled={loading}
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={
                  handleNextFromLanguages
                }
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Continue"}
              </Button>
            </div>
          </div>
        )}

        {/* =====================================================
            STEP 3 — SOCIAL LINKS
        ====================================================== */}

        {step === 3 && (
          <div className="space-y-6">
            <div className="pt-2">
              <h3 className="text-lg font-semibold">
                Social Links
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Add links to your social profiles
                or other websites.
              </p>
            </div>

            {socialLinks.length > 0 ? (
              <div className="overflow-hidden rounded-xl border">
                {/* Header */}

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
                  <span>Platform</span>
                  <span>Profile</span>
                  <span />
                </div>

                {/* Rows */}

                <div>
                  {socialLinks.map(
                    (link, index) => {
                      const platform =
                        availablePlatforms.find(
                          (item) =>
                            item.slug ===
                            link.platform
                        );

                      let value =
                        link.url;

                      if (
                        platform &&
                        value.startsWith(
                          platform.url_prefix
                        )
                      ) {
                        value = value.slice(
                          platform
                            .url_prefix
                            .length
                        );
                      }

                      return (
                        <div
                          key={link.id}
                          className={`
                            px-4
                            py-4
                            ${
                              index !==
                              socialLinks.length - 1
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
                                Platform
                              </label>

                              <select
                                value={
                                  link.platform
                                }
                                onChange={(event) =>
                                  updateSocialPlatform(
                                    link.id,
                                    event.target
                                      .value
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
                                {availablePlatforms.map(
                                  (available) => (
                                    <option
                                      key={
                                        available.id
                                      }
                                      value={
                                        available.slug
                                      }
                                      disabled={socialLinks.some(
                                        (existing) =>
                                          existing.id !==
                                            link.id &&
                                          existing.platform ===
                                            available.slug
                                      )}
                                    >
                                      {
                                        available.name
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            </div>

                            {/* Profile */}

                            <div className="min-w-0">
                              <label className="mb-2 block text-sm font-medium sm:hidden">
                                Profile
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
                                    platform?.url_prefix
                                  }
                                >
                                  {
                                    platform?.url_prefix
                                  }
                                </span>

                                <Input
                                  value={value}
                                  onChange={(event) =>
                                    updateSocialUrl(
                                      link.id,
                                      event.target
                                        .value
                                    )
                                  }
                                  placeholder={
                                    platform?.placeholder ??
                                    "your username"
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
                                  removeSocialLink(
                                    link.id
                                  )
                                }
                                disabled={loading}
                                aria-label="Remove social link"
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No social links added yet.
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={addSocialLink}
              disabled={
                loading ||
                socialLinks.length >=
                  availablePlatforms.length
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Link
            </Button>

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError(null);
                  setStep(2);
                }}
                disabled={loading}
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={handleFinish}
                disabled={loading}
              >
                {loading
                  ? "Finishing..."
                  : "Finish"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}