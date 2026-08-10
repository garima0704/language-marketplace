import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SellerVideosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) {
    redirect("/");
  }

 // Get seller's channels
const { data: channels } = await supabase
  .from("channels")
  .select("id")
  .eq("user_id", user.id);

const channelIds = channels?.map((channel) => channel.id) ?? [];

let videos: any[] = [];

if (channelIds.length > 0) {
  const { data } = await supabase
    .from("videos")
    .select(`
      *,
      channels (
        id,
        channel_name,
        slug
      )
    `)
    .in("channel_id", channelIds)
    .order("created_at", { ascending: false });

  videos = data ?? [];

// Get category names for videos
const categoryIds = [
  ...new Set(
    videos
      .map((video) => video.category_id)
      .filter(Boolean)
  ),
];

let categoryMap = new Map<string, string>();

if (categoryIds.length > 0) {
  const { data: categories } = await supabase
    .from("categories")
    .select("id, parent_id, slug, level")
    .in("id", categoryIds);

  const allCategoryIds = new Set<string>(categoryIds);

  // Get all parents
  let currentIds = categoryIds;

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

  // Fetch all category records
  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, parent_id, slug, level")
    .in("id", Array.from(allCategoryIds));

  // Fetch English names
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

  // Build category label for each video
  for (const video of videos) {
    if (!video.category_id) continue;

    const current = categoryById.get(video.category_id);

    if (!current) continue;

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

    video.category_label =
      root.id === current.id
        ? rootName
        : `${rootName} - ${deepestName}`;
  }
}
}

  return (
    <div className="space-y-6 px-6 py-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#082645]">
            My Videos
          </h1>

          <p className="mt-2 text-muted-foreground">
            Upload and manage your language learning videos.
          </p>
        </div>

        <Link href="/seller/videos/new">
          <Button>Upload Video</Button>
        </Link>
      </div>

      {/* Search */}
      <Input
        placeholder="Search videos..."
        className="max-w-md"
      />

      {/* Content */}
      {videos.length === 0 ? (
        <Card className="rounded-xl border-dashed">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-6xl">🎥</div>

            <h2 className="text-2xl font-semibold">
              No videos uploaded yet
            </h2>

            <p className="mt-3 max-w-md text-muted-foreground">
              Upload your first lesson to start growing your audience.
            </p>

            <Link
              href="/seller/videos/new"
              className="mt-6"
            >
              <Button>Upload Your First Video</Button>
            </Link>
          </div>
        </Card>
      ) : (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {videos.map((video) => (
    <Card
      key={video.id}
      className="overflow-hidden rounded-xl transition hover:shadow-md"
    >
{/* Thumbnail */}
<div className="relative aspect-video bg-muted">
  {video.thumbnail_url ? (
    <img
      src={video.thumbnail_url}
      alt={video.title}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full items-center justify-center text-4xl">
      🎥
    </div>
  )}

  {/* Category Tag */}
  {video.category_label && (
                  <span className="absolute right-2 -top-3 z-10 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm">
                    {video.category_label}
                  </span>
                )}
              </div>

{/* Video information */}
<div className="space-y-2 p-4 pt-2">
        <h3 className="line-clamp-2 font-semibold">
          {video.title}
        </h3>

        <p className="truncate text-sm text-muted-foreground">
          {video.channels?.channel_name}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              video.status === "published"
                ? "rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                : "rounded-full bg-muted px-2 py-1 text-xs"
            }
          >
            {video.status}
          </span>

          <span
            className={
              video.access_type === "free"
                ? "rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                : "rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
            }
          >
            {video.access_type === "free"
              ? "Free"
              : "Subscribers only"}
          </span>
        </div>

        {/* Manage */}
        <div className="flex justify-end pt-2">
          <Link href={`/seller/videos/${video.id}`}>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  ))}
</div>
      )}
    </div>
  );
}