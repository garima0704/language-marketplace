import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
    // Get category IDs
    // ------------------------------------------------

    const categoryIds = [
      ...new Set(
        videos
          .map((video) => video.category_id)
          .filter(Boolean)
      ),
    ];

    // ------------------------------------------------
    // Build category labels
    // ------------------------------------------------

    if (categoryIds.length > 0) {
      const allCategoryIds = new Set<string>(
        categoryIds
      );

      let currentIds = categoryIds;

      // ----------------------------------------------
      // Get parent categories
      // ----------------------------------------------

      while (currentIds.length > 0) {
        const { data: parents } =
          await supabase
            .from("categories")
            .select(
              "id, parent_id, slug, level"
            )
            .in("id", currentIds);

        if (!parents?.length) {
          break;
        }

        const parentIds = parents
          .map(
            (category) =>
              category.parent_id
          )
          .filter(
            (id): id is string =>
              !!id &&
              !allCategoryIds.has(id)
          );

        if (parentIds.length === 0) {
          break;
        }

        parentIds.forEach((id) =>
          allCategoryIds.add(id)
        );

        currentIds = parentIds;
      }

      // ----------------------------------------------
      // Get all categories
      // ----------------------------------------------

      const { data: allCategories } =
        await supabase
          .from("categories")
          .select(
            "id, parent_id, slug, level"
          )
          .in(
            "id",
            Array.from(allCategoryIds)
          );

      // ----------------------------------------------
      // Get English translations
      // ----------------------------------------------

      const { data: translations } =
        await supabase
          .from("category_translations")
          .select(
            "category_id, name"
          )
          .eq("locale_code", "en")
          .in(
            "category_id",
            Array.from(allCategoryIds)
          );

      // ----------------------------------------------
      // Lookup maps
      // ----------------------------------------------

      const categoryById = new Map(
        (allCategories ?? []).map(
          (category) => [
            category.id,
            category,
          ]
        )
      );

      const nameById = new Map(
        (translations ?? []).map(
          (translation) => [
            translation.category_id,
            translation.name,
          ]
        )
      );

      // ----------------------------------------------
      // Build category label
      // ----------------------------------------------

      for (const video of videos) {
        if (!video.category_id) {
          continue;
        }

        const current =
          categoryById.get(
            video.category_id
          );

        if (!current) {
          continue;
        }

        const deepestName =
          nameById.get(current.id) ??
          current.slug;

        let root = current;

        while (root.parent_id) {
          const parent =
            categoryById.get(
              root.parent_id
            );

          if (!parent) {
            break;
          }

          root = parent;
        }

        const rootName =
          nameById.get(root.id) ??
          root.slug;

        video.category_label =
          root.id === current.id
            ? rootName
            : `${rootName} - ${deepestName}`;
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