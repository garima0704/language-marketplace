import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import ChannelHeader from "@/components/channels/ChannelHeader";
import ChannelVideos from "@/components/channels/ChannelVideos";

interface ChannelPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ChannelPage({
  params,
}: ChannelPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  // Get channel
  const { data: channel, error: channelError } = await supabase
    .from("channels")
    .select(`
      *,
      profiles (
        id,
        display_name,
        username,
        avatar_url,
        country
      )
    `)
    .eq("slug", slug)
    .single();

  if (channelError || !channel) {
    notFound();
  }

  // Get channel videos
  const { data: videos, error: videosError } = await supabase
    .from("videos")
    .select("*")
    .eq("channel_id", channel.id)
    .order("created_at", {
      ascending: false,
    });

  if (videosError) {
    console.error("Channel videos error:", videosError);
  }

  let channelVideos = videos ?? [];

  // -----------------------------------------
  // Build category labels
  // -----------------------------------------

  const categoryIds = [
    ...new Set(
      channelVideos
        .map((video) => video.category_id)
        .filter(Boolean)
    ),
  ];

  if (categoryIds.length > 0) {
    const allCategoryIds = new Set<string>(categoryIds);
    let currentIds = categoryIds;

    // Get all parent categories
    while (currentIds.length > 0) {
      const { data: parents } = await supabase
        .from("categories")
        .select("id, parent_id, slug, level")
        .in("id", currentIds);

      if (!parents?.length) break;

      const parentIds = parents
        .map((category) => category.parent_id)
        .filter(
          (id): id is string =>
            !!id && !allCategoryIds.has(id)
        );

      if (parentIds.length === 0) break;

      parentIds.forEach((id) => allCategoryIds.add(id));
      currentIds = parentIds;
    }

    // Get all categories
    const { data: allCategories } = await supabase
      .from("categories")
      .select("id, parent_id, slug, level")
      .in("id", Array.from(allCategoryIds));

    // Get category names
    const { data: translations } = await supabase
      .from("category_translations")
      .select("category_id, name")
      .eq("locale_code", "en")
      .in("category_id", Array.from(allCategoryIds));

    const categoryById = new Map(
      (allCategories ?? []).map((category) => [
        category.id,
        category,
      ])
    );

    const nameById = new Map(
      (translations ?? []).map((translation) => [
        translation.category_id,
        translation.name,
      ])
    );

    // Build label for each video
    channelVideos = channelVideos.map((video) => {
      if (!video.category_id) {
        return video;
      }

      const current = categoryById.get(video.category_id);

      if (!current) {
        return video;
      }

      const deepestName =
        nameById.get(current.id) ?? current.slug;

      let root = current;

      while (root.parent_id) {
        const parent = categoryById.get(root.parent_id);

        if (!parent) break;

        root = parent;
      }

      const rootName =
        nameById.get(root.id) ?? root.slug;

      return {
        ...video,
        category_label:
          root.id === current.id
            ? rootName
            : `${rootName} - ${deepestName}`,
      };
    });
  }

  // Channel name
  const channelName = channel.channel_name;

  return (
    <div className="space-y-6 px-6 py-6">
      <ChannelHeader channel={channel} />

      <ChannelVideos
        videos={channelVideos}
        channelName={channelName}
      />
    </div>
  );
}