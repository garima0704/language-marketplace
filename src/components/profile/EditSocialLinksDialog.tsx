"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { saveOnboardingSocialLinks } from "@/app/actions/profile-onboarding";

interface SocialLink {
  id: number;
  platform: string;
  url: string;
}

interface EditableSocialLink {
  id: string;
  platform: string;
  url: string;
}

interface EditSocialLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  socialLinks: SocialLink[];
}

export default function EditSocialLinksDialog({
  open,
  onOpenChange,
  profileId,
  socialLinks,
}: EditSocialLinksDialogProps) {
  const [items, setItems] = useState<EditableSocialLink[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setItems(
      socialLinks.map((link) => ({
        id: String(link.id),
        platform: link.platform,
        url: link.url,
      }))
    );

    setError("");
  }, [open, socialLinks]);

  function addLink() {
    setItems((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        platform: "",
        url: "",
      },
    ]);
  }

  function updateLink(
    id: string,
    field: "platform" | "url",
    value: string
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
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
      .map((item) => ({
        platform: item.platform.trim(),
        url: item.url.trim(),
      }))
      .filter(
        (item) => item.platform && item.url
      );

    const result = await saveOnboardingSocialLinks(
      cleanedLinks
    );

    if (!result.success) {
      setError(result.error ?? "Failed to save social links.");
      setSaving(false);
      return;
    }

    setSaving(false);
    onOpenChange(false);

    window.location.reload();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Social Links</DialogTitle>
          <DialogDescription>
            Add links to your social profiles or other websites.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[160px_1fr_40px] items-center gap-3"
                >
                  <Input
                    value={item.platform}
                    onChange={(e) =>
                      updateLink(
                        item.id,
                        "platform",
                        e.target.value
                      )
                    }
                    placeholder="Platform"
                  />

                  <Input
                    value={item.url}
                    onChange={(e) =>
                      updateLink(
                        item.id,
                        "url",
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                    type="url"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(item.id)}
                    aria-label="Remove social link"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No social links added yet.
              </p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addLink}
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

        <DialogFooter>
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
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}