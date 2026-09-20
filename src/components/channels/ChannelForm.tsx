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

interface ChannelFormTranslations {
  generalInformation: string;
  generalInformationDescription: string;
  channelName: string;
  channelNameRequired: string;
  channelNameHint: string;
  description: string;
  descriptionHint: string;

  pricing: string;
  pricingDescription: string;
  monthlySubscription: string;
  priceHint: string;

  branding: string;
  brandingDescription: string;
  channelLogo: string;
  logoHint: string;
  noLogo: string;
  removeLogo: string;

  channelBanner: string;
  bannerHint: string;
  noBanner: string;
  removeBanner: string;

  chooseFile: string;
  noFileChosen: string;

  cancel: string;
  creating: string;
  saving: string;
  createChannel: string;
  saveChanges: string;

  invalidImageType: string;
  imageTooLarge: string;
  nameRequired: string;
  invalidPrice: string;
  invalidChannelName: string;
  genericError: string;
}

interface Props {
  mode: "create" | "edit";
  userId?: string;
  channel?: Channel;
  translations: ChannelFormTranslations;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function ChannelForm({
  mode,
  userId,
  channel,
  translations,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [channelName, setChannelName] = useState(
    channel?.channel_name ?? ""
  );

  const [description, setDescription] = useState(
    channel?.description ?? ""
  );

  const [price, setPrice] = useState(
    channel?.subscription_price.toString() ?? "0"
  );

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

  // --------------------------------------------------
  // Generate unique slug
  // --------------------------------------------------

  async function generateUniqueSlug(baseSlug: string) {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data, error } = await supabase
        .from("channels")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        return slug;
      }

      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }
  }

  // --------------------------------------------------
  // Image validation
  // --------------------------------------------------

  function validateImage(file: File) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return translations.invalidImageType;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return translations.imageTooLarge;
    }

    return null;
  }

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
    const trimmedDescription = description.trim();
    const subscriptionPrice = Number(price);

    if (!trimmedName) {
      setError(translations.nameRequired);
      return;
    }

    if (isNaN(subscriptionPrice) || subscriptionPrice < 0) {
      setError(translations.invalidPrice);
      return;
    }

    setLoading(true);

    try {
      // --------------------------------------------------
      // CREATE
      // --------------------------------------------------

      if (mode === "create") {
        if (!generatedSlug) {
          setError(translations.invalidChannelName);
          return;
        }

        const uniqueSlug =
          await generateUniqueSlug(generatedSlug);

        const { data, error: createError } =
          await supabase
            .from("channels")
            .insert({
              user_id: userId,
              channel_name: trimmedName,
              slug: uniqueSlug,
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

        if (logoFile) {
          logoUrl = await uploadChannelAsset(
            channelId,
            "logo",
            logoFile
          );
        }

        if (bannerFile) {
          bannerUrl = await uploadChannelAsset(
            channelId,
            "banner",
            bannerFile
          );
        }

        if (logoUrl || bannerUrl) {
          const { error: assetUpdateError } =
            await supabase
              .from("channels")
              .update({
                ...(logoUrl ? { logo_url: logoUrl } : {}),
                ...(bannerUrl
                  ? { banner_url: bannerUrl }
                  : {}),
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

      if (logoFile) {
        logoUrl = await uploadChannelAsset(
          channelId,
          "logo",
          logoFile
        );
      }

      if (removeLogo && !logoFile) {
        await deleteChannelAsset(channelId, "logo");
        logoUrl = null;
      }

      if (bannerFile) {
        bannerUrl = await uploadChannelAsset(
          channelId,
          "banner",
          bannerFile
        );
      }

      if (removeBanner && !bannerFile) {
        await deleteChannelAsset(channelId, "banner");
        bannerUrl = null;
      }

      const { error: updateError } = await supabase
        .from("channels")
        .update({
          channel_name: trimmedName,
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
          : translations.genericError
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-10">
      {/* General Information */}
      <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">
            {translations.generalInformation}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {translations.generalInformationDescription}
          </p>
        </div>

        <div className="space-y-8">
          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="channelName">
              {translations.channelName}{" "}
              <span className="text-red-600">*</span>
            </Label>

            <Input
              id="channelName"
              value={channelName}
              autoFocus
              onChange={(e) => setChannelName(e.target.value)}
            />

            <p className="text-xs text-muted">
              {translations.channelNameHint}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="description">
                {translations.description}
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
              {translations.descriptionHint}
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">
            {translations.pricing}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {translations.pricingDescription}
          </p>
        </div>

        <div className="max-w-sm space-y-2">
          <Label htmlFor="price">
            {translations.monthlySubscription}
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
            {translations.priceHint}
          </p>
        </div>
      </div>

      {/* Channel Branding */}
      <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">
            {translations.branding}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {translations.brandingDescription}
          </p>
        </div>

        <div className="space-y-10">
          {/* Logo */}
          <div className="space-y-4">
            <div>
              <Label>{translations.channelLogo}</Label>

              <p className="mt-1 text-xs text-muted">
                {translations.logoHint}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted-bg">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt={translations.channelLogo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-4 text-center text-xs text-muted">
                    {translations.noLogo}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="channelLogo"
                  className="inline-flex cursor-pointer items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted-bg"
                >
                  {translations.chooseFile}
                </label>

                <input
                  id="channelLogo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoChange}
                  disabled={loading}
                  className="sr-only"
                />

                <p className="text-xs text-muted">
                  {logoFile?.name ?? translations.noFileChosen}
                </p>

                {logoPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={handleRemoveLogo}
                  >
                    {translations.removeLogo}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="space-y-4">
            <div>
              <Label>{translations.channelBanner}</Label>

              <p className="mt-1 text-xs text-muted">
                {translations.bannerHint}
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-muted-bg">
              <div className="aspect-[3/1] w-full">
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt={translations.channelBanner}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-xs text-muted">
                      {translations.noBanner}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label
                htmlFor="channelBanner"
                className="inline-flex cursor-pointer items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted-bg"
              >
                {translations.chooseFile}
              </label>

              <input
                id="channelBanner"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBannerChange}
                disabled={loading}
                className="sr-only"
              />

              <p className="text-xs text-muted">
                {bannerFile?.name ?? translations.noFileChosen}
              </p>

              {bannerPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={handleRemoveBanner}
                >
                  {translations.removeBanner}
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
          {translations.cancel}
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="min-w-44"
        >
          {loading
            ? mode === "create"
              ? translations.creating
              : translations.saving
            : mode === "create"
              ? translations.createChannel
              : translations.saveChanges}
        </Button>
      </div>
    </div>
  );
}