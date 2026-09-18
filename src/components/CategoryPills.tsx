import Link from "next/link";

interface CategoryPillsProps {
  languages?: {
    code: string;
    name: string;
  }[];

  selectedLanguage?: string;

  categories: {
    id: string;
    slug: string;
    name: string;
    href?: string;
  }[];

  selectedCategory?: string;
  basePath?: string;
}

export default function CategoryPills({
  languages = [],
  selectedLanguage,
  categories,
  selectedCategory,
  basePath = "/videos",
}: CategoryPillsProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-5">

        {/* Languages */}
        {languages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {languages.map((language) => {
              const isActive =
                selectedLanguage === language.code;

              return (
                <Link
                  key={language.code}
                  href={`/videos/${language.code}`}
                  className={`
                    whitespace-nowrap
                    rounded-full
                    px-5
                    py-2
                    text-sm
                    font-medium
                    transition
                    ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-muted-bg text-foreground hover:bg-secondary hover:text-white"
                    }
                  `}
                >
                  {language.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const isActive =
                selectedCategory === category.id;

              return (
                <Link
                  key={category.id}
                  href={
                    category.href ??
                    (category.id === "all"
                      ? basePath
                      : `${basePath}/${category.slug}`)
                  }
                  className={`
                    whitespace-nowrap
                    rounded-full
                    px-5
                    py-2
                    text-sm
                    font-medium
                    transition
                    ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-muted-bg text-foreground hover:bg-secondary hover:text-white"
                    }
                  `}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}