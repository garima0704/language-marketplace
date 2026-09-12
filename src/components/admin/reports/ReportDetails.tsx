import Link from "next/link";
import Image from "next/image";

import VideoCard from "@/components/VideoCard";
import ReportStatusBadge from "@/components/admin/reports/ReportStatusBadge";

import type { AdminReportDetails } from "@/lib/reports/admin";

interface ReportDetailsProps {
  data: AdminReportDetails;
}

export default function ReportDetails({
  data,
}: ReportDetailsProps) {
  const {
    report,
    video,
    reporter,
    channel,
    creator,
    reviewer,
    categoryLabel,
  } = data;

  return (
    <div className="space-y-6">
      {/* Report Information */}
      <section className="rounded-xl border border-border bg-background">
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Report Information
              </h2>

              <p className="mt-1 text-sm text-muted">
                Details submitted by the user who reported this content.
              </p>
            </div>

            <ReportStatusBadge status={report.status} />
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          {/* Reason */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Reason
            </p>

            <p className="mt-2 text-sm font-semibold capitalize text-foreground">
              {report.reason}
            </p>
          </div>

          {/* Report Date */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Reported
            </p>

            <p className="mt-2 text-sm font-semibold text-foreground">
              {new Date(report.created_at).toLocaleString()}
            </p>
          </div>

          {/* Reporter */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Reported By
            </p>

            <div className="mt-2">
              <ProfileLink profile={reporter} />
            </div>
          </div>

          {/* Report ID */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Report ID
            </p>

            <p className="mt-2 break-all text-sm font-medium text-foreground">
              {report.id}
            </p>
          </div>
        </div>

        {/* Report Description */}
        {report.description && (
          <div className="border-t border-border px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Report Description
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
              {report.description}
            </p>
          </div>
        )}
      </section>

      {/* Reported Video */}
      <section className="rounded-xl border border-border bg-background">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-foreground">
            Reported Video
          </h2>

          <p className="mt-1 text-sm text-muted">
            Review the reported video and its associated content.
          </p>
        </div>

        <div className="p-6">
          {video ? (
            <div className="max-w-md">
              <VideoCard
                id={video.id}
                slug={video.slug}
                title={video.title}
                thumbnail={video.thumbnail_url ?? ""}
                channelName={channel?.channel_name ?? "Unknown channel"}
                channelSlug={channel?.slug ?? ""}
                channelLogo={channel?.logo_url ?? ""}
                views={video.view_count ?? 0}
                createdAt={video.created_at}
                level={video.level}
                accessType={video.access_type}
                categoryLabel={categoryLabel ?? undefined}
                status={video.status}
                showStatus={false}
                showManage={false}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted-bg p-5">
              <p className="text-sm text-muted">
                The reported video is no longer available.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Creator & Channel */}
      <section className="rounded-xl border border-border bg-background">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-foreground">
            Creator Information
          </h2>

          <p className="mt-1 text-sm text-muted">
            Information about the creator and channel associated with this video.
          </p>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          {/* Creator */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Creator
            </p>

            <div className="mt-2">
              <ProfileLink profile={creator} />
            </div>
          </div>

          {/* Channel */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Channel
            </p>

            <div className="mt-2">
              <ChannelLink channel={channel} />
            </div>
          </div>
        </div>
      </section>

      {/* Review Information */}
      {report.status !== "pending" && (
        <section className="rounded-xl border border-border bg-background">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-bold text-foreground">
              Review Information
            </h2>

            <p className="mt-1 text-sm text-muted">
              Information recorded when this report was reviewed.
            </p>
          </div>

          <div className="space-y-6 p-6">
            {reviewer && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Reviewed By
                </p>

                <div className="mt-2">
                  <ProfileLink profile={reviewer} />
                </div>
              </div>
            )}

            {report.reviewed_at && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Reviewed At
                </p>

                <p className="mt-2 text-sm font-semibold text-foreground">
                  {new Date(
                    report.reviewed_at
                  ).toLocaleString()}
                </p>
              </div>
            )}

            {report.admin_note && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Admin Note
                </p>

                <div className="mt-2 rounded-lg border border-border bg-muted-bg p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {report.admin_note}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* Profile */
/* -------------------------------------------------- */

function ProfileLink({
  profile,
}: {
  profile: AdminReportDetails["reporter"];
}) {
  if (!profile) {
    return (
      <p className="text-sm text-muted">
        Profile unavailable
      </p>
    );
  }

  const displayName =
    profile.display_name ||
    profile.username ||
    "Unknown user";

  const initials = displayName.charAt(0).toUpperCase();

  const content = (
    <div className="flex items-center gap-3">
      <Avatar
        avatarUrl={profile.avatar_url}
        alt={displayName}
        fallback={initials}
      />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {displayName}
        </p>

        {profile.username && (
          <p className="truncate text-xs text-muted">
            @{profile.username}
          </p>
        )}
      </div>
    </div>
  );

  if (!profile.username) {
    return content;
  }

  return (
    <Link
      href={`/sellers/${profile.username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex transition-opacity hover:opacity-70"
    >
      {content}
    </Link>
  );
}

/* -------------------------------------------------- */
/* Channel */
/* -------------------------------------------------- */

function ChannelLink({
  channel,
}: {
  channel: AdminReportDetails["channel"];
}) {
  if (!channel) {
    return (
      <p className="text-sm text-muted">
        Channel unavailable
      </p>
    );
  }

  const content = (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted-bg">
        {channel.logo_url ? (
          <Image
            src={channel.logo_url}
            alt={channel.channel_name}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-medium text-white">
            {channel.channel_name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {channel.channel_name}
        </p>

        <p className="truncate text-xs text-muted">
          @{channel.slug}
        </p>
      </div>
    </div>
  );

  return (
    <Link
      href={`/channels/${channel.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex transition-opacity hover:opacity-70"
    >
      {content}
    </Link>
  );
}

/* -------------------------------------------------- */
/* Avatar */
/* -------------------------------------------------- */

function Avatar({
  avatarUrl,
  alt,
  fallback,
}: {
  avatarUrl: string | null;
  alt: string;
  fallback: string;
}) {
  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted-bg">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={alt}
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-medium text-white">
          {fallback}
        </div>
      )}
    </div>
  );
}