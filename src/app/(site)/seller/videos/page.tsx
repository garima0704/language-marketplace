import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import { getCategoryLabel } from "@/lib/categories";

import VideoSection from "@/components/VideoSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SellerVideosPage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // Authentication
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // Check creator
  // --------------------------------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) {
    redirect("/");
  }

  // --------------------------------------------------
  // Current locale
  // --------------------------------------------------

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  // --------------------------------------------------
  // Get seller channels
  // --------------------------------------------------

  const { data: channels } = await supabase
    .from("channels")
    .select("id")
    .eq("user_id", user.id);

  const channelIds =
    channels?.map((channel) => channel.id) ?? [];

  // --------------------------------------------------
  // Get seller videos
  // --------------------------------------------------

  let videos: any[] = [];

  if (channelIds.length > 0) {
    const { data, error } = await supabase
      .from("videos")
      .select(`
        *,
        channels (
          id,
          channel_name,
          slug,
          logo_url
        )
      `)
      .in("channel_id", channelIds)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error loading seller videos:",
        error
      );
    }

    videos = data ?? [];

    // ------------------------------------------------
    // Build category labels using translations
    // ------------------------------------------------

    const categoryIds = [
      ...new Set(
        videos
          .map((video) => video.category_id)
          .filter(
            (id): id is string => Boolean(id)
          )
      ),
    ];

    if (categoryIds.length > 0) {
      const categoryLabels = await Promise.all(
        categoryIds.map(async (categoryId) => {
          const label =
            await getCategoryLabel(
              categoryId,
              locale
            );

          return [categoryId, label] as const;
        })
      );

      const categoryLabelMap = new Map(
        categoryLabels
      );

      for (const video of videos) {
        if (!video.category_id) {
          continue;
        }

        video.category_label =
          categoryLabelMap.get(
            video.category_id
          ) ?? "";
      }
    }
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="space-y-6 px-6 py-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Videos
          </h1>

          <p className="mt-2 text-muted-foreground">
            Upload and manage your language
            learning videos.
          </p>
        </div>

        <Link href="/seller/videos/new">
          <Button>
            Upload Video
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Input
        placeholder="Search videos..."
        className="max-w-md"
      />

      {/* Videos */}
      <VideoSection
        videos={videos}
        showViewAll={false}
        showStatus
        showManage
        compact
      />
    </div>
  );
}