"use client";

import { useState } from "react";
import {
  calculateAge,
  formatGender,
} from "@/lib/utils";

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

interface BasicDetailsSectionProps {
  profile: Profile;
}

export default function BasicDetailsSection({
  profile,
}: BasicDetailsSectionProps) {
  const [open, setOpen] = useState(false);

  const initials =
    profile.display_name
      ?.split(" ")
      .filter(Boolean)
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase() || "U";

  const gender = formatGender(profile.gender);
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
                    {gender && <span>{gender}</span>}

                    {age !== null && (
                      <>
                        {gender && <span>·</span>}
                        <span>{age} years old</span>
                      </>
                    )}

                    {profile.country && (
                      <>
                        {(gender || age !== null) && (
                          <span>·</span>
                        )}
                        <span>{profile.country}</span>
                      </>
                    )}
                  </div>
                )}
              
            

                {/* Creator */}
                {profile.is_creator && (
                  <span className="inline-flex whitespace-nowrap rounded-full bg-secondary px-3 py-1 text-sm font-medium text-white">
                    Creator
                  </span>
                )}
            </div>
            </div>
            <Button onClick={() => setOpen(true)}>
              Edit Profile
            </Button>
          </div>

          {/* Bio */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold">
              Bio
            </h2>

            <div className="mt-3">
              {profile.bio ? (
                <p className="leading-7 text-muted-foreground">
                  {profile.bio}
                </p>
              ) : (
                <p className="italic text-muted-foreground">
                  No bio added yet.
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
      />
    </>
  );
}