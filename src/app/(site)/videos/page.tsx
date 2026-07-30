export default function VideosPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#082645]">
        Browse Videos
      </h1>

      <p className="mt-2 text-gray-500">
        Discover language videos from sellers around the world.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Video cards will come here */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="h-40 rounded-lg bg-gray-100" />

          <h3 className="mt-4 font-semibold">
            Sample Language Video
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            English • Beginner
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="h-40 rounded-lg bg-gray-100" />

          <h3 className="mt-4 font-semibold">
            Learn Spanish Conversation
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Spanish • Intermediate
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="h-40 rounded-lg bg-gray-100" />

          <h3 className="mt-4 font-semibold">
            Arabic Speaking Practice
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Arabic • Advanced
          </p>
        </div>
      </div>
    </div>
  );
}