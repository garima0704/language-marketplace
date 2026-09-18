import Link from "next/link";
import {
  CheckCircle2,
  CircleOff,
  Languages,
  MapPin,
  Plus,
} from "lucide-react";

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
      title: "Total Languages",
      value: totalLanguages,
      icon: Languages,
    },
    {
      title: "Active Languages",
      value: activeLanguages,
      icon: CheckCircle2,
    },
    {
      title: "Regions",
      value: totalRegions,
      icon: MapPin,
    },
    {
      title: "Inactive",
      value: inactiveLanguages,
      icon: CircleOff,
    },
  ];

  return (
    <>
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Languages & Regions
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage languages and regional variations across NiceConvo.
          </p>
        </div>

        <Link
          href="/admin/languages/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Language
        </Link>
      </div>

      {/* Stats */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-border bg-background p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">
                    {stat.title}
                  </p>

                  <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted-bg">
                  <Icon className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}