import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import ChannelForm from "@/components/channels/ChannelForm";

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
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#082645]">
          {channel.channel_name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your channel information.
        </p>
      </div>

      <ChannelForm mode="edit" channel={channel}
/>
    </div>
  );
}