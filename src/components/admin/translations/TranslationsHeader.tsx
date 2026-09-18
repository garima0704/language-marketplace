import Link from "next/link";
import {
  CheckCircle,
  FileText,
  Languages,
  Plus,
} from "lucide-react";

type Props = {
  totalKeys: number;
  totalLanguages: number;
  completionPercentage: number;
};

export default function TranslationsHeader({
  totalKeys,
  totalLanguages,
  completionPercentage,
}: Props) {
  const stats = [
    {
      title: "Translation Text",
      value: totalKeys,
      icon: FileText,
    },
    {
      title: "Languages",
      value: totalLanguages,
      icon: Languages,
    },
    {
      title: "Completion",
      value: `${completionPercentage}%`,
      icon: CheckCircle,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Translations
          </h1>

          <p className="mt-2 text-secondary">
            Manage website text across supported languages.
          </p>
        </div>

        <Link
          href="/admin/translations/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Translation
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
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