"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
  Dialog,
  DialogContent,
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

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  date_of_birth: string | null;
  gender: string | null;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

const genderOptions = [
  {
    value: "female",
    label: "Female",
  },
  {
    value: "male",
    label: "Male",
  },
];

export default function EditProfileDialog({
  open,
  onOpenChange,
  profile,
}: EditProfileDialogProps) {
  const router = useRouter();
  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setAvatarUrl(profile.avatar_url ?? "");
    setDisplayName(profile.display_name ?? "");
    setUsername(profile.username ?? "");
    setCountry(profile.country ?? "");
    setDateOfBirth(profile.date_of_birth ?? "");
    setGender(profile.gender ?? "");
    setBio(profile.bio ?? "");
    setError("");
  }, [open, profile]);

  const initials =
    displayName
      ?.split(" ")
      .filter(Boolean)
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase() || "U";

  async function handleSave() {
    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim();

    if (!trimmedDisplayName) {
      setError("Display name is required.");
      return;
    }

    if (!trimmedUsername) {
      setError("Username is required.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: trimmedDisplayName,
        username: trimmedUsername,
        country: country.trim() || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      console.error(
        "Profile update failed:",
        error.message
      );

      setError(
        error.code === "23505"
          ? "That username is already taken."
          : error.message
      );

      setLoading(false);
      return;
    }

    setLoading(false);
    onOpenChange(false);

    router.refresh();
  }

  async function handleAvatarUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Maximum file size is 5MB.");
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

    setUploading(true);
    setError("");

    const fileExt = file.name.split(".").pop();

    const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        upsert: true,
      });

    if (error) {
      console.error(
        "Avatar upload failed:",
        error.message
      );

      setError("Failed to upload profile photo.");
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    setAvatarUrl(publicUrl);
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[95vw]
          max-w-3xl
          max-h-[90vh]
          overflow-y-auto
          overflow-x-hidden
          rounded-2xl
          bg-background
          p-8
        "
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Edit Basic Details
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 grid gap-8 md:grid-cols-[180px_1fr]">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={avatarUrl} />

              <AvatarFallback className="bg-primary text-4xl text-primary-foreground">
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
              className="mt-5 rounded-full"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploading || loading}
            >
              {uploading
                ? "Uploading..."
                : "Change Photo"}
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              JPG, PNG or WebP
              <br />
              Maximum 5 MB
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name
              </Label>

              <Input
                id="displayName"
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
                disabled={loading}
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Username
              </Label>

              <Input
                id="username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                disabled={loading}
              />

              <p className="text-xs text-muted-foreground">
                This appears in your public profile URL.
              </p>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">
                Country
              </Label>

              <Input
                id="country"
                value={country}
                onChange={(e) =>
                  setCountry(e.target.value)
                }
                disabled={loading}
                placeholder="e.g. India"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Date of Birth
              </Label>

              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) =>
                  setDateOfBirth(e.target.value)
                }
                disabled={loading}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender
              </Label>

              <select
                id="gender"
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value)
                }
                disabled={loading}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  Select gender
                </option>

                {genderOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">
                Bio
              </Label>

              <Textarea
                id="bio"
                value={bio}
                onChange={(e) =>
                  setBio(e.target.value)
                }
                disabled={loading}
                placeholder="Tell people a little about yourself..."
                rows={5}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || uploading}
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={loading || uploading}
                onClick={handleSave}
                className="transition-opacity hover:opacity-90"
              >
                {loading
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}