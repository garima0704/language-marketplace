"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import EditAboutDialog from "./EditAboutDialog";

interface AboutSectionProps {
  profile: {
    id: string;
    bio: string | null;
  };
}

export default function AboutSection({
  profile,
}: AboutSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            About
          </h2>

          <Button onClick={() => setOpen(true)}>
            Edit About
          </Button>
        </div>

        <div className="mt-5">
          {profile.bio ? (
            <p className="leading-7 text-muted">
              {profile.bio}
            </p>
          ) : (
            <p className="italic text-muted">
              No bio added yet.
            </p>
          )}
        </div>
      </Card>

      <EditAboutDialog
        open={open}
        onOpenChange={setOpen}
        profile={profile}
      />
    </>
  );
}