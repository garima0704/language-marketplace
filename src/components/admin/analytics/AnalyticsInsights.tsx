import { ArrowUpRight, Lightbulb } from "lucide-react";

interface Insight {
  title: string;
  description: string;
}

export default function AnalyticsInsights({
  insights,
}: {
  insights: Insight[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-background p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted-bg">
          <Lightbulb className="h-4 w-4 text-muted" />
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            What stands out
          </h2>

          <p className="mt-1 text-sm text-muted">
            A quick interpretation of the selected period.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {insights.length === 0 ? (
          <p className="text-sm text-muted">
            Not enough activity to generate insights yet.
          </p>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.title}
              className="rounded-xl bg-muted-bg/60 p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold">
                  {insight.title}
                </h3>

                <ArrowUpRight className="h-4 w-4 text-muted" />
              </div>

              <p className="mt-2 text-sm leading-6 text-muted">
                {insight.description}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}