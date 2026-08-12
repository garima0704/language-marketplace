
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  languages: {
    id: string;
    slug: string;
    category_translations: {
      name: string;
      locale_code: string;
    }[];
  }[];
};

export default function SidebarLanguages({
  languages,
}: Props) {
  const pathname = usePathname();

  const selectedLanguage =
    pathname.startsWith("/videos/")
      ? pathname.split("/")[2]
      : "";

  return (
    <div className="mb-8">
      <h3
        className="
          mb-3
          px-6
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-muted
        "
      >
        Explore Languages
      </h3>

      {languages.map((language) => {
        const isActive = selectedLanguage === language.slug;

        return (
          <Link
            key={language.id}
            href={`/videos/${language.slug}`}
            className={`
              mx-3
              my-1
              flex
              items-center
              rounded-lg
              px-4
              py-3
              text-sm
              transition-all
              duration-200
              ${
                isActive
                  ? "bg-primary font-semibold text-white shadow-sm"
                  : "text-secondary hover:bg-muted-bg hover:text-foreground"
              }
            `}
          >
            {language.category_translations[0]?.name}
          </Link>
        );
      })}
    </div>
  );
}