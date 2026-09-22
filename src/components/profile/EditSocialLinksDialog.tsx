"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { saveOnboardingSocialLinks } from "@/app/actions/profile-onboarding";

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

interface EditableSocialLink {
  id: string;
  platform: string;
  value: string;
}

interface EditSocialLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  socialLinks: SocialLink[];
  availablePlatforms: SocialPlatform[];
}

export default function EditSocialLinksDialog({
  open,
  onOpenChange,
  socialLinks,
  availablePlatforms,
}: EditSocialLinksDialogProps) {
  const [items, setItems] = useState<EditableSocialLink[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setItems(
      socialLinks.map((link) => {
        const platform = availablePlatforms.find(
          (item) => item.slug === link.platform
        );

        let value = link.url;

        if (
          platform &&
          value.startsWith(platform.url_prefix)
        ) {
          value = value.slice(
            platform.url_prefix.length
          );
        }

        return {
          id: String(link.id),
          platform: link.platform,
          value,
        };
      })
    );

    setError("");
  }, [open, socialLinks, availablePlatforms]);

  function addLink() {
    const unusedPlatform = availablePlatforms.find(
      (platform) =>
        !items.some(
          (item) =>
            item.platform === platform.slug
        )
    );

    if (!unusedPlatform) return;

    setItems((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        platform: unusedPlatform.slug,
        value: "",
      },
    ]);
  }

  function updatePlatform(
    id: string,
    platform: string
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              platform,
              value: "",
            }
          : item
      )
    );
  }

  function updateValue(
    id: string,
    value: string
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              value,
            }
          : item
      )
    );
  }

  function removeLink(id: string) {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const cleanedLinks = items
      .map((item) => {
        const platform = availablePlatforms.find(
          (available) =>
            available.slug === item.platform
        );

        if (!platform) return null;

        const value = item.value.trim();

        if (!value) return null;

        return {
          platform: platform.slug,
          url: `${platform.url_prefix}${value}`,
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

    const result =
      await saveOnboardingSocialLinks(
        cleanedLinks
      );

    if (!result.success) {
      setError(
        result.error ??
          "Failed to save social links."
      );
      setSaving(false);
      return;
    }

    setSaving(false);
    onOpenChange(false);

    window.location.reload();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
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
            Edit Social Links
          </DialogTitle>

          <DialogDescription>
            Add links to your social profiles or other
            websites.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {items.length > 0 ? (
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
                {items.map((item, index) => {
                  const selectedPlatform =
                    availablePlatforms.find(
                      (platform) =>
                        platform.slug ===
                        item.platform
                    );

                  return (
                    <div
                      key={item.id}
                      className={`
                        px-4
                        py-4
                        ${
                          index !==
                          items.length - 1
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
                          <label className="mb-2 block text-sm font-medium text-foreground sm:hidden">
                            Platform
                          </label>

                          <select
                            value={item.platform}
                            onChange={(e) =>
                              updatePlatform(
                                item.id,
                                e.target.value
                              )
                            }
                            disabled={saving}
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
                              focus:border-foreground/30
                              focus:ring-0
                            "
                          >
                            {availablePlatforms.map(
                              (platform) => (
                                <option
                                  key={platform.id}
                                  value={platform.slug}
                                  disabled={items.some(
                                    (existing) =>
                                      existing.id !==
                                        item.id &&
                                      existing.platform ===
                                        platform.slug
                                  )}
                                >
                                  {platform.name}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* URL */}
                        <div className="min-w-0">
                          <label className="mb-2 block text-sm font-medium text-foreground sm:hidden">
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
                                rounded-l-md
                                border
                                border-r-0
                                border-input
                                bg-light-bg
                                px-3
                                text-sm
                                text-muted-foreground
                                whitespace-nowrap
                              "
                              title={
                                selectedPlatform?.url_prefix
                              }
                            >
                              {selectedPlatform?.url_prefix}
                            </span>

                            <Input
                              value={item.value}
                              onChange={(e) =>
                                updateValue(
                                  item.id,
                                  e.target.value
                                )
                              }
                              placeholder={
                                selectedPlatform?.placeholder ??
                                "your username"
                              }
                              disabled={saving}
                              className="
                                h-10
                                min-w-0
                                rounded-l-none
                              "
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
                              removeLink(item.id)
                            }
                            disabled={saving}
                            aria-label="Remove social link"
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
                No social links added yet.
              </p>
            </div>
          )}

          {/* Add Link */}
          <Button
            type="button"
            variant="outline"
            onClick={addLink}
            disabled={
              saving ||
              items.length >=
                availablePlatforms.length
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Link
          </Button>

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="transition-opacity hover:opacity-90"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}