import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import ChannelForm from "@/components/channels/ChannelForm";

export default async function AdminNewChannelPage() {
  await requireAdmin();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data: sellers, error } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("is_creator", true)
    .order("display_name");

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="w-full">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Back */}
        <Link
          href="/admin/channels"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Channels
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Create Channel
          </h1>

          <p className="mt-1 text-sm text-muted">
            Create a language channel for a NiceConvo seller.
          </p>
        </div>

        <ChannelForm
          mode="create"
          adminMode
          userId={user.id}
          sellers={sellers ?? []}
          translations={{
            generalInformation: "General Information",
            generalInformationDescription:
              "Update how your channel appears across NiceConvo.",

            channelName: "Channel Name",
            channelNameRequired: "Channel Name",
            channelNameHint:
              "This is the name learners will see.",

            description: "Description",
            descriptionHint:
              "Describe what learners can expect.",

            pricing: "Pricing",
            pricingDescription:
              "Set the monthly subscription price.",

            monthlySubscription: "Monthly Subscription",
            priceHint: "You can change this later.",

            branding: "Channel Branding",
            brandingDescription:
              "Add a logo and banner to give your channel its own identity.",

            channelLogo: "Channel Logo",
            logoHint:
              "Recommended: 400 × 400 px. JPG, PNG or WEBP. Max 5 MB.",

            noLogo: "No logo",
            removeLogo: "Remove Logo",

            channelBanner: "Channel Banner",
            bannerHint:
              "Recommended: 1500 × 500 px. JPG, PNG or WEBP. Max 5 MB.",

            noBanner: "No banner",
            removeBanner: "Remove Banner",

            chooseFile: "Choose File",
            noFileChosen: "No file chosen",

            cancel: "Cancel",
            creating: "Creating...",
            saving: "Saving...",

            createChannel: "Create Channel",
            saveChanges: "Save Changes",

            invalidImageType:
              "Please upload a JPG, PNG, or WEBP image.",

            imageTooLarge:
              "Image size must be 5 MB or less.",

            nameRequired:
              "Channel name is required.",

            invalidPrice:
              "Subscription price must be $0 or greater.",

            invalidChannelName:
              "Please enter a valid channel name.",

            genericError:
              "Something went wrong. Please try again.",
          }}
        />
      </div>
    </main>
  );
}