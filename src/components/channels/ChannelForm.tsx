"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Channel {
  id: string;
  channel_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  subscription_price: number;
}

interface Props {
  mode: "create" | "edit";
  userId?: string;
  channel?: Channel;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function validateImage(file: File) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    return "Please upload a JPG, PNG, or WEBP image.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image size must be 5 MB or less.";
  }

  return null;
}

export default function ChannelForm({
  mode,
  userId,
  channel,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [channelName, setChannelName] = useState(
    channel?.channel_name ?? ""
  );

  const [slug, setSlug] = useState(channel?.slug ?? "");

  const [description, setDescription] = useState(
    channel?.description ?? ""
  );

  const [price, setPrice] = useState(
    channel?.subscription_price.toString() ?? "0"
  );

  const [slugEdited, setSlugEdited] = useState(mode === "edit");

  // --------------------------------------------------
  // Branding
  // --------------------------------------------------

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(
    channel?.logo_url ?? null
  );

  const [bannerPreview, setBannerPreview] = useState<string | null>(
    channel?.banner_url ?? null
  );

  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);

  // --------------------------------------------------
  // Generated slug
  // --------------------------------------------------

  const generatedSlug = useMemo(() => {
    return channelName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, [channelName]);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(generatedSlug);
    }
  }, [generatedSlug, slugEdited]);

  // --------------------------------------------------
  // Image preview cleanup
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  useEffect(() => {
    return () => {
      if (bannerPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerPreview]);

  // --------------------------------------------------
  // Logo selection
  // --------------------------------------------------

  function handleLogoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const validationError = validateImage(file);

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError("");

    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogo(false);
  }

  // --------------------------------------------------
  // Banner selection
  // --------------------------------------------------

  function handleBannerChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const validationError = validateImage(file);

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError("");

    if (bannerPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreview);
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setRemoveBanner(false);
  }

  // --------------------------------------------------
  // Remove logo
  // --------------------------------------------------

  function handleRemoveLogo() {
    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
  }

  // --------------------------------------------------
  // Remove banner
  // --------------------------------------------------

  function handleRemoveBanner() {
    if (bannerPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreview);
    }

    setBannerFile(null);
    setBannerPreview(null);
    setRemoveBanner(true);
  }

  // --------------------------------------------------
  // Upload asset
  // --------------------------------------------------

  async function uploadChannelAsset(
    channelId: string,
    type: "logo" | "banner",
    file: File
  ) {
    const path = `${channelId}/${type}`;

    const { error: uploadError } = await supabase.storage
      .from("channel-assets")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(
        `Failed to upload channel ${type}: ${uploadError.message}`
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("channel-assets")
      .getPublicUrl(path);

    return publicUrl;
  }

  // --------------------------------------------------
  // Delete asset
  // --------------------------------------------------

  async function deleteChannelAsset(
    channelId: string,
    type: "logo" | "banner"
  ) {
    const path = `${channelId}/${type}`;

    const { error: deleteError } = await supabase.storage
      .from("channel-assets")
      .remove([path]);

    if (deleteError) {
      throw new Error(
        `Failed to remove channel ${type}: ${deleteError.message}`
      );
    }
  }

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  async function handleSubmit() {
    if (loading) return;

    setError("");

    const trimmedName = channelName.trim();
    const trimmedSlug = slug.trim();
    const trimmedDescription = description.trim();
    const subscriptionPrice = Number(price);

    if (!trimmedName) {
      setError("Channel name is required.");
      return;
    }

    if (!trimmedSlug) {
      setError("Channel URL is required.");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      setError(
        "Channel URL can only contain lowercase letters, numbers and hyphens."
      );
      return;
    }

    if (isNaN(subscriptionPrice) || subscriptionPrice < 0) {
      setError("Subscription price must be $0 or greater.");
      return;
    }

    setLoading(true);

    try {
      // --------------------------------------------------
      // Check slug
      // --------------------------------------------------

      const { data: existing, error: slugError } = await supabase
        .from("channels")
        .select("id")
        .eq("slug", trimmedSlug)
        .neq("id", channel?.id ?? "")
        .maybeSingle();

      if (slugError) {
        setError(slugError.message);
        return;
      }

      if (existing) {
        setError("This channel URL is already taken.");
        return;
      }

      // --------------------------------------------------
      // CREATE
      // --------------------------------------------------

      if (mode === "create") {
        const { data, error: createError } = await supabase
          .from("channels")
          .insert({
            user_id: userId,
            channel_name: trimmedName,
            slug: trimmedSlug,
            description: trimmedDescription,
            subscription_price: subscriptionPrice,
          })
          .select("id")
          .single();

        if (createError) {
          setError(createError.message);
          return;
        }

        const channelId = data.id;

        let logoUrl: string | null = null;
        let bannerUrl: string | null = null;

        // Upload logo
        if (logoFile) {
          logoUrl = await uploadChannelAsset(
            channelId,
            "logo",
            logoFile
          );
        }

        // Upload banner
        if (bannerFile) {
          bannerUrl = await uploadChannelAsset(
            channelId,
            "banner",
            bannerFile
          );
        }

        // Save asset URLs
        if (logoUrl || bannerUrl) {
          const { error: assetUpdateError } = await supabase
            .from("channels")
            .update({
              ...(logoUrl ? { logo_url: logoUrl } : {}),
              ...(bannerUrl ? { banner_url: bannerUrl } : {}),
            })
            .eq("id", channelId);

          if (assetUpdateError) {
            setError(assetUpdateError.message);
            return;
          }
        }

        router.push(`/seller/channels/${channelId}`);
        return;
      }

      // --------------------------------------------------
      // EDIT
      // --------------------------------------------------

      const channelId = channel!.id;

      let logoUrl = channel?.logo_url ?? null;
      let bannerUrl = channel?.banner_url ?? null;

      // Replace logo
      if (logoFile) {
        logoUrl = await uploadChannelAsset(
          channelId,
          "logo",
          logoFile
        );
      }

      // Remove logo
      if (removeLogo && !logoFile) {
        await deleteChannelAsset(channelId, "logo");
        logoUrl = null;
      }

      // Replace banner
      if (bannerFile) {
        bannerUrl = await uploadChannelAsset(
          channelId,
          "banner",
          bannerFile
        );
      }

      // Remove banner
      if (removeBanner && !bannerFile) {
        await deleteChannelAsset(channelId, "banner");
        bannerUrl = null;
      }

      const { error: updateError } = await supabase
        .from("channels")
        .update({
          channel_name: trimmedName,
          slug: trimmedSlug,
          description: trimmedDescription,
          subscription_price: subscriptionPrice,
          logo_url: logoUrl,
          banner_url: bannerUrl,
        })
        .eq("id", channelId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-10">

      {/* ==================================================
          General Information
      ================================================== */}

      <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">
            General Information
          </h2>

          <p className="mt-1 text-sm text-muted">
            Update how your channel appears across NiceConvo.
          </p>
        </div>

        <div className="space-y-8">

          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="channelName">
              Channel Name <span className="text-red-600">*</span>
            </Label>

            <Input
              id="channelName"
              value={channelName}
              autoFocus
              onChange={(e) => setChannelName(e.target.value)}
            />

            <p className="text-xs text-muted">
              This is the name learners will see.
            </p>
          </div>

          {/* Channel URL */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Channel URL
            </Label>

            <div className="flex overflow-hidden rounded-lg border border-border">
              <div className="flex items-center bg-muted-bg px-4 text-sm text-muted">
                niceconvo.com/c/
              </div>

              <Input
                id="slug"
                className="rounded-none border-0"
                value={slug}
                onChange={(e) => {
                  setSlugEdited(true);

                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
                  );
                }}
              />
            </div>

            <p className="text-xs text-muted">
              Your public channel URL.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="description">
                Description
              </Label>

              <span className="text-xs text-muted">
                {description.length}/500
              </span>
            </div>

            <Textarea
              id="description"
              rows={6}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <p className="text-xs text-muted">
              Describe what learners can expect.
            </p>
          </div>

        </div>
      </div>

      {/* ==================================================
          Pricing
      ================================================== */}

      <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">
            Pricing
          </h2>

          <p className="mt-1 text-sm text-muted">
            Set your monthly subscription price.
          </p>
        </div>

        <div className="max-w-sm space-y-2">
          <Label htmlFor="price">
            Monthly Subscription
          </Label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              $
            </span>

            <Input
              id="price"
              className="pl-7"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <p className="text-xs text-muted">
            You can change this later.
          </p>
        </div>
      </div>

    {/* ==================================================
          Channel Branding
      ================================================== */}

    <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
      <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">
            Channel Branding
          </h2>

          <p className="mt-1 text-sm text-muted">
            Add a logo and banner to give your channel its own identity.
          </p>
        </div>

        <div className="space-y-10">

          {/* Logo */}
          <div className="space-y-4">
            <div>
              <Label>
                Channel Logo
              </Label>

              <p className="mt-1 text-xs text-muted">
                Recommended: 400 × 400 px. JPG, PNG or WEBP. Max 5 MB.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted-bg">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Channel logo preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-4 text-center text-xs text-muted">
                    No logo
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Input
                    id="channelLogo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoChange}
                    disabled={loading}
                    className="max-w-sm"
                  />
                </div>

                {logoPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={handleRemoveLogo}
                  >
                    Remove Logo
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="space-y-4">
            <div>
              <Label>
                Channel Banner
              </Label>

              <p className="mt-1 text-xs text-muted">
                Recommended: 1600 × 400 px. JPG, PNG or WEBP. Max 5 MB.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-muted-bg">
              <div className="aspect-[4/1] w-full">
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Channel banner preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-xs text-muted">
                      No banner
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Input
                id="channelBanner"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBannerChange}
                disabled={loading}
                className="max-w-sm"
              />

              {bannerPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={handleRemoveBanner}
                >
                  Remove Banner
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => router.push("/seller/channels")}
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="min-w-44"
        >
          {loading
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Channel"
              : "Save Changes"}
        </Button>
      </div>

    </div>
  );
}