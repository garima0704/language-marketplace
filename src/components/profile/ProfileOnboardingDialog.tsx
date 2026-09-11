"use client";

import { useRef, useState } from "react";
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

import {
  completeProfileOnboarding,
  dismissProfileOnboarding,
  saveOnboardingLanguages,
  saveOnboardingProfile,
  saveOnboardingSocialLinks,
} from "@/app/actions/profile-onboarding";

import { createClient } from "@/lib/supabase/client";

type Language = {
  code: string;
  name: string;
};

type ProfileLanguage = {
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
};

type SocialLink = {
  id?: number;
  platform: string;
  url: string;
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
}

const SOCIAL_PLATFORMS = [
  "Instagram",
  "YouTube",
  "LinkedIn",
  "Facebook",
  "X",
  "Website",
];

const PROFICIENCIES = [
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
] as const;

export default function ProfileOnboardingDialog({
  open,
  onOpenChange,
  profile,
  languages: initialLanguages,
  availableLanguages,
  socialLinks: initialSocialLinks,
}: ProfileOnboardingDialogProps) {
  const router = useRouter();
  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(
    profile.avatar_url ?? ""
  );

  const [displayName, setDisplayName] = useState(
    profile.display_name ?? ""
  );

  const [bio, setBio] = useState(profile.bio ?? "");

  const [country, setCountry] = useState(
    profile.country ?? ""
  );

  const [dateOfBirth, setDateOfBirth] = useState(
    profile.date_of_birth ?? ""
  );

  const [gender, setGender] = useState(
    profile.gender ?? ""
  );

  const [languages, setLanguages] = useState<
    ProfileLanguage[]
  >(initialLanguages);

  const [socialLinks, setSocialLinks] = useState<
    SocialLink[]
  >(initialSocialLinks);

  async function handleAvatarUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Maximum file size is 5MB");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG and WebP files are allowed");
      return;
    }

    const fileExt = file.name.split(".").pop();

    const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        upsert: true,
      });

    if (error) {
      console.error("Avatar upload error:", error.message);
      alert("Unable to upload profile photo.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    setAvatarUrl(publicUrl);
  }

  async function handleNextFromProfile() {
    if (!displayName.trim()) {
      alert("Please enter your display name.");
      return;
    }

    setLoading(true);

    const result = await saveOnboardingProfile({
      display_name: displayName,
      bio,
      country,
      date_of_birth: dateOfBirth,
      gender,
      avatar_url: avatarUrl,
    });

    setLoading(false);

    if (!result.success) {
      alert(result.error || "Unable to save your profile.");
      return;
    }

    setStep(2);
  }

  async function handleNextFromLanguages() {
    setLoading(true);

    const result = await saveOnboardingLanguages(
      languages.map((language) => ({
        language_code: language.language_code,
        proficiency: language.proficiency,
        is_native: language.is_native,
      }))
    );

    setLoading(false);

    if (!result.success) {
      alert(
        result.error || "Unable to save your languages."
      );
      return;
    }

    setStep(3);
  }

  async function handleFinish() {
    setLoading(true);

    const links = socialLinks.filter(
      (link) =>
        link.platform.trim() && link.url.trim()
    );

    const socialResult =
      await saveOnboardingSocialLinks(links);

    if (!socialResult.success) {
      setLoading(false);

      alert(
        socialResult.error ||
          "Unable to save your social links."
      );

      return;
    }

    const result =
      await completeProfileOnboarding();

    setLoading(false);

    if (!result.success) {
      alert(
        result.error ||
          "Unable to complete profile setup."
      );

      return;
    }

    onOpenChange(false);
    router.refresh();
  }

  async function handleSkip() {
    setLoading(true);

    const result =
      await dismissProfileOnboarding();

    setLoading(false);

    if (!result.success) {
      alert(
        result.error ||
          "Unable to dismiss onboarding."
      );

      return;
    }

    onOpenChange(false);
    router.refresh();
  }

  function addLanguage() {
    if (!availableLanguages.length) return;

    const existingCodes = new Set(
      languages.map(
        (language) => language.language_code
      )
    );

    const language = availableLanguages.find(
      (item) => !existingCodes.has(item.code)
    );

    if (!language) return;

    setLanguages((current) => [
      ...current,
      {
        id: Date.now(),
        language_code: language.code,
        proficiency: "beginner",
        is_native: false,
        locales: [
        {
          code: language.code,
          name: language.name,
        },
      ],
      },
    ]);
  }

  function updateLanguage(
    id: number,
    field: "language_code" | "proficiency" | "is_native",
    value: string | boolean
  ) {
    setLanguages((current) =>
      current.map((language) => {
        if (field === "language_code" && language.id === id) {
          const selected = availableLanguages.find(
            (item) => item.code === value
          );

          return {
            ...language,
            language_code: String(value),
            locales: selected
              ? [
                  {
                    code: selected.code,
                    name: selected.name,
                  },
                ]
              : language.locales,
          };
        }

        if (field === "proficiency") {
          return {
            ...language,
            proficiency: value as ProfileLanguage["proficiency"],
          };
        }

        return {
          ...language,
          is_native: Boolean(value),
        };
      })
    );
  }

  function removeLanguage(id: number) {
    setLanguages((current) =>
      current.filter((language) => language.id !== id)
    );
  }

  function addSocialLink() {
    const usedPlatforms = new Set(
      socialLinks.map((link) => link.platform)
    );

    const platform = SOCIAL_PLATFORMS.find(
      (item) => !usedPlatforms.has(item)
    );

    if (!platform) return;

    setSocialLinks((current) => [
      ...current,
      {
        platform,
        url: "",
      },
    ]);
  }

  function updateSocialLink(
    index: number,
    field: "platform" | "url",
    value: string
  ) {
    setSocialLinks((current) =>
      current.map((link, currentIndex) =>
        currentIndex === index
          ? {
              ...link,
              [field]: value,
            }
          : link
      )
    );
  }

  function removeSocialLink(index: number) {
    setSocialLinks((current) =>
      current.filter(
        (_, currentIndex) => currentIndex !== index
      )
    );
  }

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!loading}
        className="
          w-[95vw]
          max-w-2xl
          max-h-[90vh]
          overflow-y-auto
          overflow-x-hidden
          rounded-2xl
          bg-background
          p-8
        "
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Complete your profile
          </DialogTitle>

          <DialogDescription>
            A few details will help other NiceConvo users
            learn more about you.
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`h-1.5 flex-1 rounded-full ${
                  item <= step
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>Basic Details</span>
            <span>Languages</span>
            <span>Social Links</span>
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-28 w-28">
                <AvatarImage src={avatarUrl} />

                <AvatarFallback className="bg-primary text-3xl text-white">
                  {initials || "U"}
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
                className="mt-4"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                Change Photo
              </Button>

              <p className="mt-2 text-xs text-muted">
                JPG, PNG or WebP · Maximum 5 MB
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Username</Label>

                <Input
                  value={`@${profile.username}`}
                  disabled
                />

                <p className="text-xs text-muted">
                  Your username was created during signup.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="onboarding-display-name">
                  Display Name
                </Label>

                <Input
                  id="onboarding-display-name"
                  value={displayName}
                  onChange={(e) =>
                    setDisplayName(e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="onboarding-bio">
                  Bio
                </Label>

                <textarea
                  id="onboarding-bio"
                  value={bio}
                  onChange={(e) =>
                    setBio(e.target.value)
                  }
                  placeholder="Tell people a little about yourself..."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="onboarding-country">
                  Country
                </Label>

                <Input
                  id="onboarding-country"
                  value={country}
                  onChange={(e) =>
                    setCountry(e.target.value)
                  }
                  placeholder="India"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="onboarding-dob">
                  Date of Birth
                </Label>

                <Input
                  id="onboarding-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) =>
                    setDateOfBirth(e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="onboarding-gender">
                  Gender
                </Label>

                <select
                  id="onboarding-gender"
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">
                    Prefer not to select
                  </option>
                  <option value="female">
                    Female
                  </option>
                  <option value="male">
                    Male
                  </option>
                  <option value="non_binary">
                    Non-binary
                  </option>
                  <option value="prefer_not_to_say">
                    Prefer not to say
                  </option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                disabled={loading}
              >
                Skip for now
              </Button>

              <Button
                type="button"
                onClick={handleNextFromProfile}
                disabled={loading}
              >
                {loading ? "Saving..." : "Next"}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="mt-8 space-y-5">
            <div>
              <h3 className="font-semibold">
                Languages
              </h3>

              <p className="mt-1 text-sm text-muted">
                Tell people which languages you speak.
              </p>
            </div>

            {languages.length === 0 && (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <p className="text-sm text-muted">
                  No languages added yet.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {languages.map((language) => (
                <div
                  key={language.id}
                  className="rounded-xl border p-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Language</Label>

                      <select
                        value={language.language_code}
                        onChange={(e) =>
                          updateLanguage(
                            language.id,
                            "language_code",
                            e.target.value
                          )
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                      >
                        {availableLanguages.map(
                          (item) => (
                            <option
                              key={item.code}
                              value={item.code}
                            >
                              {item.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Proficiency</Label>

                      <select
                        value={language.proficiency}
                        onChange={(e) =>
                          updateLanguage(
                            language.id,
                            "proficiency",
                            e.target.value
                          )
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                      >
                        {PROFICIENCIES.map(
                          (item) => (
                            <option
                              key={item.value}
                              value={item.value}
                            >
                              {item.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={language.is_native}
                        onChange={(e) => {
                          const checked = e.target.checked;

                          setLanguages((current) =>
                            current.map((item) => ({
                              ...item,
                              is_native:
                                checked && item.id === language.id,
                            }))
                          );
                        }}
                      />

                      Native language
                    </label>                   
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeLanguage(language.id)
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addLanguage}
              disabled={
                languages.length >=
                availableLanguages.length
              }
            >
              + Add Language
            </Button>

            <div className="flex items-center justify-between border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={handleNextFromLanguages}
                disabled={loading}
              >
                {loading ? "Saving..." : "Next"}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="mt-8 space-y-5">
            <div>
              <h3 className="font-semibold">
                Social Links
              </h3>

              <p className="mt-1 text-sm text-muted">
                Add your social profiles if you want.
                This step is optional.
              </p>
            </div>

            {socialLinks.length === 0 && (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <p className="text-sm text-muted">
                  No social links added.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <div
                  key={`${link.platform}-${index}`}
                  className="grid gap-4 rounded-xl border p-4 md:grid-cols-[180px_1fr_auto]"
                >
                  <div className="space-y-2">
                    <Label>Platform</Label>

                    <select
                      value={link.platform}
                      onChange={(e) =>
                        updateSocialLink(
                          index,
                          "platform",
                          e.target.value
                        )
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                    >
                      {SOCIAL_PLATFORMS.map(
                        (platform) => (
                          <option
                            key={platform}
                            value={platform}
                          >
                            {platform}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>URL</Label>

                    <Input
                      value={link.url}
                      onChange={(e) =>
                        updateSocialLink(
                          index,
                          "url",
                          e.target.value
                        )
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        removeSocialLink(index)
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addSocialLink}
              disabled={
                socialLinks.length >=
                SOCIAL_PLATFORMS.length
              }
            >
              + Add Social Link
            </Button>

            <div className="flex items-center justify-between border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={handleFinish}
                disabled={loading}
              >
                {loading ? "Finishing..." : "Finish"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}