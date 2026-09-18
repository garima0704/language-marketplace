import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import {
  getTranslation,
  getTranslations,
} from "@/lib/translations";

import { getBrowseLanguages } from "@/lib/languages";

import SidebarSection from "./SidebarSection";
import SidebarLanguages from "./SidebarLanguages";

import { guestMenu } from "./guest-menu";
import { learnerMenu } from "./learner-menu";
import { creatorMenu } from "./creator-menu";

type MenuChild = {
  readonly href: string;
  readonly label: string;
};

type MenuItem = {
  readonly href: string;
  readonly label: string;
  readonly icon: string;
  readonly children?: readonly MenuChild[];
};

type MenuSection = {
  readonly title: string;
  readonly items: readonly MenuItem[];
};

function collectMenuTranslationKeys(
  menu: readonly MenuSection[]
): string[] {
  return menu
    .flatMap((section) => [
      section.title,
      ...section.items.flatMap((item) => [
        item.label,
        ...(item.children?.map(
          (child) => child.label
        ) ?? []),
      ]),
    ])
    .filter(
      (key): key is string => Boolean(key)
    );
}

export default async function Sidebar() {
  const supabase = await createClient();

  const cookieStore = await cookies();

  /*
   * This is the language selected from the
   * language dropdown.
   *
   * It controls UI translations only.
   */
  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

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

  /*
   * Sidebar title
   */
  const exploreLanguagesLabel =
    await getTranslation(
      "sidebar.explore_languages",
      locale
    );

  /*
   * Get ALL active browse languages.
   *
   * The selected UI language only changes
   * the language names. It does NOT filter
   * the available browse languages.
   */
  const translatedLanguages =
    await getBrowseLanguages(locale);

  /*
   * Load sidebar menu translations.
   */
  const menuTranslationKeys = [
    ...collectMenuTranslationKeys(
      guestMenu as readonly MenuSection[]
    ),
    ...collectMenuTranslationKeys(
      learnerMenu as readonly MenuSection[]
    ),
    ...collectMenuTranslationKeys(
      creatorMenu as readonly MenuSection[]
    ),
  ];

  const sidebarTranslations =
    await getTranslations(
      [
        ...new Set(
          menuTranslationKeys
        ),
      ],
      locale
    );

  return (
    <aside
      className="
        fixed
        top-24
        left-0
        z-40
        h-[calc(100vh-96px)]
        w-56
        overflow-y-auto
        bg-background
      "
    >
      <div className="py-6">
        {!loggedIn && (
          <>
            <SidebarSection
              sections={guestMenu}
              translations={
                sidebarTranslations
              }
            />

            <SidebarLanguages
              languages={
                translatedLanguages
              }
              title={
                exploreLanguagesLabel
              }
            />
          </>
        )}

        {loggedIn && !isCreator && (
          <>
            <SidebarSection
              sections={learnerMenu}
              translations={
                sidebarTranslations
              }
            />

            <SidebarLanguages
              languages={
                translatedLanguages
              }
              title={
                exploreLanguagesLabel
              }
            />
          </>
        )}

        {loggedIn && isCreator && (
          <>
            <SidebarSection
              sections={creatorMenu}
              translations={
                sidebarTranslations
              }
            />

            <SidebarLanguages
              languages={
                translatedLanguages
              }
              title={
                exploreLanguagesLabel
              }
            />
          </>
        )}
      </div>
    </aside>
  );
}