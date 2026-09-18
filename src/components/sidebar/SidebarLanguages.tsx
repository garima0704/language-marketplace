"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Language = {
  code: string;
  display_order: number;
  name: string;
};

type Props = {
  languages?: Language[];
  title: string;
};

export default function SidebarLanguages({
  languages = [],
  title,
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
        {title}
      </h3>

      {languages.map((language) => {
        const isActive =
          selectedLanguage === language.code;

        return (
          <Link
            key={language.code}
            href={`/videos/${language.code}`}
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
            {language.name}
          </Link>
        );
      })}
    </div>
  );
}