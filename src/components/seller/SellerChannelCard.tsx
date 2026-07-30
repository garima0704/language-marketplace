import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface SellerChannelCardProps {
  channel: {
    id: string;
    channel_name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
    subscription_price: number;
    currency: string;
  };
}


export default function SellerChannelCard({
  channel,
}: SellerChannelCardProps) {

  return (
    <Card className="
      rounded-2xl
      p-5
      shadow-sm
      hover:border-primary
      transition
    ">


      <div className="flex items-center gap-4">


        <Avatar className="h-14 w-14">

          <AvatarImage
            src={channel.logo_url ?? ""}
          />


          <AvatarFallback className="bg-primary text-white">
            {channel.channel_name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>

        </Avatar>


        <div>

          <h3 className="font-semibold">
            {channel.channel_name}
          </h3>


          <p className="text-sm text-muted-foreground">
            ${channel.subscription_price}/{channel.currency}
          </p>

        </div>


      </div>



      <p className="
        mt-4
        text-sm
        text-muted-foreground
        line-clamp-2
      ">
        {channel.description || "No description added yet."}
      </p>




      <div className="mt-5 flex justify-end">

        <Link
          href={`/seller/channels/${channel.slug}`}
        >

          <Button>
            Manage Channel
          </Button>

        </Link>

      </div>


    </Card>
  );
}