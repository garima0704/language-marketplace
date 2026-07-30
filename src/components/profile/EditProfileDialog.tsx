"use client";

import { useState,useRef } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  country: string | null;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

export default function EditProfileDialog({
  open,
  onOpenChange,
  profile,
}: EditProfileDialogProps) {

  const router = useRouter();
  const supabase = createClient();


  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState(
    profile.avatar_url ?? ""
  );

  const [displayName, setDisplayName] = useState(
    profile.display_name ?? ""
  );

  const [username, setUsername] = useState(
    profile.username ?? ""
  );

  const [country, setCountry] = useState(
    profile.country ?? ""
  );

  const [loading, setLoading] = useState(false);


  async function handleSave() {
  setLoading(true);

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      username,
      country,
      avatar_url: avatarUrl,
    })
    .eq("id", profile.id);


  if (error) {
    console.error(
      "Profile update failed:",
      error.message
    );

    setLoading(false);
    return;
  }


  setLoading(false);

  onOpenChange(false);

  router.refresh();
}

  async function handleAvatarUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;


  // Check file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Maximum file size is 5MB");
    return;
  }


  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    alert("Only JPG, PNG and WebP files are allowed");
    return;
  }


  const fileExt = file.name.split(".").pop();

  const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`;


  const { error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      upsert: true,
    });


  if (error) {
    console.error("Upload error:", error.message);
    return;
  }


  const {
    data: { publicUrl },
  } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);


  setAvatarUrl(publicUrl);
}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[95vw]
          max-w-3xl
          max-h-[90vh]
          overflow-y-auto
          overflow-x-hidden
          rounded-2xl
          bg-white
          p-8
        "
      >

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Profile
          </DialogTitle>
        </DialogHeader>


        <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">


          {/* Left */}
          <div className="flex flex-col items-center">

            <Avatar className="h-32 w-32">

              <AvatarImage src={avatarUrl} />

              <AvatarFallback className="bg-primary text-4xl text-white">
                {displayName
                  ?.split(" ")
                  .map((name) => name.charAt(0))
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>

            </Avatar>


            <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={handleAvatarUpload}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-5 rounded-full"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              Change Photo
            </Button>
          </>


            <p className="mt-3 text-center text-xs text-muted-foreground">
              JPG, PNG or WebP
              <br />
              Maximum 5 MB
            </p>

          </div>



          {/* Right */}
          <div className="space-y-5">


            <div className="space-y-2">
              <Label>
                Display Name
              </Label>

              <Input
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
              />
            </div>



            <div className="space-y-2">

              <Label>
                Username
              </Label>

              <Input
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
              />

              <p className="text-xs text-muted-foreground">
                This appears in your public profile URL.
              </p>

            </div>



            <div className="space-y-2">

              <Label>
                Country
              </Label>

              <Input
                value={country}
                onChange={(e) =>
                  setCountry(e.target.value)
                }
              />

            </div>

            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">


              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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

        </div>

      </DialogContent>
    </Dialog>
  );
}