export default function CreatorSection() {

  const creators = Array.from({ length: 6 });

  return (
    <section className="bg-[#F5F7F8] py-10">

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-2xl font-semibold text-[#082645]">
            Popular Creators
          </h2>

          <button className="text-sm font-medium text-[#082645] hover:text-[#52CCF5] transition">
            View All
          </button>

        </div>


        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">

          {creators.map((_, i) => (

            <div
              key={i}
              className="
                text-center
                cursor-pointer
                group
              "
            >

              {/* Creator Image */}
              <div
                className="
                  w-24
                  h-24
                  rounded-full
                  bg-[#DDF2EC]
                  mx-auto
                  group-hover:ring-4
                  group-hover:ring-[#52CCF5]/30
                  transition
                "
              />


              <h3
                className="
                  mt-4
                  font-semibold
                  text-[#212427]
                "
              >
                Creator Name
              </h3>


              <p className="text-sm text-gray-500 mt-1">
                240 Videos
              </p>


            </div>

          ))}

        </div>

      </div>

    </section>
  );
}