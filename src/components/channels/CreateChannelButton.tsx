"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function CreateChannelButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/seller/channels/new")}
      className="transition-opacity hover:opacity-90"
    >
      Create Channel
    </Button>
  );
}