import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import DashboardStats from "@/components/seller/DashboardStats";
import SellerChannelCard from "@/components/seller/SellerChannelCard";


export default async function SellerDashboardPage() {

  const supabase = await createClient();


  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (!user) {
    redirect("/login");
  }


  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();



  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });



  let videoCount = 0;


  if (channels?.length) {

    const channelIds = channels.map(
      (channel) => channel.id
    );


    const { count } = await supabase
      .from("videos")
      .select("*", {
        count: "exact",
        head: true,
      })
      .in("channel_id", channelIds);


    videoCount = count ?? 0;
  }



  return (
    <div className="px-6 py-6 space-y-6">


      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.display_name}
        </h1>

        <p className="text-muted-foreground mt-2">
          Manage your channels and grow your audience.
        </p>
      </div>



      <DashboardStats
        channelCount={channels?.length ?? 0}
        videoCount={videoCount}
      />



      <section className="space-y-4">

        <h2 className="text-2xl font-bold">
          Your Channels
        </h2>


        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {channels?.length ? (

            channels.map((channel) => (

              <SellerChannelCard
                key={channel.id}
                channel={channel}
              />

            ))

          ) : (

            <p className="text-muted-foreground">
              No channels created yet.
            </p>

          )}

        </div>

      </section>


    </div>
  );
}