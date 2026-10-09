import { cookies } from "next/headers";

import ChannelForm from "@/components/channels/ChannelForm";
import { getTranslations } from "@/lib/translations";

export default async function NewChannelPage() {
  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const translations = await getTranslations(
    [
      "seller_channels.create_title",
      "seller_channels.create_description",

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
      <div>
        <h1 className="text-3xl font-bold">
          {translations["seller_channels.create_title"] ??
            "Create Channel"}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {translations["seller_channels.create_description"] ??
            "Launch your language channel and start accepting subscribers."}
        </p>
      </div>

      <ChannelForm
        mode="create"
        translations={{
          generalInformation:
            translations["channel_form.general_information"] ??
            "General Information",

          generalInformationDescription:
            translations["channel_form.general_information_description"] ??
            "Update how your channel appears across NiceConvo.",

          channelName:
            translations["channel_form.channel_name"] ??
            "Channel Name",

          channelNameRequired:
            translations["channel_form.channel_name_required"] ??
            "Channel Name",

          channelNameHint:
            translations["channel_form.channel_name_hint"] ??
            "This is the name learners will see.",

          description:
            translations["channel_form.description"] ??
            "Description",

          descriptionHint:
            translations["channel_form.description_hint"] ??
            "Describe what learners can expect.",

          pricing:
            translations["channel_form.pricing"] ??
            "Pricing",

          pricingDescription:
            translations["channel_form.pricing_description"] ??
            "Set your monthly subscription price.",

          monthlySubscription:
            translations["channel_form.monthly_subscription"] ??
            "Monthly Subscription",

          priceHint:
            translations["channel_form.price_hint"] ??
            "You can change this later.",

          branding:
            translations["channel_form.branding"] ??
            "Channel Branding",

          brandingDescription:
            translations["channel_form.branding_description"] ??
            "Add a logo and banner to give your channel its own identity.",

          channelLogo:
            translations["channel_form.channel_logo"] ??
            "Channel Logo",

          logoHint:
            translations["channel_form.logo_hint"] ??
            "Recommended: 400 × 400 px. JPG, PNG or WEBP. Max 5 MB.",

          noLogo:
            translations["channel_form.no_logo"] ??
            "No logo",

          removeLogo:
            translations["channel_form.remove_logo"] ??
            "Remove Logo",

          channelBanner:
            translations["channel_form.channel_banner"] ??
            "Channel Banner",

          bannerHint:
            translations["channel_form.banner_hint"] ??
            "Recommended: 1500 × 500 px. JPG, PNG or WEBP. Max 5 MB.",

          noBanner:
            translations["channel_form.no_banner"] ??
            "No banner",

          removeBanner:
            translations["channel_form.remove_banner"] ??
            "Remove Banner",

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
            translations["channel_form.error.invalid_image_type"] ??
            "Please upload a JPG, PNG, or WEBP image.",

          imageTooLarge:
            translations["channel_form.error.image_too_large"] ??
            "Image size must be 5 MB or less.",

          nameRequired:
            translations["channel_form.error.name_required"] ??
            "Channel name is required.",

          invalidPrice:
            translations["channel_form.error.invalid_price"] ??
            "Subscription price must be $0 or greater.",

          invalidChannelName:
            translations["channel_form.error.invalid_channel_name"] ??
            "Please enter a valid channel name.",

          genericError:
            translations["channel_form.error.generic"] ??
            "Something went wrong. Please try again.",
        }}
      />
    </div>
  );
}