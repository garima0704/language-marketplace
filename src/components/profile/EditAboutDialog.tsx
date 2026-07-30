"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { createClient } from "@/lib/supabase/client";

interface EditAboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: string;
    bio: string | null;
  };
}

export default function EditAboutDialog({
  open,
  onOpenChange,
  profile,
}: EditAboutDialogProps) {

  const [bio, setBio] = useState(profile.bio ?? "");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();


  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        bio,
      })
      .eq("id", profile.id);


    if (error) {
      console.error("Error updating bio:", error.message);
      setLoading(false);
      return;
    }


    setLoading(false);
    onOpenChange(false);

    window.location.reload();
  };


  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="
          w-[95vw]
          max-w-3xl
          rounded-2xl
          bg-white
          p-8
        "
      >

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit About
          </DialogTitle>
        </DialogHeader>


        <div className="mt-6 space-y-6">


          <div className="space-y-2">

            <Label>
              About
            </Label>


            <Textarea
              rows={6}
              maxLength={300}
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              placeholder="Tell people about yourself..."
              className="resize-none"
            />


            <p className="text-xs text-muted-foreground">
              Maximum 300 characters.
            </p>

          </div>



          <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>


            <Button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="
                bg-primary
                text-white
                hover:bg-primary
                hover:opacity-90
                transition-opacity
              "
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>

          </div>


        </div>

      </DialogContent>
    </Dialog>
  );
}