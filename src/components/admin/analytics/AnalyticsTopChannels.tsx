interface Channel {
  id: string;
  name: string;
  views: number;
}

export default function AnalyticsTopChannels({
  channels,
}: {
  channels: Channel[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-background">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight">
          Top channels
        </h2>

        <p className="mt-1 text-sm text-muted">
          Channels generating the most viewing activity.
        </p>
      </div>

      <div className="divide-y divide-border">
        {channels.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted">
            No channel activity found.
          </div>
        ) : (
          channels.map((channel, index) => (
            <div
              key={channel.id}
              className="flex items-center gap-4 px-6 py-4"
            >
              <span className="w-6 text-sm font-medium text-muted">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {channel.name}
                </p>
              </div>

              <p className="text-sm font-medium">
                {new Intl.NumberFormat("en-US").format(
                  channel.views
                )}
              </p>

              <span className="hidden text-xs text-muted sm:block">
                views
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}