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

  // Current category
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

// TypeScript now knows category could be null, so check once.
if (!category) {
  notFound();
}

  // Current category name
  const { data: translation } = await supabase
    .from("category_translations")
    .select("name")
    .eq("category_id", category.id)
    .eq("locale_code", "en")
    .maybeSingle();


  // Child categories
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
      name: child.category_translations[0]?.name,
    }))
  ];


  return (
    <div className="px-6 py-6">

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
            const href = "/videos/" + slug.slice(0, index + 1).join("/");
            const isCurrent = index === slug.length - 1;

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

      <CategoryBar
        categories={pills}
        selectedCategory="all"
        basePath={`/videos/${slug.join("/")}`}
      />

      <div className="mx-auto max-w-7xl px-6 py-4">
        <p className="text-sm font-medium text-gray-600">
          0 Videos
        </p>
      </div>

      <VideoSection showViewAll={false} />

    </div>
  );
}