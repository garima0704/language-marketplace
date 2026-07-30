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
  pathname.startsWith("/categories/")
    ? pathname.split("/")[2]
    : "";

  return (
    <div className="mb-8">
      <h3
        className="
          px-6
          mb-3
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-gray-400
        "
      >
        Explore Languages
      </h3>

      {languages.map((language) => {
        const isActive = selectedLanguage === language.slug;

        return (
          <Link
            key={language.id}
            href={`/categories/${language.slug}`}
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
                  ? "bg-primary text-[#082645] font-semibold shadow-sm"
                  : "text-[#444444] hover:bg-secondary hover:text-white"
              }
            `}
          >
            {language.category_translations[0].name}
          </Link>
        );
      })}
    </div>
  );
}