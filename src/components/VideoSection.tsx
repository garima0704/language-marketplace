import Link from "next/link";

interface Props {
  title?: string;
  showViewAll?: boolean;
}

export default function VideoSection({
  title,
  showViewAll = true,
}: Props) {
  const videos = Array.from({ length: 8 });

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">

      {title && (
        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-semibold text-[#082645]">
            {title}
          </h2>

          {showViewAll && (
            <Link
              href="#"
              className="text-sm font-medium text-[#082645] hover:text-[#52CCF5] transition"
            >
              View All
            </Link>
          )}

        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {videos.map((_, i) => (

          <div
            key={i}
            className="group cursor-pointer"
          >

            {/* Thumbnail */}
            <div
              className="
                aspect-video
                rounded-xl
                bg-white
                overflow-hidden
                group-hover:shadow-md
                transition
              "
            />

            {/* Details */}
            <div className="flex gap-3 mt-4">

              {/* Creator */}
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-[#52CCF5]
                  shrink-0
                "
              />

              <div className="min-w-0">

                <h3
                  className="
                    font-semibold
                    text-[#212427]
                    leading-5
                    line-clamp-2
                  "
                >
                  Learn Spanish While Ordering Coffee
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Spanish With Maria
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Beginner • ⭐ 4.8 • 12K views
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}