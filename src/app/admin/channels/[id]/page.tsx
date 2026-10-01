import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import ChannelForm from "@/components/channels/ChannelForm";
import DeleteChannelButton from "@/components/channels/DeleteChannelButton";

export default async function AdminManageChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();

  const { data: channel, error: channelError } = await supabase
    .from("channels")
    .select("*")
    .eq("id", id)
    .single();

  if (channelError || !channel) {
    notFound();
  }

  const { data: sellers, error: sellersError } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("is_creator", true)
    .order("display_name");

  if (sellersError) {
    throw new Error(sellersError.message);
  }

  // Make sure the current channel owner is available in the dropdown,
  // even if they are no longer marked as a creator.
  const currentSellerIncluded = (sellers ?? []).some(
    (seller) => seller.id === channel.user_id
  );

  let sellerOptions = sellers ?? [];

  if (!currentSellerIncluded && channel.user_id) {
    const { data: currentSeller } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .eq("id", channel.user_id)
      .single();

    if (currentSeller) {
      sellerOptions = [currentSeller, ...sellerOptions];
    }
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

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            {channel.channel_name}
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage this channel and update its information.
          </p>
        </div>

        {/* Edit Form */}
        <ChannelForm
          mode="edit"
          adminMode
          userId={channel.user_id}
          sellers={sellerOptions}
          channel={channel}
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

        {/* Danger Zone */}
        <div className="mt-10 rounded-xl border border-border bg-background p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Danger Zone
            </h2>

            <p className="mt-1 text-sm text-muted">
              Permanently delete this channel and its associated content.
              This action cannot be undone.
            </p>
          </div>

          <div className="mt-4">
            <DeleteChannelButton
              channelId={channel.id}
              channelName={channel.channel_name}
              adminMode
            />
          </div>
        </div>
      </div>
    </main>
  );
}