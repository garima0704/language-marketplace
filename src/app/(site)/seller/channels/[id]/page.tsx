import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="space-y-6 px-6 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {channel.channel_name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your channel information.
        </p>
      </div>

      {/* Edit Channel */}
      <ChannelForm
        mode="edit"
        channel={channel}
      />

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-red-600">
            Danger Zone
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Permanently delete this channel and its associated content.
            This action cannot be undone.
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