import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import PagesHeader from "@/components/admin/pages/PagesHeader";
import PageList from "@/components/admin/pages/PageList";

export default async function PagesPage() {
  await requireAdmin();

  const supabase = await createClient();

  const {
    data: pages,
    error,
  } = await supabase
    .from("site_pages")
    .select(`
      id,
      slug,
      title,
      content,
      page_data,
      locale_code,
      is_published,
      created_at,
      updated_at
    `)
    .order("title", { ascending: true });

  if (error) {
    console.error("PAGES FETCH ERROR:", error);

    throw new Error(
      error.message || "Failed to load website pages."
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PagesHeader pages={pages ?? []} />

        <div className="mt-6">
          <PageList pages={pages ?? []} />
        </div>
      </div>
    </div>
  );
}