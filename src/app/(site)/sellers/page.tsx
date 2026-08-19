import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function SellersPage() {
  const supabase = await createClient();

  const { data: sellers, error } = await supabase
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
    .order("display_name", { ascending: true });

  if (error) {
    console.error("Error fetching sellers:", error);
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Sellers
      </h1>

      <p className="mt-2 text-gray-500">
        Discover language teachers and creators sharing their knowledge.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sellers?.map((seller) => (
          <div
            key={seller.id}
            className="rounded-xl border border-border bg-background transition hover:shadow-md p-6"
          >
            <div className="flex items-center gap-4">
              {seller.avatar_url ? (
                <img
                  src={seller.avatar_url}
                  alt={seller.display_name}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-600">
                  {seller.display_name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900">
                  {seller.display_name}
                </h3>

                <p className="text-sm text-gray-500">
                  @{seller.username}
                </p>

                {seller.country && (
                  <p className="text-xs text-gray-400">
                    {seller.country}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-4 line-clamp-3 text-sm text-gray-600">
              {seller.bio || "No bio available."}
            </p>

            <Link href={`/sellers/${seller.username}`}>
              <Button className="mt-5">
                View Seller
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}