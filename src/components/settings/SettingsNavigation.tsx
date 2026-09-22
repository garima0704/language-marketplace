"use client";

import { ChevronRight } from "lucide-react";
import type { Section, SettingItem } from "./types";

type SettingsNavigationProps = {
  sections: {
    title: string;
    items: SettingItem[];
  }[];
  activeSection: Section;
  onSectionChange: (section: Section) => void;
};

export default function SettingsNavigation({
  sections,
  activeSection,
  onSectionChange,
}: SettingsNavigationProps) {
  return (
    <aside className="border-b border-border p-4 md:border-b-0 md:border-r">
      <nav className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>

            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSectionChange(item.id)}
                    className={[
                      "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                      isActive
                        ? "bg-muted-bg text-foreground"
                        : "text-muted-foreground hover:bg-muted-bg hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4 shrink-0" />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {item.title}
                      </span>
                    </span>

                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}