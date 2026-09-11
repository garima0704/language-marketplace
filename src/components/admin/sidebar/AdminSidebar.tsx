"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  UserCheck,
  Tv,
  Video,
  FolderTree,
  Languages,
  LanguagesIcon,
  CreditCard,
  DollarSign,
  Wallet,
  BarChart3,
  Flag,
  Settings,
  Globe,
  ExternalLink,
} from "lucide-react";

import { adminMenu } from "./admin-menu";

const icons = {
  LayoutDashboard,
  Users,
  UserCheck,
  Tv,
  Video,
  FolderTree,
  Languages,
  LanguagesIcon,
  CreditCard,
  DollarSign,
  Wallet,
  BarChart3,
  Flag,
  Settings,
  Globe,
} as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        fixed
        top-24
        left-0
        z-40
        h-[calc(100vh-96px)]
        w-56
        overflow-y-auto
        bg-background
      "
    >
      <div className="px-3 py-6">
        <div className="space-y-6">
          {adminMenu.map((section) => (
            <div key={"title" in section ? section.title : "main"}>
              {"title" in section && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = icons[item.icon];

                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-3
                        rounded-lg
                        px-3 py-2.5
                        text-sm font-medium
                        transition-colors
                        ${
                          isActive
                            ? "bg-primary text-white"
                            : "text-secondary hover:bg-muted-bg hover:text-foreground"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="
            flex items-center gap-3
            rounded-lg
            px-3 py-2.5
            text-sm font-medium
            text-secondary
            transition-colors
            hover:bg-muted-bg
            hover:text-foreground
          "
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          <span>View Website</span>
        </Link>
      </div>
    </aside>
  );
}