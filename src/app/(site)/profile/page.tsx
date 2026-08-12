import { redirect } from "next/navigation";
import Link from "next/link";
import { becomeSeller } from "@/app/actions/seller";

import { createClient } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutSection from "@/components/profile/AboutSection";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return (
      <div className="px-6 py-6">
        <p>Profile not found.</p>
      </div>
    );
  }

  let channels = [];

if (profile.is_creator) {
  const { data } = await supabase
    .from("channels")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at");

  channels = data || [];
}
return (
    <div className="px-6 py-6 space-y-6">
      <ProfileHeader profile={profile} />
      
      <AboutSection profile={profile} />

      {!profile.is_creator && (
  <Card className="rounded-2xl shadow-sm">
    <div className="p-6">

      <h2 className="text-xl font-semibold">
        Become a Seller
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Share your language knowledge, create your own channels,
        upload videos, and earn from your subscribers.
      </p>

      <form action={becomeSeller}>
        <Button className="mt-5">
          Start Selling
        </Button>
      </form>

    </div>
  </Card>
)}

    {profile.is_creator && (
      <Card className="rounded-2xl shadow-sm">
        <div className="p-6">

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              My Channels
            </h2>

            <Link href="/seller/channels/new">
              <Button>
                Create Channel
              </Button>
            </Link>
          </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {channels?.length ? (
          channels.map((channel) => (
            <Card
              key={channel.id}
              className="rounded-xl p-4 border border-transparent hover:border-gray-300 transition"
            >
              <h3 className="font-semibold">
                {channel.channel_name}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {channel.description || "No description"}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">
                  ${channel.subscription_price}/month
                </span>

                <Link href={`/seller/channels/${channel.id}`}>
                  <Button size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">
            You haven't created any channels yet.
          </p>
        )}
      </div>
    </div>
  </Card>
)}
    </div>
  );
}