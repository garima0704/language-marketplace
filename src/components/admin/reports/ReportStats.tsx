import {
  Flag,
  CheckCircle,
  Eye,
  Trash2,
} from "lucide-react";

interface ReportStatsProps {
  stats: {
    total: number;
    pending: number;
    reviewed: number;
    dismissed: number;
    removed: number;
  };
}

const cards = [
  {
    label: "Total Reports",
    key: "total",
    icon: Flag,
  },
  {
    label: "Pending",
    key: "pending",
    icon: Eye,
  },
  {
    label: "Reviewed",
    key: "reviewed",
    icon: CheckCircle,
  },
  {
    label: "Removed",
    key: "removed",
    icon: Trash2,
  },
] as const;

export default function ReportStats({
  stats,
}: ReportStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className="rounded-xl border border-border bg-background p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">
                  {card.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-foreground">
                  {stats[card.key]}
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
  );
}