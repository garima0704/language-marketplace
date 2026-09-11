interface AnalyticsHeaderProps {
  startDate: Date;
  endDate: Date;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function AnalyticsHeader({
  startDate,
  endDate,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Analytics
        </h1>

        <p className="mt-2 text-sm text-muted">
          Understand how NiceConvo is growing and performing.
        </p>
      </div>

      <div className="text-sm text-muted">
        {formatDate(startDate)} — {formatDate(endDate)}
      </div>
    </div>
  );
}