"use client";

import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import EditProfileDialog from "./EditProfileDialog";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  country: string | null;
  is_creator: boolean;
  created_at: string;
}

interface ProfileHeaderProps {
  profile: Profile;
}

export default function ProfileHeader({
  profile,
}: ProfileHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url ?? ""} />

              <AvatarFallback className="bg-primary text-white text-3xl">
                {profile.display_name
                  ?.split(" ")
                  .map((name: string) => name.charAt(0))
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold">
                {profile.display_name}
              </h1>

              <p className="text-muted-foreground">
                @{profile.username}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {profile.is_creator && (
                  <span className="whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium bg-secondary text-white">
                    Creator
                  </span>
                )}

                <span className="text-sm text-muted-foreground">
                  {profile.country ?? "No country"}
                </span>

                <span className="text-sm text-muted-foreground">
                  • Joined{" "}
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setOpen(true)}
          >
            Edit Profile
          </Button>
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