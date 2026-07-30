import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import CategoryBar from "@/components/CategoryBar";
import VideoSection from "@/components/VideoSection";
import Footer from "@/components/Footer";

export default async function VideosPage() {
  const supabase = await createClient();

  // Top-level language categories
  const { data: languages } = await supabase
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
    .is("parent_id", null)
    .eq("is_active", true)
    .eq("category_translations.locale_code", "en")
    .order("display_order");

  const pills = [
    {
      id: "all",
      slug: "videos",
      name: "All",
    },

    ...(languages ?? []).map((language: any) => ({
      id: language.id,
      slug: language.slug,
      name: language.category_translations[0]?.name,
    })),
  ];

  return (
    <div className="px-6 py-6">
      <div className="mx-auto mb-6 max-w-7xl">
        <nav className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/"
            className="transition hover:text-primary"
          >
            Home
          </Link>

          <span>/</span>

          <span className="font-medium text-foreground">
            Videos
          </span>
        </nav>

        <h1 className="text-4xl font-bold text-[#082645]">
          All Videos
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover language videos from creators around the world.
        </p>
      </div>

      <CategoryBar
        categories={pills}
        selectedCategory="all"
        basePath="/videos"
      />

      <div className="mx-auto max-w-7xl px-6 py-4">
        <p className="text-sm font-medium text-gray-600">
          All Videos
        </p>
      </div>

      <VideoSection showViewAll={false} />

      <Footer />
    </div>
  );
}