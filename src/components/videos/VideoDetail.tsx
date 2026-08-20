"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

import {
  formatTimeAgo,
  formatText,
  getInitials,
  formatPrice,
  formatDuration,
} from "@/lib/utils";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Captions,
  Check,
  ChevronRight,
  Globe2,
  Languages,
  LockKeyhole,
  MessageCircle,
  Sparkles,
  UserRound,
  Volume2,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import SaveVideoButton from "@/components/videos/SaveVideoButton";
import VideoLikeButton from "@/components/videos/VideoLikeButton";
import VideoComments from "@/components/videos/VideoComments";
import ReportVideoButton from "@/components/videos/ReportVideoButton";
import VideoRatings from "@/components/videos/VideoRatings";

interface VideoDetailProps {
  video: any;
  relatedVideos: any[];
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function VideoDetail({
  video,
  relatedVideos,
}: VideoDetailProps) {
  /* -------------------------------------------------------
     CHANNEL
  ------------------------------------------------------- */

  const channel = Array.isArray(video.channels)
    ? video.channels[0]
    : video.channels;

  /* -------------------------------------------------------
     PROFILE / CREATOR
  ------------------------------------------------------- */

  const profile = Array.isArray(channel?.profiles)
    ? channel.profiles[0]
    : channel?.profiles;

  const userName =
    profile?.display_name ||
    profile?.username ||
    "Creator";

  const username = profile?.username;

  const channelLogo =
    channel?.logo_url ||
    profile?.avatar_url ||
    "";

  const channelName =
    channel?.channel_name ||
    "Channel";

  /* -------------------------------------------------------
     LANGUAGE
  ------------------------------------------------------- */

  const language =
    video.language_name ||
    formatText(video.language_code);

  const languageDescription =
    video.language_description ||
    language;

  /* -------------------------------------------------------
     SUBTITLES
  ------------------------------------------------------- */

  const subtitleLanguage =
    video.subtitle_language_name ||
    formatText(video.subtitle_language_code);

  /* -------------------------------------------------------
     ACCESS
  ------------------------------------------------------- */

  const isFree =
    video.access_type === "free";

  const canWatch =
    video.can_watch === true &&
    !!video.video_url;

  const subscriptionPrice = formatPrice(
    channel?.subscription_price,
    channel?.currency
  );

  /* -------------------------------------------------------
     VIDEO REFS / STATE
  ------------------------------------------------------- */

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const supabase = createClient();

  const viewRecordedRef =
    useRef(false);

  const watchedForViewRef =
    useRef(0);

  const lastPlaybackTimeRef =
    useRef<number | null>(null);

  const [duration, setDuration] =
    useState<number | null>(null);

  /* =======================================================
     WATCH HISTORY
  ======================================================= */

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    if (!video.is_authenticated) return;

    if (!video.can_watch || !video.video_url) {
      return;
    }

    let lastSavedTime = 0;

    const saveHistory = async () => {
      const currentTime =
        videoElement.currentTime;

      if (!Number.isFinite(currentTime)) {
        return;
      }

      if (
        currentTime - lastSavedTime < 5 &&
        !videoElement.paused
      ) {
        return;
      }

      lastSavedTime = currentTime;

      try {
        await fetch("/api/watch-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId: video.id,
            progressSeconds: Math.floor(
              currentTime
            ),
          }),
        });
      } catch (error) {
        console.error(
          "Failed to save watch history:",
          error
        );
      }
    };

    const handleTimeUpdate = () => {
      saveHistory();
    };

    const handlePause = () => {
      saveHistory();
    };

    const handleEnded = () => {
      saveHistory();
    };

    videoElement.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    videoElement.addEventListener(
      "pause",
      handlePause
    );

    videoElement.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      saveHistory();

      videoElement.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      videoElement.removeEventListener(
        "pause",
        handlePause
      );

      videoElement.removeEventListener(
        "ended",
        handleEnded
      );

    };
  }, [
    video.id,
    video.is_authenticated,
    video.can_watch,
    video.video_url,
  ]);

  /* =======================================================
     VIEW TRACKING
  ======================================================= */

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    if (!video.is_authenticated) return;

    if (!video.can_watch || !video.video_url) {
      return;
    }

    let mounted = true;

    const recordView = async () => {
      if (!mounted) return;

      if (viewRecordedRef.current) return;

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error(
            "Unable to get user for view tracking:",
            userError
          );

          return;
        }

        const { error } =
          await supabase.rpc(
            "record_video_view",
            {
              p_video_id: video.id,
              p_viewer_id: user.id,
              p_session_id: null,
            }
          );

        if (error) {
          console.error(
            "Failed to record video view:",
            error
          );

          return;
        }

        viewRecordedRef.current = true;

        console.log(
          "Video view recorded:",
          video.id
        );
      } catch (error) {
        console.error(
          "Failed to record video view:",
          error
        );
      }
    };

    const handlePlay = () => {
      lastPlaybackTimeRef.current =
        videoElement.currentTime;
    };

    const handlePause = () => {
      lastPlaybackTimeRef.current = null;
    };

    const handleEnded = () => {
      lastPlaybackTimeRef.current = null;
    };

    const handleTimeUpdate = () => {
      if (viewRecordedRef.current) {
        return;
      }

      const currentTime =
        videoElement.currentTime;

      if (!Number.isFinite(currentTime)) {
        return;
      }

      const previousTime =
        lastPlaybackTimeRef.current;

      if (previousTime !== null) {
        const delta =
          currentTime - previousTime;

        if (delta > 0 && delta <= 2) {
          watchedForViewRef.current += delta;
        }
      }

      lastPlaybackTimeRef.current =
        currentTime;

      if (
        watchedForViewRef.current >= 10
      ) {
        recordView();
      }
    };

    videoElement.addEventListener(
      "play",
      handlePlay
    );

    videoElement.addEventListener(
      "pause",
      handlePause
    );

    videoElement.addEventListener(
      "ended",
      handleEnded
    );

    videoElement.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    return () => {
      mounted = false;

      videoElement.removeEventListener(
        "play",
        handlePlay
      );

      videoElement.removeEventListener(
        "pause",
        handlePause
      );

      videoElement.removeEventListener(
        "ended",
        handleEnded
      );

      videoElement.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );
    };
  }, [
    video.id,
    video.is_authenticated,
    video.can_watch,
    video.video_url,
  ]);

  /* =======================================================
     VIDEO DURATION
  ======================================================= */

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      if (
        Number.isFinite(videoElement.duration) &&
        videoElement.duration > 0
      ) {
        setDuration(
          videoElement.duration
        );
      }
    };

    if (videoElement.readyState >= 1) {
      handleLoadedMetadata();
    }

    videoElement.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    return () => {
      videoElement.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );
    };
  }, [video.video_id]);

  /* =======================================================
     CATEGORY BREADCRUMBS
  ======================================================= */

  const categoryPath =
    Array.isArray(video.category_path)
      ? video.category_path
      : Array.isArray(video.categories)
        ? video.categories
        : [];

  const categoryVideosHref =
  categoryPath.length > 0
    ? `/videos/${categoryPath
        .map((category: any) => category.slug)
        .join("/")}`
    : "/videos";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8 lg:py-8">

        {/* =================================================
            BREADCRUMBS
        ================================================== */}

        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-sm"
        >
          <Link
            href="/"
            className="shrink-0 text-muted transition hover:text-foreground"
          >
            Home
          </Link>

          <ChevronRight className="h-4 w-4 shrink-0 text-muted" />

          <Link
            href="/videos"
            className="shrink-0 text-muted transition hover:text-foreground"
          >
            Videos
          </Link>

          {categoryPath.map(
            (
              category: any,
              index: number
            ) => {
              const categorySlug =
                categoryPath
                  .slice(0, index + 1)
                  .map(
                    (item: any) =>
                      item.slug
                  )
                  .join("/");

              const isLast =
                index ===
                categoryPath.length - 1;

              return (
                <div
                  key={
                    category.id ||
                    `${category.slug}-${index}`
                  }
                  className="flex shrink-0 items-center gap-1.5"
                >
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" />

                  {isLast ? (
                    <span className="font-medium text-foreground">
                      {category.name}
                    </span>
                  ) : (
                    <Link
                      href={`/videos/${categorySlug}`}
                      className="text-muted transition hover:text-foreground"
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
              );
            }
          )}

          <ChevronRight className="h-4 w-4 shrink-0 text-muted" />

          <span
            className="max-w-[300px] truncate text-muted"
            title={video.title}
          >
            {video.title}
          </span>
        </nav>

        {/* =================================================
            TITLE + CHANNEL INFORMATION
        ================================================== */}

        <div className="mb-6">
          <h1 className="max-w-5xl text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {video.title}
          </h1>

          <div className="mt-4 flex items-center gap-3">

            <Link
              href={
                channel?.slug
                  ? `/channels/${channel.slug}`
                  : "#"
              }
              className="shrink-0"
            >
              <Avatar className="h-11 w-11">
                <AvatarImage
                  src={channelLogo}
                  alt={channelName}
                />

                <AvatarFallback className="bg-primary text-white">
                  {getInitials(
                    channelName
                  )}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="min-w-0">
              <Link
                href={
                  channel?.slug
                    ? `/channels/${channel.slug}`
                    : "#"
                }
                className="block"
              >
                <span className="text-sm font-semibold text-foreground hover:underline">
                  {channelName}
                </span>
              </Link>

              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted">
                <span>
                  {video.view_count ?? 0} views
                </span>

                <span>•</span>

                <span>
                  {formatTimeAgo(
                    video.published_at ??
                      video.created_at
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN TWO-COLUMN LAYOUT
        ================================================== */}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <main className="min-w-0">

            {/* ===============================================
                VIDEO PLAYER
            =============================================== */}

            <div className="relative overflow-hidden rounded-xl bg-black">

              {canWatch ? (
                <div className="aspect-video">
                  <video
                    ref={videoRef}
                    controls
                    poster={
                      video.thumbnail_url ??
                      undefined
                    }
                    className="h-full w-full"
                    preload="metadata"
                  >
                    <source
                      src={video.video_url}
                      type="video/mp4"
                    />

                    Your browser does not support
                    the video player.
                  </video>

                  {duration && (
                    <div className="pointer-events-none absolute bottom-12 right-3 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
                      {formatDuration(
                        duration
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative aspect-video">

                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted-bg" />
                  )}

                  <div className="absolute inset-0 bg-black/55" />

                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                    <div className="max-w-sm">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                        <LockKeyhole className="h-6 w-6 text-white" />
                      </div>

                      {!video.is_authenticated && (
                        <>
                          <h2 className="mt-4 text-xl font-semibold text-white">
                            Login to watch
                          </h2>

                          <p className="mt-2 text-sm leading-6 text-white/80">
                            {isFree
                              ? "Log in to your account to watch this free video."
                              : "Log in to your account to watch this video."}
                          </p>

                          <Link href="/login">
                            <Button className="mt-4 rounded-lg bg-white px-5 text-black hover:bg-white/90">
                              Log in to Watch
                            </Button>
                          </Link>
                        </>
                      )}

                      {video.is_authenticated &&
                        !isFree &&
                        !video.has_active_subscription && (
                          <>
                            <h2 className="mt-4 text-xl font-semibold text-white">
                              Subscribers only
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-white/80">
                              Subscribe to this channel to watch this video.
                            </p>

                            {subscriptionPrice && (
                              <p className="mt-3 text-sm font-medium text-white">
                                {subscriptionPrice} / month
                              </p>
                            )}

                            {channel?.slug && (
                              <Link
                                href={`/channels/${channel.slug}`}
                              >
                                <Button className="mt-4 rounded-lg bg-white px-5 text-black hover:bg-white/90">
                                  Subscribe to Channel
                                </Button>
                              </Link>
                            )}
                          </>
                        )}

                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* ===============================================
                VIDEO ACTIONS
            =============================================== */}

            <div className="mt-3 flex items-center gap-3 border-b border-border pb-4">

              {/* Left actions */}
              <div className="flex min-w-0 items-center gap-3">
                <VideoLikeButton
                  videoId={video.id}
                  isAuthenticated={
                    video.is_authenticated
                  }
                />

                <SaveVideoButton
                  videoId={video.id}
                  isSaved={video.is_saved}
                  isAuthenticated={
                    video.is_authenticated
                  }
                />

                <ReportVideoButton
                  videoId={video.id}
                  isAuthenticated={
                    video.is_authenticated
                  }
                />
              </div>

              {/* Posted By */}
              {username && (
                <div className="ml-auto flex shrink-0 items-center gap-1.5 text-sm">
                  <span className="text-muted">
                    Posted by
                  </span>

                  <Link
                    href={`/sellers/${username}`}
                    className="font-semibold text-foreground transition hover:underline"
                  >
                    @{username}
                  </Link>
                </div>
              )}

            </div>
            {/* ===============================================
                DESCRIPTION
            =============================================== */}

            <Card className="mt-5 rounded-xl border-border bg-white p-5 shadow-none">

              <h2 className="text-base font-semibold text-foreground">
                Description
              </h2>

              {video.description ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-secondary">
                  {video.description}
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted">
                  No description has been added
                  for this video.
                </p>
              )}

            </Card>

            {/* ===============================================
                  RATINGS & REVIEWS
              =============================================== */}

              <section className="mt-6">
                <VideoRatings
                  videoId={video.id}
                  isAuthenticated={
                    video.is_authenticated
                  }
                />
              </section>

          </main>

          {/* =================================================
              RIGHT COLUMN
          ================================================== */}

          <aside className="self-start">

            {/* ===============================================
                VIDEO DETAILS
            =============================================== */}

            <Card className="rounded-xl border-border bg-muted-bg p-4 shadow-none">

              <h2 className="text-base font-semibold text-foreground">
                Video Details
              </h2>

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">

                {video.level && (
                  <CompactDetail
                    icon={
                      <Sparkles className="h-3.5 w-3.5" />
                    }
                    label="Skill"
                    value={formatText(
                      video.level
                    )}
                  />
                )}

                <CompactDetail
                  icon={
                    <Globe2 className="h-3.5 w-3.5" />
                  }
                  label="Language"
                  value={
                    languageDescription ||
                    language
                  }
                />

                {subtitleLanguage && (
                  <CompactDetail
                    icon={
                      <Languages className="h-3.5 w-3.5" />
                    }
                    label="Subtitles"
                    value={
                      subtitleLanguage
                    }
                  />
                )}

                <CompactDetail
                  icon={
                    <UserRound className="h-3.5 w-3.5" />
                  }
                  label="Native Speaker"
                  value={
                    video.is_native_speaker
                      ? "Yes"
                      : "No"
                  }
                />

                <CompactDetail
                  icon={
                    <Captions className="h-3.5 w-3.5" />
                  }
                  label="Captions"
                  value={
                    video.captions_original
                      ? "Original"
                      : "No"
                  }
                />

                <CompactDetail
                  icon={
                    <MessageCircle className="h-3.5 w-3.5" />
                  }
                  label="Idioms"
                  value={
                    video.explains_idioms
                      ? "Yes"
                      : "No"
                  }
                />

                <CompactDetail
                  icon={
                    <Sparkles className="h-3.5 w-3.5" />
                  }
                  label="Technical"
                  value={
                    video.explains_technical_lingo
                      ? "Yes"
                      : "No"
                  }
                />

                <CompactDetail
                  icon={
                    <MessageCircle className="h-3.5 w-3.5" />
                  }
                  label="Profanity"
                  value={
                    video.profanity
                      ? "Yes"
                      : "No"
                  }
                />

                <CompactDetail
                  icon={
                    <Volume2 className="h-3.5 w-3.5" />
                  }
                  label="AI Voice"
                  value={
                    video.ai_voice
                      ? "Yes"
                      : "No"
                  }
                />

              </div>

              {/* =============================================
                  SUBSCRIPTION
              ============================================= */}

              <div className="mt-4 border-t border-border/70 pt-4">

                {isFree ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted">
                        Video access
                      </p>

                      <p className="mt-0.5 text-base font-semibold text-foreground">
                        Free
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-medium">
                      <Check className="h-3.5 w-3.5" />
                      Available
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <p className="text-xs text-muted">
                        Channel subscription
                      </p>

                      {subscriptionPrice && (
                        <p className="mt-0.5 text-base font-semibold text-foreground">
                          {subscriptionPrice}

                          <span className="ml-1 text-xs font-normal text-muted">
                            / month
                          </span>
                        </p>
                      )}
                    </div>

                    {video.has_active_subscription ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium">
                        <Check className="h-3.5 w-3.5" />
                        Subscribed
                      </span>
                    ) : (
                      channel?.slug && (
                        <Link
                          href={`/channels/${channel.slug}`}
                        >
                          <Button
                            size="sm"
                            className="rounded-lg px-3"
                          >
                            Subscribe
                          </Button>
                        </Link>
                      )
                    )}

                  </div>
                )}

              </div>

            </Card>

            {/* ===============================================
                RELATED VIDEOS
            =============================================== */}

            {relatedVideos.length > 0 && (
              <div className="mt-6">

                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">
                    Related Videos
                  </h2>

                  <Link
                    href={categoryVideosHref}
                    className="text-xs font-medium text-muted transition hover:text-foreground"
                  >
                    View all
                  </Link>
                </div>

                <div className="space-y-3">
                  {relatedVideos.map(
                    (relatedVideo) => (
                      <RelatedVideoCard
                        key={
                          relatedVideo.id
                        }
                        video={
                          relatedVideo
                        }
                      />
                    )
                  )}
                </div>

              </div>
            )}

          </aside>

        </div>

        {/* =================================================
            COMMENTS
        ================================================== */}

        <section className="mt-10">
          <VideoComments
            videoId={video.id}
            isAuthenticated={
              video.is_authenticated
            }
          />
        </section>

      </div>
    </div>
  );
}

/* =========================================================
   RELATED VIDEO CARD
========================================================= */

function RelatedVideoCard({
  video,
}: {
  video: any;
}) {
  const channel = Array.isArray(
    video.channels
  )
    ? video.channels[0]
    : video.channels;

  const profile = Array.isArray(
    channel?.profiles
  )
    ? channel.profiles[0]
    : channel?.profiles;

  const channelName =
    channel?.channel_name ||
    "Channel";

  const channelLogo =
    channel?.logo_url ||
    profile?.avatar_url ||
    "";

  const publishedAt =
    video.published_at ??
    video.created_at;

  const metadata: string[] = [];

  metadata.push(
    `${video.view_count ?? 0} views`
  );

  if (publishedAt) {
    metadata.push(
      formatTimeAgo(publishedAt)
    );
  }

  return (
    <Link
      href={`/videos/${video.slug}`}
      className="group block"
    >
      <div className="flex gap-3">

        {/* =============================================
            THUMBNAIL
        ============================================== */}

        <div className="relative h-[90px] w-[150px] shrink-0 overflow-hidden rounded-lg bg-muted-bg">

          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted-bg">
              <span className="text-[10px] text-muted">
                No thumbnail
              </span>
            </div>
          )}

          {video.duration &&
            Number(video.duration) > 0 && (
              <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {formatDuration(
                  Number(video.duration)
                )}
              </span>
            )}

        </div>

        {/* =============================================
            INFORMATION
        ============================================== */}

        <div className="min-w-0 flex-1">

          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground transition group-hover:text-secondary">
            {video.title}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5">

            <Avatar className="h-5 w-5 shrink-0">
              <AvatarImage
                src={channelLogo}
                alt={channelName}
              />

              <AvatarFallback className="text-[8px]">
                {getInitials(
                  channelName
                )}
              </AvatarFallback>
            </Avatar>

            <span className="truncate text-xs text-muted">
              {channelName}
            </span>

          </div>

          {metadata.length > 0 && (
            <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] text-muted">
              {metadata.map(
                (
                  item: string,
                  index: number
                ) => (
                  <span
                    key={`${item}-${index}`}
                    className="truncate"
                  >
                    {index > 0 && (
                      <span className="mr-1">
                        •
                      </span>
                    )}

                    {item}
                  </span>
                )
              )}
            </div>
          )}

        </div>

      </div>
    </Link>
  );
}

/* =========================================================
   COMPACT VIDEO DETAIL
========================================================= */

function CompactDetail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  const isLongValue =
    label === "Language" ||
    label === "Subtitles";

  return (
    <div className="min-w-0">

      <div className="flex items-center gap-1.5 text-muted">
        {icon}

        <span className="truncate text-[11px] font-medium">
          {label}
        </span>
      </div>

      <p
        className={`mt-0.5 pl-5 text-xs font-semibold leading-4 text-foreground ${
          isLongValue
            ? "line-clamp-2"
            : "truncate"
        }`}
        title={value}
      >
        {value}
      </p>

    </div>
  );
}