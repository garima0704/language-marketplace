"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CreateChannelButton() {
  return (
    <Button
      asChild
      className="bg-primary text-white hover:bg-primary hover:opacity-90 transition-opacity"
    >
      <Link href="/seller/channels/new">Create Channel</Link>
    </Button>
  );
}