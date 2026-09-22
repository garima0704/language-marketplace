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

interface SocialPlatform {
  id: number;
  name: string;
  slug: string;
  url_prefix: string;
  placeholder: string | null;
}

interface SocialLinksSectionProps {
  profileId: string;
  socialLinks: SocialLink[];
  availablePlatforms: SocialPlatform[];
}

export default function SocialLinksSection({
  profileId,
  socialLinks,
  availablePlatforms,
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

          <Button onClick={() => setOpen(true)}>
            Edit Social Links
          </Button>
        </div>

        {socialLinks.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-xl border">
            {/* Header */}
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-b px-4 py-3 text-sm font-medium text-muted-foreground">
              <span>Platform</span>
              <span>Profile</span>
            </div>

            {/* Social Links */}
            {socialLinks.map((link) => {
              const platform = availablePlatforms.find(
                (item) => item.slug === link.platform
              );

              return (
                <div
                  key={link.id}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center px-4 py-3 text-sm"
                >
                  <span className="min-w-0 font-medium">
                    {platform?.name ?? link.platform}
                  </span>

                  <span className="min-w-0 truncate text-muted-foreground">
                    {link.url}
                  </span>
                </div>
              );
            })}
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
        availablePlatforms={availablePlatforms}
      />
    </>
  );
}
