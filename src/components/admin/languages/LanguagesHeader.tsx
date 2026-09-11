"use client";

import Link from "next/link";
import {
  Languages,
  CheckCircle2,
  MapPin,
  CircleOff,
  Plus,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Language = {
  code: string;
  name: string;
  is_default: boolean;
  is_active: boolean;
  display_order: number;
};

type Region = {
  id: string;
  language_code: string;
  country: string;
  state: string | null;
  sort_order: number;
};

interface LanguagesHeaderProps {
  languages: Language[];
  regions: Region[];
}

export default function LanguagesHeader({
  languages,
  regions,
}: LanguagesHeaderProps) {
  const router = useRouter();
  const totalLanguages = languages.length;

  const activeLanguages = languages.filter(
    (language) => language.is_active
  ).length;

  const inactiveLanguages = languages.filter(
    (language) => !language.is_active
  ).length;

  const totalRegions = regions.length;

  const stats = [
    {
      label: "Total Languages",
      value: totalLanguages,
      icon: Languages,
    },
    {
      label: "Active Languages",
      value: activeLanguages,
      icon: CheckCircle2,
    },
    {
      label: "Regions",
      value: totalRegions,
      icon: MapPin,
    },
    {
      label: "Inactive",
      value: inactiveLanguages,
      icon: CircleOff,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Languages & Regions
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage languages and regional variations across NiceConvo.
          </p>
        </div>

        <Button
          onClick={() => router.push("/admin/languages/new")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Language
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.label}
              className="rounded-xl border border-border bg-white p-5 shadow-none"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted-bg">
                  <Icon className="h-5 w-5 text-muted" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}