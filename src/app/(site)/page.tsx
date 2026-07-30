import CategoryBar from "@/components/CategoryBar";
import CreatorSection from "@/components/CreatorSection";
import VideoSection from "@/components/VideoSection";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: languages, error } = await supabase
    .from("categories")
    .select(`
      id,
      slug,
      category_translations(
        name,
        locale_code
      )
    `)
    .is("parent_id", null)
    .eq("level", 1)
    .eq("is_active", true)
    .order("display_order");


  const languagePills = (languages ?? []).map((language) => ({
    id: language.id,
    slug: language.slug,
    name: language.category_translations[0]?.name ?? language.slug,
  }));


  console.log("languages:", languagePills);
  console.log("error:", error);


  return (
    <div className="px-6 py-6">

      <CategoryBar 
        categories={languagePills}
        basePath="/categories"
      />

      <VideoSection title="Trending Videos" />

      <CreatorSection />

      <VideoSection title="Latest Videos" />

      <Footer />

    </div>
  );
}