"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Video,
} from "lucide-react";

import { formatTimeAgo } from "@/lib/utils";
import { deleteAdminVideo } from "@/app/admin/videos/actions";

type AdminVideo = {
  id: string;
  channel_id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  access_type: string;
  status: string;
  view_count: number;
  created_at: string;
  video_id: string | null;
  video_provider: string | null;
  channel_name: string;
  seller_name: string;
  seller_username: string | null;
  seller_avatar_url: string | null;
};

type Props = {
  videos: AdminVideo[];
};

export default function AdminVideosList({
  videos,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return videos.filter((video) => {
      const matchesSearch =
        !query ||
        video.title.toLowerCase().includes(query) ||
        video.slug.toLowerCase().includes(query) ||
        video.channel_name.toLowerCase().includes(query) ||
        video.seller_name.toLowerCase().includes(query) ||
        (video.seller_username ?? "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        video.status === statusFilter;

      const matchesAccess =
        accessFilter === "all" ||
        video.access_type === accessFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAccess
      );
    });
  }, [
    videos,
    search,
    statusFilter,
    accessFilter,
  ]);

  async function handleDelete(video: AdminVideo) {
    if (deletingId) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${video.title}"?\n\nThis will permanently delete the video and its stored files.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(video.id);

    try {
      const result = await deleteAdminVideo(video.id);

      if (!result.success) {
        window.alert(
          result.error || "Unable to delete this video."
        );

        return;
      }

      window.location.reload();
    } catch (error) {
      console.error(
        "ADMIN VIDEO DELETE ERROR:",
        error
      );

      window.alert(
        "Unable to delete this video."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* Search / Filters */}
      <div className="rounded-xl border border-border bg-background p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search videos..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground"
            />
          </div>

          {/* Filters */}
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-foreground sm:w-36"
            >
              <option value="all">
                All Status
              </option>

              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
            </select>

            <select
              value={accessFilter}
              onChange={(event) =>
                setAccessFilter(event.target.value)
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-foreground sm:w-36"
            >
              <option value="all">
                All Access
              </option>

              <option value="free">
                Free
              </option>

              <option value="subscriber">
                Subscriber
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Videos table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">
            All Videos
          </h2>

          <p className="mt-1 text-sm text-muted">
            Videos uploaded by NiceConvo sellers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 font-medium text-muted">
                  Video
                </th>

                <th className="px-6 py-3 font-medium text-muted">
                  Channel
                </th>

                <th className="px-6 py-3 font-medium text-muted">
                  Access
                </th>

                <th className="px-6 py-3 font-medium text-muted">
                  Status
                </th>

                <th className="px-6 py-3 font-medium text-muted">
                  Views
                </th>

                <th className="px-6 py-3 font-medium text-muted">
                  Created
                </th>

                <th className="px-6 py-3 font-medium text-muted">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredVideos.length > 0 ? (
                filteredVideos.map((video) => {
                  const isFree =
                    video.access_type === "free";

                  const isPublished =
                    video.status === "published";

                  const isDeleting =
                    deletingId === video.id;

                  return (
                    <tr
                      key={video.id}
                      className="border-b border-border last:border-0"
                    >
                      {/* Video */}
                      <td className="px-6 py-4">
                        <div className="flex min-w-[260px] items-center gap-3">
                          <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-muted-bg">
                            {video.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Video className="h-5 w-5 text-muted" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {video.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-muted">
                              {video.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="px-6 py-4">
                        <div className="min-w-[160px]">
                          <p className="font-medium text-foreground">
                            {video.channel_name}
                          </p>

                          <p className="mt-1 text-xs text-muted">
                            {video.seller_name}
                          </p>
                        </div>
                      </td>

                      {/* Access */}
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-muted-bg px-2.5 py-1 text-xs font-medium text-secondary">
                          {isFree
                            ? "Free"
                            : "Subscriber"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-secondary">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isPublished
                                ? "bg-foreground"
                                : "bg-muted"
                            }`}
                          />

                          {isPublished
                            ? "Published"
                            : "Draft"}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="px-6 py-4 text-secondary">
                        {video.view_count.toLocaleString()}
                      </td>

                      {/* Created */}
                      <td className="whitespace-nowrap px-6 py-4 text-secondary">
                        {formatTimeAgo(
                          video.created_at
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex min-w-max items-center gap-2">
                          <Link
                            href={`/admin/videos/${video.id}`}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-foreground transition hover:bg-light-bg"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Link>

                          <Link
                            href={`/admin/videos/${video.id}/edit`}
                            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-background transition hover:opacity-90"
                          >
                            <Pencil className="h-4 w-4" />
                            <span>Edit</span>
                          </Link>

                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() =>
                              handleDelete(video)
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-foreground transition hover:bg-light-bg disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />

                            <span>
                              {isDeleting
                                ? "Deleting..."
                                : "Delete"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-foreground">
                      No videos found.
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result count */}
      <div className="mt-3 text-xs text-muted">
        Showing {filteredVideos.length} of{" "}
        {videos.length} videos.
      </div>
    </>
  );
}