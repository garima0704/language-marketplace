interface BreakdownItem {
  name: string;
  value: number;
}

interface AnalyticsBreakdownProps {
  grossRevenue: number;
  platformRevenue: number;
  creatorEarnings: number;
  data: BreakdownItem[];
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AnalyticsBreakdown({
  grossRevenue,
  platformRevenue,
  creatorEarnings,
  data,
}: AnalyticsBreakdownProps) {
  const platformPercent =
    grossRevenue > 0
      ? Math.min(
          (platformRevenue / grossRevenue) * 100,
          100
        )
      : 0;

  const creatorPercent =
    grossRevenue > 0
      ? Math.min(
          (creatorEarnings / grossRevenue) * 100,
          100
        )
      : 0;

  return (
    <section className="rounded-2xl border border-border bg-background p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Revenue breakdown
          </h2>

          <p className="mt-1 text-sm text-muted">
            How gross revenue is distributed between NiceConvo and creators.
          </p>
        </div>

        <p className="text-2xl font-semibold tracking-tight">
          {money(grossRevenue)}
        </p>
      </div>

      <div className="mt-8 h-3 overflow-hidden rounded-full bg-muted-bg">
        <div className="flex h-full">
          <div
            className="bg-foreground"
            style={{
              width: `${platformPercent}%`,
            }}
          />

          <div
            className="bg-foreground/20"
            style={{
              width: `${creatorPercent}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {data.map((item, index) => {
          const percent =
            grossRevenue > 0
              ? (item.value / grossRevenue) * 100
              : 0;

          return (
            <div key={item.name}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {item.name}
                </p>

                <p className="text-sm text-muted">
                  {percent.toFixed(1)}%
                </p>
              </div>

              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {money(item.value)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}