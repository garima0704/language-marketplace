import Link from "next/link";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/translations";

import { Button } from "@/components/ui/button";

export default async function SellersPage() {
  const supabase = await createClient();

  // ================================================
  // Current UI language
  // ================================================

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  // ================================================
  // Translations
  // ================================================

  const translations = await getTranslations(
    [
      "sellers.title",
      "sellers.description",
      "sellers.no_bio",
      "sellers.view_seller",
    ],
    locale
  );

  // ================================================
  // Fetch sellers
  // ================================================

  const {
    data: sellers,
    error,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      bio,
      country
    `)
    .eq("is_creator", true)
    .order("display_name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error fetching sellers:",
      error
    );
  }

  // ================================================
  // Render
  // ================================================

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground">
        {translations["sellers.title"] ??
          "Sellers"}
      </h1>

      <p className="mt-2 text-muted-foreground">
        {translations["sellers.description"] ??
          "Discover language teachers and creators sharing their knowledge."}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sellers?.map((seller) => (
          <div
            key={seller.id}
            className="
              rounded-xl
              border
              border-border
              bg-background
              p-6
              transition
              hover:shadow-md
            "
          >
            <div className="flex items-center gap-4">
              {seller.avatar_url ? (
                <img
                  src={seller.avatar_url}
                  alt={seller.display_name}
                  className="
                    h-14
                    w-14
                    rounded-full
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-muted-bg
                    font-semibold
                    text-muted
                  "
                >
                  {seller.display_name
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-foreground">
                  {seller.display_name}
                </h3>

                <p className="text-sm text-muted-foreground">
                  @{seller.username}
                </p>

                {seller.country && (
                  <p className="text-xs text-muted">
                    {seller.country}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
              {seller.bio ||
                (translations["sellers.no_bio"] ??
                  "No bio available.")}
            </p>

            <Link
              href={`/sellers/${seller.username}`}
              className="block"
            >
              <Button className="mt-6 w-full rounded-lg">
                {translations["sellers.view_seller"] ?? "View Seller"}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}