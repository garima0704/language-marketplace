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

interface SocialLinksSectionTranslations {
  title: string;
  description: string;
  edit_social_links: string;
  platform: string;
  profile: string;
  no_social_links: string;
}

interface SocialLinksSectionProps {
  profileId: string;
  socialLinks: SocialLink[];
  availablePlatforms: SocialPlatform[];
  translations: SocialLinksSectionTranslations;
}

export default function SocialLinksSection({
  profileId,
  socialLinks,
  availablePlatforms,
  translations,
}: SocialLinksSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {translations.title}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {translations.description}
            </p>
          </div>

          <Button onClick={() => setOpen(true)}>
            {translations.edit_social_links}
          </Button>
        </div>

        {socialLinks.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-xl border">
            {/* Header */}
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-b px-4 py-3 text-sm font-medium text-muted-foreground">
              <span>{translations.platform}</span>
              <span>{translations.profile}</span>
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
              {translations.no_social_links}
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