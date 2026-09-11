"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import EditSocialLinksDialog from "./EditSocialLinksDialog";

interface SocialLink {
  id: number;
  platform: string;
  url: string;
}

interface SocialLinksSectionProps {
  profileId: string;
  socialLinks: SocialLink[];
}

export default function SocialLinksSection({
  profileId,
  socialLinks,
}: SocialLinksSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Social Links
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Your social profiles and other online links.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
          >
            Edit
          </Button>
        </div>

        {socialLinks.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-xl border">
            {socialLinks.map((link, index) => (
              <div
                key={link.id}
                className={`grid grid-cols-[160px_1fr] items-center gap-4 px-4 py-3 text-sm ${
                  index !== socialLinks.length - 1
                    ? "border-b"
                    : ""
                }`}
              >
                <span className="font-medium">
                  {link.platform}
                </span>

                <span className="truncate text-muted-foreground">
                  {link.url}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed p-5 text-center">
            <p className="text-sm text-muted-foreground">
              You haven't added any social links yet.
            </p>
          </div>
        )}
      </Card>

      <EditSocialLinksDialog
        open={open}
        onOpenChange={setOpen}
        profileId={profileId}
        socialLinks={socialLinks}
      />
    </>
  );
}