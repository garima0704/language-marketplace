import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import { getCategoryLabel } from "@/lib/categories";
import { getTranslations } from "@/lib/translations";
import { getBrowseLanguages } from "@/lib/languages";

import VideoSection from "@/components/VideoSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
  // TRANSLATIONS
  // --------------------------------------------------

  const translations = await getTranslations(
    [
      "seller_videos.title",
      "seller_videos.description",
      "seller_videos.upload_video",
      "seller_videos.search_placeholder",
      "seller_videos.no_videos",
      "seller_videos.no_videos_description",
    ],
    locale
  );

  // --------------------------------------------------
  // Browse languages
  // --------------------------------------------------

  const languages = await getBrowseLanguages(locale);

  function getLanguageLabel(
    languageCode: string | null
  ) {
    if (!languageCode) return undefined;

    const language = languages.find(
      (item) => item.code === languageCode
    );

    return language?.name ?? languageCode;
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

    const categoryLabelMap = new Map<
      string,
      string | undefined
    >();

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

      for (const [categoryId, label] of categoryLabels) {
        categoryLabelMap.set(
          categoryId,
          label
        );
      }
    }

    // ------------------------------------------------
    // Add translated language + category labels
    // ------------------------------------------------

    videos = videos.map((video) => ({
      ...video,

      language_label:
        getLanguageLabel(
          video.language_code
        ),

      category_label:
        video.category_id
          ? categoryLabelMap.get(
              video.category_id
            ) ?? ""
          : "",
    }));
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="space-y-6 px-6 py-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {translations["seller_videos.title"] ??
              "My Videos"}
          </h1>

          <p className="mt-2 text-muted-foreground">
            {translations["seller_videos.description"] ??
              "Upload and manage your language learning videos."}
          </p>
        </div>

        <Link href="/seller/videos/new">
          <Button>
            {translations["seller_videos.upload_video"] ??
              "Upload Video"}
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Input
        placeholder={
          translations[
            "seller_videos.search_placeholder"
          ] ?? "Search videos..."
        }
        className="max-w-md"
      />

      {/* Videos / Empty State */}
      {videos.length === 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-full">
            <Card className="rounded-xl border-dashed">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-lg font-semibold">
                  {translations[
                    "seller_videos.no_videos"
                  ] ?? "No videos yet"}
                </h3>

                <p className="mt-2 text-muted-foreground">
                  {translations[
                    "seller_videos.no_videos_description"
                  ] ??
                    "Upload your first video to start sharing your language lessons."}
                </p>

                <div className="mt-6">
                  <Link href="/seller/videos/new">
                    <Button>
                      {translations[
                        "seller_videos.upload_video"
                      ] ?? "Upload Video"}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <VideoSection
          videos={videos}
          showViewAll={false}
          showStatus
          showManage
          showView
          compact
          locale={locale}
        />
      )}
    </div>
  );
}