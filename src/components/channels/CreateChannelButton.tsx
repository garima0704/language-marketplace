"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import CreateChannelDialog from "./CreateChannelDialog";

interface CreateChannelButtonProps {
  userId: string;
}

export default function CreateChannelButton({
  userId,
}: CreateChannelButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-primary text-white hover:bg-primary hover:opacity-90 transition-opacity"
      >
        Create Channel
      </Button>

      <CreateChannelDialog
        open={open}
        onOpenChange={setOpen}
        userId={userId}
      />
    </>
  );
}