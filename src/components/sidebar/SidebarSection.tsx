"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

import {
  Home,
  Search,
  Mic,
  User,
  Settings,
  CreditCard,
  Bookmark,
  History,
  Video,
  Users,
  DollarSign,
  BarChart3,
  PlusCircle,
  LayoutDashboard,
  Tv,
} from "lucide-react";

const icons = {
  Home,
  Search,
  Mic,
  User,
  Settings,
  CreditCard,
  Bookmark,
  History,
  Video,
  Users,
  DollarSign,
  BarChart3,
  PlusCircle,
  LayoutDashboard,
  Tv,
};

type MenuSection = {
  readonly title: string;
  readonly items: readonly {
    readonly href: string;
    readonly label: string;
    readonly icon: keyof typeof icons;
  }[];
};

type SidebarSectionProps = {
  readonly sections: readonly MenuSection[];
};

export default function SidebarSection({
  sections,
}: SidebarSectionProps) {
  const pathname = usePathname();

  return (
    <>
      {sections.map((section) => (
        <div key={section.title} className="mb-8">
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
            {section.title}
          </h3>

          {section.items.map((item) => {
            const Icon = icons[item.icon];

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/videos"
                  ? pathname === "/videos"
                  : pathname.startsWith(item.href);   

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  mx-3
                  my-1
                  flex
                  items-center
                  gap-3
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
                <Icon size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}