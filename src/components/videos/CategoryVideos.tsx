import Link from "next/link";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import { getCategoryLabels } from "@/lib/categories";
import { getTranslations } from "@/lib/translations";
import { getBrowseLanguages } from "@/lib/languages";

import CategoryPills from "@/components/CategoryPills";
import VideoSection from "@/components/VideoSection";

interface CategoryVideosProps {
  slug: string[];
}

type Category = {
  id: string;
  slug: string;
  parent_id: string | null;
  level: number;
  display_order?: number;
};

export default async function CategoryVideos({
  slug,
}: CategoryVideosProps) {
  const supabase = await createClient();

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  // ==================================================
  // 1. Resolve browse language
  // ==================================================

  const languageCode = slug?.[0];

  if (!languageCode) {
    return null;
  }

  const {
    data: language,
    error: languageError,
  } = await supabase
    .from("locales")
    .select("code, name")
    .eq("code", languageCode)
    .eq("is_active", true)
    .maybeSingle();

  if (languageError) {
    console.error(
      "Failed to resolve browse language:",
      languageError
    );
  }

  if (!language) {
    console.error(
      `Browse language not found: ${languageCode}`
    );

    return null;
  }

  // ==================================================
  // 2. Remaining URL segments are category path
  //
  // /videos/en
  // /videos/en/business
  // /videos/en/business/marketing
  // ==================================================

  const categorySlug = slug.slice(1);

  // ==================================================
  // 3. Current UI translations
  // ==================================================

  const translations = await getTranslations(
    [
      "videos.home",
      "videos.title",
      "videos.all",
      "videos.all_videos",
      "videos.description",
      "general.video",
      "general.videos",
      `language.${language.code}`,
    ],
    locale
  );

  // ==================================================
  // 4. Resolve category path
  // ==================================================

  let category: Category | null = null;
  let parentId: string | null = null;

  let categoryFound = true;

  for (const segment of categorySlug) {
    let query = supabase
      .from("categories")
      .select(
        "id, slug, parent_id, level, display_order"
      )
      .eq("slug", segment)
      .eq("is_active", true);

    if (parentId === null) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", parentId);
    }

    const {
      data,
      error,
    } = await query.maybeSingle();

    if (error || !data) {
      categoryFound = false;
      break;
    }

    category = data;
    parentId = data.id;
  }

  if (
    categorySlug.length > 0 &&
    !categoryFound
  ) {
    return null;
  }

  // ==================================================
  // 5. Current category / language name
  // ==================================================

  let currentCategoryName =
    translations[`language.${language.code}`] ??
    language.name;

  if (category) {
    const categoryLabels =
      await getCategoryLabels(
        [category.id],
        locale,
        false
      );

    currentCategoryName =
      categoryLabels[category.id] ??
      formatText(category.slug);
  }

  // ==================================================
  // 6. Category pills
  //
  // /videos/en
  //     All + top-level categories
  //
  // /videos/en/business
  //     All + Business children
  // ==================================================

  let categoryPills: {
    id: string;
    slug: string;
    name: string;
    href?: string;
  }[] = [];

  // --------------------------------------------------
  // Language-only page
  //
  // /videos/en
  // --------------------------------------------------

  if (!category) {
    const {
      data: rootCategories,
      error: rootCategoriesError,
    } = await supabase
      .from("categories")
      .select(
        "id, slug, display_order"
      )
      .is("parent_id", null)
      .eq("is_active", true)
      .order("display_order");

    if (rootCategoriesError) {
      console.error(
        "Root category lookup error:",
        rootCategoriesError
      );
    }

    const rootCategoryIds =
      (rootCategories ?? []).map(
        (item) => item.id
      );

    const rootLabels =
      rootCategoryIds.length > 0
        ? await getCategoryLabels(
            rootCategoryIds,
            locale,
            false
          )
        : {};

    categoryPills = [
      {
        id: "all",
        slug: "",
        name:
          translations["videos.all"] ??
          "All",
        href: `/videos/${languageCode}`,
      },
      ...(rootCategories ?? []).map(
        (item) => ({
          id: item.id,
          slug: item.slug,
          name:
            rootLabels[item.id] ??
            formatText(item.slug),
          href:
            `/videos/${languageCode}/${item.slug}`,
        })
      ),
    ];
  }

  // --------------------------------------------------
  // Category page
  //
  // /videos/en/business
  // /videos/en/business/marketing
  // --------------------------------------------------

  if (category) {
    const {
      data: children,
      error: childrenError,
    } = await supabase
      .from("categories")
      .select(
        "id, slug, display_order"
      )
      .eq("parent_id", category.id)
      .eq("is_active", true)
      .order("display_order");

    if (childrenError) {
      console.error(
        "Category children error:",
        childrenError
      );
    }

    const childCategoryIds =
      (children ?? []).map(
        (child) => child.id
      );

    const childLabels =
      childCategoryIds.length > 0
        ? await getCategoryLabels(
            childCategoryIds,
            locale,
            false
          )
        : {};

    categoryPills = [
      {
        id: "all",
        slug: "",
        name:
          translations["videos.all"] ??
          "All",
        href: `/videos/${languageCode}/${category.slug}`,
      },
      ...(children ?? []).map(
        (child) => ({
          id: child.id,
          slug: child.slug,
          name:
            childLabels[child.id] ??
            formatText(child.slug),
          href:
            `/videos/${languageCode}/${category.slug}/${child.slug}`,
        })
      ),
    ];
  }

    // ==================================================
  // 7. Find category + descendants
  // ==================================================

  const categoryIds = new Set<string>();

  if (category) {
    categoryIds.add(category.id);

    let currentIds = [category.id];

    while (currentIds.length > 0) {
      const {
        data: descendants,
        error: descendantsError,
      } = await supabase
        .from("categories")
        .select("id")
        .in("parent_id", currentIds)
        .eq("is_active", true);

      if (descendantsError) {
        console.error(
          "Category descendants error:",
          descendantsError
        );

        break;
      }

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
  }

  // ==================================================
  // 8. Fetch videos
  // ==================================================

  let videos: any[] = [];

  let videosQuery = supabase
    .from("videos")
    .select(
      `
        id,
        slug,
        title,
        thumbnail_url,
        level,
        access_type,
        view_count,
        created_at,
        published_at,
        category_id,
        language_code,

        channels (
          id,
          channel_name,
          slug,
          logo_url,
          user_id,

          profiles (
            id,
            is_creator
          )
        ),

        categories (
          id,
          slug,
          parent_id,
          level
        )
      `
    )
    .eq("language_code", languageCode)
    .eq("status", "published");

  // Only filter by category when the URL
  // actually contains a category.
  //
  // /videos/es
  // → all published Spanish videos
  //
  // /videos/es/specific-topics
  // → specific-topics + descendants
  if (categoryIds.size > 0) {
    videosQuery = videosQuery.in(
      "category_id",
      Array.from(categoryIds)
    );
  }

  const {
    data,
    error: videosError,
  } = await videosQuery.order(
    "published_at",
    {
      ascending: false,
      nullsFirst: false,
    }
  );

  if (videosError) {
    console.error(
      "Category videos error:",
      videosError
    );
  }

  videos = data ?? [];

  // ==================================================
  // 9. Build translated video labels
  //
  // Video card should show:
  //
  // Spanish - Storytelling/Jokes
  //
  // NOT:
  //
  // Spanish - Specific Topics - Storytelling/Jokes
  // ==================================================

  let formattedVideos = videos;

  // --------------------------------------------------
  // Language labels
  // --------------------------------------------------

  const browseLanguages =
    await getBrowseLanguages(locale);

  const languageLabels: Record<
    string,
    string
  > = Object.fromEntries(
    browseLanguages.map(
      (item) => [
        item.code,
        item.name,
      ]
    )
  );

  // --------------------------------------------------
  // Category labels
  // --------------------------------------------------

  const videoCategoryIds = [
    ...new Set(
      formattedVideos
        .map(
          (video) =>
            video.category_id
        )
        .filter(
          (id): id is string =>
            Boolean(id)
        )
    ),
  ];

  let categoryLabels: Record<
    string,
    string
  > = {};

  if (
    videoCategoryIds.length > 0
  ) {
    categoryLabels =
      await getCategoryLabels(
        videoCategoryIds,
        locale,
        false
      );
  }

  // --------------------------------------------------
  // Add labels to videos
  // --------------------------------------------------

  formattedVideos =
    formattedVideos.map(
      (video) => ({
        ...video,

        language_label:
          languageLabels[
            video.language_code
          ] ??
          video.language_code ??
          "",

        category_label:
          video.category_id
            ? categoryLabels[
                video.category_id
              ] ??
              formatText(
                video.categories?.[0]
                  ?.slug
              )
            : "",
      })
    );

  // ==================================================
  // 10. Breadcrumb
  // ==================================================

  const breadcrumbCategories =
    categorySlug;

  const translatedLanguageName =
    translations[
      `language.${language.code}`
    ] ?? language.name;

  // ==================================================
  // 11. Render
  // ==================================================

  return (
    <div className="px-6 py-6">
      <div className="mx-auto mb-6 max-w-7xl">
        <nav
          className="
            mb-2
            flex
            flex-wrap
            items-center
            gap-2
            text-sm
            text-muted-foreground
          "
        >
          <Link
            href="/"
            className="
              transition
              hover:text-foreground
            "
          >
            {translations["videos.home"] ??
              "Home"}
          </Link>

          <span>/</span>

          <Link
            href="/videos"
            className="
              transition
              hover:text-foreground
            "
          >
            {translations["videos.title"] ??
              "Videos"}
          </Link>

          <span>/</span>

          <Link
            href={`/videos/${languageCode}`}
            className={`
              transition
              hover:text-foreground
              ${
                !category
                  ? "font-medium text-foreground"
                  : ""
              }
            `}
          >
            {translatedLanguageName}
          </Link>

          {breadcrumbCategories.map(
            (part, index) => {
              const href =
                `/videos/${languageCode}/` +
                breadcrumbCategories
                  .slice(
                    0,
                    index + 1
                  )
                  .join("/");

              const isCurrent =
                index ===
                breadcrumbCategories.length -
                  1;

              return (
                <div
                  key={href}
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span>/</span>

                  {isCurrent ? (
                    <span
                      className="
                        font-medium
                        text-foreground
                      "
                    >
                      {currentCategoryName}
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className="
                        transition
                        hover:text-foreground
                      "
                    >
                      {formatText(
                        part
                      )}
                    </Link>
                  )}
                </div>
              );
            }
          )}
        </nav>

        <h1
          className="
            text-4xl
            font-bold
            text-foreground
          "
        >
          {currentCategoryName}
        </h1>
      </div>

      <CategoryPills
        languages={[]}
        selectedLanguage={undefined}
        categories={categoryPills}
        selectedCategory="all"
        basePath={`/videos/${languageCode}`}
      />

      <div
        className="
          mx-auto
          max-w-7xl
          px-6
          py-4
        "
      >
        <p className="text-sm font-medium text-muted-foreground">
          {formattedVideos.length}{" "}
          {formattedVideos.length === 1
            ? translations["general.video"] ??
              "Video"
            : translations["general.videos"] ??
              "Videos"}
        </p>
      </div>

      <VideoSection
        showViewAll={false}
        videos={formattedVideos}
        locale={locale}
      />
    </div>
  );
}

function formatText(
  value?: string | null
) {
  if (!value) return "";

  return value
    .replace(
      /[-_]/g,
      " "
    )
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}