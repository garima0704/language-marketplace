import { createClient } from "@/lib/supabase/server";
import SidebarSection from "./SidebarSection";
import SidebarLanguages from "./SidebarLanguages";

import { guestMenu } from "./guest-menu";
import { learnerMenu } from "./learner-menu";
import { creatorMenu } from "./creator-menu";

export default async function Sidebar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loggedIn = !!user;

  let isCreator = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_creator")
      .eq("id", user.id)
      .single();

    isCreator = profile?.is_creator ?? false;
  }

  const { data: languages } = await supabase
  .from("categories")
  .select(`
    id,
    slug,
    display_order,
    category_translations!inner(
      name,
      locale_code
    )
  `)
  .is("parent_id", null)
  .eq("level", 1)
  .eq("is_active", true)
  .eq("category_translations.locale_code", "en")
  .order("display_order");

  return (
  <aside
    className="
      fixed
      top-24
      left-0
      w-56
      h-[calc(100vh-96px)]
      overflow-y-auto
      bg-white
      z-40
    "
  >
    <div className="py-6">

      {!loggedIn && (
        <>
          <SidebarSection sections={guestMenu} />
          <SidebarLanguages languages={languages ?? []} />
        </>
      )}

      {loggedIn && !isCreator && (
        <>
          <SidebarSection sections={learnerMenu} />
          <SidebarLanguages languages={languages ?? []} />
        </>
      )}

      {loggedIn && isCreator && (
        <>
          <SidebarSection sections={creatorMenu} />
          <SidebarLanguages languages={languages ?? []} />
        </>
      )}

    </div>
  </aside>
);
}