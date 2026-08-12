import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

type PopularCreator = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  video_count: number;
};

export default async function CreatorSection() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_popular_creators"
  );

  if (error) {
    console.error("POPULAR CREATORS ERROR:", error);
  }

  const creators = (data ?? []) as PopularCreator[];

  return (
    <section className="bg-muted-bg py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">
            Popular Sellers
          </h2>

          <Link
            href="/sellers"
            className="text-sm font-medium text-foreground transition hover:text-secondary"
          >
            View All
          </Link>
        </div>

         {creators.length === 0 ? (
          <p className="text-sm text-muted">
            No sellers available yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {creators.map((creator) => (
              <Link
                key={creator.id}
                href={`/creators/${creator.username}`}
                className="group text-center"
              >
                {/* Creator Avatar */}
                <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-background ring-1 ring-border transition group-hover:ring-4 group-hover:ring-muted">
                  {creator.avatar_url ? (
                    <img
                      src={creator.avatar_url}
                      alt={creator.display_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-foreground">
                      {creator.display_name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Creator Name */}
                <h3 className="mt-4 truncate font-semibold text-foreground">
                  {creator.display_name}
                </h3>

                {/* Published Videos */}
                <p className="mt-1 text-sm text-muted">
                  {creator.video_count}{" "}
                  {creator.video_count === 1
                    ? "Video"
                    : "Videos"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}