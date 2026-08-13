import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import CategoryBar from "@/components/CategoryBar";
import VideoSection from "@/components/VideoSection";

type Props = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const currentSlug = slug[slug.length - 1];

  const supabase = await createClient();

  // --------------------------------------------------
  // Resolve category path
  // --------------------------------------------------

  let category: {
    id: string;
    slug: string;
    parent_id: string | null;
    level: number;
  } | null = null;

  let parentId: string | null = null;

  for (const segment of slug) {
    let query = supabase
      .from("categories")
      .select("id, slug, parent_id, level")
      .eq("slug", segment)
      .eq("is_active", true);

    if (parentId === null) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", parentId);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      console.log("Failed to resolve:", segment, error);
      notFound();
    }

    category = data;
    parentId = data.id;
  }

  if (!category) {
    notFound();
  }

  // --------------------------------------------------
  // Current category name
  // --------------------------------------------------

  const { data: translation } = await supabase
    .from("category_translations")
    .select("name")
    .eq("category_id", category.id)
    .eq("locale_code", "en")
    .maybeSingle();

  // --------------------------------------------------
  // Child categories for pills
  // --------------------------------------------------

  const { data: children } = await supabase
    .from("categories")
    .select(`
      id,
      slug,
      display_order,
      category_translations!inner(
        locale_code,
        name
      )
    `)
    .eq("parent_id", category.id)
    .eq("is_active", true)
    .eq("category_translations.locale_code", "en")
    .order("display_order");

  const pills = [
    {
      id: "all",
      slug: currentSlug,
      name: "All",
    },

    ...(children ?? []).map((child: any) => ({
      id: child.id,
      slug: child.slug,
      name: child.category_translations[0]?.name ?? child.slug,
    })),
  ];

  // --------------------------------------------------
  // Find current category + all descendants
  // --------------------------------------------------

  const categoryIds = new Set<string>([category.id]);

  let currentIds = [category.id];

  while (currentIds.length > 0) {
    const { data: descendants } = await supabase
      .from("categories")
      .select("id")
      .in("parent_id", currentIds)
      .eq("is_active", true);

    if (!descendants?.length) {
      break;
    }

    const newIds: string[] = [];

    for (const descendant of descendants) {
      if (!categoryIds.has(descendant.id)) {
        categoryIds.add(descendant.id);
        newIds.push(descendant.id);
      }
    }

    if (newIds.length === 0) {
      break;
    }

    currentIds = newIds;
  }

  // --------------------------------------------------
  // Fetch videos belonging to this category tree
  // --------------------------------------------------

const { data: videos, error: videosError } = await supabase
  .from("videos")
  .select(`
    id,
    title,
    thumbnail_url,
    level,
    access_type,
    view_count,
    created_at,
    published_at,
    category_id,

    channels (
      id,
      channel_name,
      logo_url,
      user_id,

      profiles (
        id,
        display_name,
        avatar_url,
        is_creator
      )
    ),

    categories (
      id,
      slug,
      parent_id,
      level,

      category_translations (
        name,
        locale_code
      )
    )
  `)
  .eq("status", "published")
  .in("category_id", Array.from(categoryIds))
  .order("published_at", {
    ascending: false,
    nullsFirst: false,
  });

  if (videosError) {
    console.error("Category videos error:", videosError);
  }

  // --------------------------------------------------
  // Build category labels
  // Example: English - Business
  // --------------------------------------------------

  let formattedVideos = videos ?? [];

  const videoCategoryIds = [
    ...new Set(
      formattedVideos
        .map((video) => video.category_id)
        .filter(Boolean)
    ),
  ];

  if (videoCategoryIds.length > 0) {
    const allCategoryIds = new Set<string>(videoCategoryIds);
    let currentIds = videoCategoryIds;

    // Get all parents
    while (currentIds.length > 0) {
      const { data: parents } = await supabase
        .from("categories")
        .select("id, parent_id, slug, level")
        .in("id", currentIds);

      if (!parents?.length) break;

      const parentIds = parents
        .map((item) => item.parent_id)
        .filter(
          (id): id is string =>
            !!id && !allCategoryIds.has(id)
        );

      if (parentIds.length === 0) break;

      parentIds.forEach((id) => allCategoryIds.add(id));
      currentIds = parentIds;
    }

    // Get category names
    const { data: categoryTranslations } = await supabase
      .from("category_translations")
      .select("category_id, name")
      .eq("locale_code", "en")
      .in("category_id", Array.from(allCategoryIds));

    const { data: allCategories } = await supabase
      .from("categories")
      .select("id, parent_id, slug, level")
      .in("id", Array.from(allCategoryIds));

    const categoryById = new Map(
      (allCategories ?? []).map((item) => [
        item.id,
        item,
      ])
    );

    const nameById = new Map(
      (categoryTranslations ?? []).map((item) => [
        item.category_id,
        item.name,
      ])
    );

    formattedVideos = formattedVideos.map((video) => {
      if (!video.category_id) {
        return {
          ...video,
          category_label: "",
        };
      }

      const current = categoryById.get(video.category_id);

      if (!current) {
        return {
          ...video,
          category_label: "",
        };
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

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="px-6 py-6">

      {/* Header */}
      <div className="mx-auto mb-6 max-w-7xl">

        <nav className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">

          <Link
            href="/"
            className="transition hover:text-gray-900"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/videos"
            className="transition hover:text-gray-900"
          >
            Videos
          </Link>

          {slug.map((part, index) => {
            const href =
              "/videos/" +
              slug.slice(0, index + 1).join("/");

            const isCurrent =
              index === slug.length - 1;

            return (
              <div
                key={href}
                className="flex items-center gap-2"
              >
                <span>/</span>

                {isCurrent ? (
                  <span className="font-medium capitalize text-foreground">
                    {part.replace(/-/g, " ")}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="capitalize transition hover:text-gray-900"
                  >
                    {part.replace(/-/g, " ")}
                  </Link>
                )}
              </div>
            );
          })}

        </nav>

        <h1 className="text-4xl font-bold text-gray-900">
          {translation?.name ?? currentSlug}
        </h1>

      </div>

      {/* Category filter */}
      <CategoryBar
        categories={pills}
        selectedCategory="all"
        basePath={`/videos/${slug.join("/")}`}
      />

      {/* Result count */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <p className="text-sm font-medium text-gray-600">
          {formattedVideos.length}{" "}
          {formattedVideos.length === 1
            ? "Video"
            : "Videos"}
        </p>
      </div>

      {/* Videos */}
      <VideoSection
        showViewAll={false}
        videos={formattedVideos}
      />

    </div>
  );
}