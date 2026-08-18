"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  Receipt,
  Wallet,
  ChevronDown,
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
  Receipt,
  Wallet,
};

type MenuItem = {
  readonly href: string;
  readonly label: string;
  readonly icon: keyof typeof icons;
  readonly children?: readonly {
    readonly href: string;
    readonly label: string;
  }[];
};

type MenuSection = {
  readonly title: string;
  readonly items: readonly MenuItem[];
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
          {/* Section title */}
          {section.title && (
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
              {section.title}
            </h3>
          )}

          {section.items.map((item) => {
            const Icon = icons[item.icon];

            // ------------------------------------------
            // Parent active state
            // ------------------------------------------

            const hasActiveChild =
              item.children?.some(
                (child) => pathname === child.href
              ) ?? false;

            const isParentActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/videos"
                  ? pathname === "/videos"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

            const isActive =
              hasActiveChild || isParentActive;

            return (
              <div key={item.href}>
                {/* --------------------------------------
                    Main menu item
                -------------------------------------- */}

                <Link
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
                        ? "bg-primary text-white font-semibold shadow-sm"
                        : "text-foreground hover:bg-muted-bg hover:text-primary"
                    }
                  `}
                >
                  <Icon size={19} />

                  <span className="flex-1">
                    {item.label}
                  </span>

                  {/* Show arrow only when children exist */}
                  {item.children &&
                    item.children.length > 0 && (
                      <ChevronDown
                        size={16}
                        className={`
                          transition-transform
                          ${
                            isActive
                              ? "rotate-0"
                              : "-rotate-90"
                          }
                        `}
                      />
                    )}
                </Link>

                {/* --------------------------------------
                    Submenu
                -------------------------------------- */}

                {item.children &&
                  item.children.length > 0 &&
                  isActive && (
                    <div className="ml-9 mr-3 mt-1 space-y-1 border-l border-border pl-3">
                      {item.children.map(
                        (child) => {
                          const childActive =
                            pathname === child.href;

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`
                                block
                                rounded-md
                                px-3
                                py-2
                                text-sm
                                transition
                                ${
                                  childActive
                                    ? "bg-muted-bg font-medium text-primary"
                                    : "text-muted hover:bg-muted-bg hover:text-foreground"
                                }
                              `}
                            >
                              {child.label}
                            </Link>
                          );
                        }
                      )}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}