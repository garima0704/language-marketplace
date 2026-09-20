import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/translations";

import ChannelForm from "@/components/channels/ChannelForm";
import DeleteChannelButton from "@/components/channels/DeleteChannelButton";

export default async function ManageChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!channel) {
    notFound();
  }

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const translations = await getTranslations(
    [
      "seller_channels.manage_description",
      "seller_channels.danger_zone",
      "seller_channels.delete_description",

      "channel_form.general_information",
      "channel_form.general_information_description",
      "channel_form.channel_name",
      "channel_form.channel_name_required",
      "channel_form.channel_name_hint",
      "channel_form.description",
      "channel_form.description_hint",

      "channel_form.pricing",
      "channel_form.pricing_description",
      "channel_form.monthly_subscription",
      "channel_form.price_hint",

      "channel_form.branding",
      "channel_form.branding_description",
      "channel_form.channel_logo",
      "channel_form.logo_hint",
      "channel_form.no_logo",
      "channel_form.remove_logo",

      "channel_form.channel_banner",
      "channel_form.banner_hint",
      "channel_form.no_banner",
      "channel_form.remove_banner",

      "channel_form.choose_file",
      "channel_form.no_file_chosen",

      "channel_form.cancel",
      "channel_form.creating",
      "channel_form.saving",
      "channel_form.create_channel",
      "channel_form.save_changes",

      "channel_form.error.invalid_image_type",
      "channel_form.error.image_too_large",
      "channel_form.error.name_required",
      "channel_form.error.invalid_price",
      "channel_form.error.invalid_channel_name",
      "channel_form.error.generic",
    ],
    locale
  );

  return (
    <div className="space-y-6 px-6 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {channel.channel_name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {translations["seller_channels.manage_description"] ??
            "Manage your channel information."}
        </p>
      </div>

      {/* Edit Channel */}
      <ChannelForm
        mode="edit"
        channel={channel}
        translations={{
          generalInformation:
            translations["channel_form.general_information"] ??
            "General Information",

          generalInformationDescription:
            translations[
              "channel_form.general_information_description"
            ] ??
            "Set up the basic information for your channel.",

          channelName:
            translations["channel_form.channel_name"] ??
            "Channel Name",

          channelNameRequired:
            translations["channel_form.channel_name_required"] ??
            "Channel name is required.",

          channelNameHint:
            translations["channel_form.channel_name_hint"] ??
            "Choose a clear name for your language channel.",

          description:
            translations["channel_form.description"] ??
            "Description",

          descriptionHint:
            translations["channel_form.description_hint"] ??
            "Describe what subscribers can expect from this channel.",

          pricing:
            translations["channel_form.pricing"] ??
            "Pricing",

          pricingDescription:
            translations["channel_form.pricing_description"] ??
            "Set the monthly subscription price for your channel.",

          monthlySubscription:
            translations["channel_form.monthly_subscription"] ??
            "Monthly Subscription",

          priceHint:
            translations["channel_form.price_hint"] ??
            "Enter the monthly subscription price.",

          branding:
            translations["channel_form.branding"] ??
            "Channel Branding",

          brandingDescription:
            translations["channel_form.branding_description"] ??
            "Add a logo and banner to represent your channel.",

          channelLogo:
            translations["channel_form.channel_logo"] ??
            "Channel Logo",

          logoHint:
            translations["channel_form.logo_hint"] ??
            "JPEG, PNG, or WEBP. Maximum 5MB.",

          noLogo:
            translations["channel_form.no_logo"] ??
            "No logo",

          removeLogo:
            translations["channel_form.remove_logo"] ??
            "Remove logo",

          channelBanner:
            translations["channel_form.channel_banner"] ??
            "Channel Banner",

          bannerHint:
            translations["channel_form.banner_hint"] ??
            "JPEG, PNG, or WEBP. Maximum 5MB.",

          noBanner:
            translations["channel_form.no_banner"] ??
            "No banner",

          removeBanner:
            translations["channel_form.remove_banner"] ??
            "Remove banner",

          chooseFile:
            translations["channel_form.choose_file"] ??
            "Choose File",

          noFileChosen:
            translations["channel_form.no_file_chosen"] ??
            "No file chosen",

          cancel:
            translations["channel_form.cancel"] ??
            "Cancel",

          creating:
            translations["channel_form.creating"] ??
            "Creating...",

          saving:
            translations["channel_form.saving"] ??
            "Saving...",

          createChannel:
            translations["channel_form.create_channel"] ??
            "Create Channel",

          saveChanges:
            translations["channel_form.save_changes"] ??
            "Save Changes",

          invalidImageType:
            translations[
              "channel_form.error.invalid_image_type"
            ] ?? "Invalid image type.",

          imageTooLarge:
            translations[
              "channel_form.error.image_too_large"
            ] ?? "Image must be smaller than 5MB.",

          nameRequired:
            translations["channel_form.error.name_required"] ??
            "Channel name is required.",

          invalidPrice:
            translations["channel_form.error.invalid_price"] ??
            "Please enter a valid price.",

          invalidChannelName:
            translations[
              "channel_form.error.invalid_channel_name"
            ] ?? "Invalid channel name.",

          genericError:
            translations["channel_form.error.generic"] ??
            "Something went wrong. Please try again.",
        }}
      />

      {/* Danger Zone */}
      <div className="rounded-xl border border-border bg-background p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {translations["seller_channels.danger_zone"] ??
              "Danger Zone"}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {translations["seller_channels.delete_description"] ??
              "Permanently delete this channel and its associated content. This action cannot be undone."}
          </p>
        </div>

        <div className="mt-4">
          <DeleteChannelButton
            channelId={channel.id}
            channelName={channel.channel_name}
          />
        </div>
      </div>
    </div>
  );
}