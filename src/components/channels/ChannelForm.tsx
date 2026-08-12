"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Channel {
  id: string;
  channel_name: string;
  slug: string;
  description: string | null;
  subscription_price: number;
}

interface Props {
  mode: "create" | "edit";
  userId?: string;
  channel?: Channel;
}

export default function ChannelForm({
  mode,
  userId,
  channel,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [channelName, setChannelName] = useState(
    channel?.channel_name ?? ""
  );

  const [slug, setSlug] = useState(channel?.slug ?? "");

  const [description, setDescription] = useState(
    channel?.description ?? ""
  );

  const [price, setPrice] = useState(
    channel?.subscription_price.toString() ?? "0"
  );

  const [slugEdited, setSlugEdited] = useState(mode === "edit");

  const generatedSlug = useMemo(() => {
    return channelName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, [channelName]);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(generatedSlug);
    }
  }, [generatedSlug, slugEdited]);

  async function handleSubmit() {
    if (loading) return;

    setError("");

    const trimmedName = channelName.trim();
    const trimmedSlug = slug.trim();
    const trimmedDescription = description.trim();
    const subscriptionPrice = Number(price);

    if (!trimmedName) {
      setError("Channel name is required.");
      return;
    }

    if (!trimmedSlug) {
      setError("Channel URL is required.");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      setError(
        "Channel URL can only contain lowercase letters, numbers and hyphens."
      );
      return;
    }

    if (isNaN(subscriptionPrice) || subscriptionPrice < 0) {
      setError("Subscription price must be $0 or greater.");
      return;
    }

    setLoading(true);

    try {
      const { data: existing } = await supabase
        .from("channels")
        .select("id")
        .eq("slug", trimmedSlug)
        .neq("id", channel?.id ?? "")
        .maybeSingle();

      if (existing) {
        setError("This channel URL is already taken.");
        return;
      }

      if (mode === "create") {
        const { data, error } = await supabase
          .from("channels")
          .insert({
            user_id: userId,
            channel_name: trimmedName,
            slug: trimmedSlug,
            description: trimmedDescription,
            subscription_price: subscriptionPrice,
          })
          .select("id")
          .single();

        if (error) {
          setError(error.message);
          return;
        }

        router.push(`/seller/channels/${data.id}`);
      } else {
        const { error } = await supabase
          .from("channels")
          .update({
            channel_name: trimmedName,
            slug: trimmedSlug,
            description: trimmedDescription,
            subscription_price: subscriptionPrice,
          })
          .eq("id", channel!.id);

        if (error) {
          setError(error.message);
          return;
        }

        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-10">

      {/* General Information */}
      <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">
            General Information
          </h2>

          <p className="mt-1 text-sm text-muted">
            Update how your channel appears across NiceConvo.
          </p>
        </div>

        <div className="space-y-8">

          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="channelName">
              Channel Name <span className="text-red-600">*</span>
            </Label>

            <Input
              id="channelName"
              value={channelName}
              autoFocus
              onChange={(e) => setChannelName(e.target.value)}
            />

            <p className="text-xs text-muted">
              This is the name learners will see.
            </p>
          </div>

          {/* Channel URL */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Channel URL
            </Label>

            <div className="flex overflow-hidden rounded-lg border border-border">
              <div className="flex items-center bg-muted-bg px-4 text-sm text-muted">
                niceconvo.com/c/
              </div>

              <Input
                id="slug"
                className="rounded-none border-0"
                value={slug}
                onChange={(e) => {
                  setSlugEdited(true);

                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
                  );
                }}
              />
            </div>

            <p className="text-xs text-muted">
              Your public channel URL.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="description">
                Description
              </Label>

              <span className="text-xs text-muted">
                {description.length}/500
              </span>
            </div>

            <Textarea
              id="description"
              rows={6}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <p className="text-xs text-muted">
              Describe what learners can expect.
            </p>
          </div>

        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">
            Pricing
          </h2>

          <p className="mt-1 text-sm text-muted">
            Set your monthly subscription price.
          </p>
        </div>

        <div className="max-w-sm space-y-2">
          <Label htmlFor="price">
            Monthly Subscription
          </Label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              $
            </span>

            <Input
              id="price"
              className="pl-7"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <p className="text-xs text-muted">
            You can change this later.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => router.push("/seller/channels")}
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="min-w-44"
        >
          {loading
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Channel"
              : "Save Changes"}
        </Button>
      </div>

    </div>
  );
}