import Link from "next/link";

interface CategoryPillsProps {
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
  categories,
  selectedCategory,
  basePath = "/categories",
}: CategoryPillsProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-6 py-5">

        {categories.map((category) => {

          const name = category.name;

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
                whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition
                ${
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-muted-bg text-foreground hover:bg-secondary hover:text-white"
                }
              `}
            >
              {name}
            </Link>
          );

        })}

      </div>
    </section>
  );
}