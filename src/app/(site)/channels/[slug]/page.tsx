import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import ChannelHeader from "@/components/channels/ChannelHeader";
import ChannelVideos from "@/components/channels/ChannelVideos";


interface ChannelPageProps {
  params: Promise<{
    slug: string;
  }>;
}


export default async function ChannelPage({
  params,
}: ChannelPageProps) {

  const { slug } = await params;

  const supabase = await createClient();


  const { data: channel, error } = await supabase
    .from("channels")
    .select(`
      *,
      profiles (
        id,
        display_name,
        username,
        avatar_url,
        country
      )
    `)
    .eq("slug", slug)
    .single();


  if (error || !channel) {
    notFound();
  }


  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("channel_id", channel.id)
    .order("created_at", {
      ascending: false,
    });


  return (
    <div className="px-6 py-6 space-y-6">

      <ChannelHeader
        channel={channel}
      />


      <ChannelVideos
        videos={videos ?? []}
      />

    </div>
  );
}