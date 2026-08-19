"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
  Star,
  UserRound,
  Volume2,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import SaveVideoButton from "@/components/videos/SaveVideoButton";
import VideoLikeButton from "@/components/videos/VideoLikeButton";
import VideoComments from "@/components/videos/VideoComments";
import ReportVideoButton from "@/components/videos/ReportVideoButton";

interface VideoDetailProps {
  video: any;
}

/* =========================================================
   HELPERS
========================================================= */

function formatTimeAgo(dateString?: string | null) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  const diffSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (diffSeconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(diffSeconds / 60);

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${
      hours === 1 ? "hour" : "hours"
    } ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} ${
      days === 1 ? "day" : "days"
    } ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} ${
      months === 1 ? "month" : "months"
    } ago`;
  }

  const years = Math.floor(months / 12);

  return `${years} ${
    years === 1 ? "year" : "years"
  } ago`;
}

function formatText(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(name?: string | null) {
  if (!name) return "NC";

  return name
    .split(" ")
    .filter(Boolean)
    .map((word: string) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatPrice(
  price?: number | string | null,
  currency?: string | null
) {
  if (price === null || price === undefined) {
    return null;
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return null;
  }

  const currencyCode = (currency || "USD").toUpperCase();

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(numericPrice);
  } catch {
    return `${numericPrice.toFixed(2)} ${currencyCode}`;
  }
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }

  const totalSeconds = Math.floor(seconds);

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function VideoDetail({
  video,
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

  const userAvatar =
    profile?.avatar_url || "";

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
        setDuration(videoElement.duration);
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
          className="mb-6 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-sm"
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

              return (
                <div
                  key={
                    category.id ||
                    `${category.slug}-${index}`
                  }
                  className="flex shrink-0 items-center gap-1.5"
                >
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" />

                  <Link
                    href={`/categories/${categorySlug}`}
                    className="text-muted transition hover:text-foreground"
                  >
                    {category.name}
                  </Link>
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
            TITLE + CREATOR
        ================================================== */}

        <div className="mb-6">
          <h1 className="max-w-5xl text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {video.title}
          </h1>

          <div className="mt-4">
            <Link
              href={
                username
                  ? `/profile/${username}`
                  : "#"
              }
              className="group inline-flex items-center gap-3"
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage
                  src={userAvatar}
                  alt={userName}
                />

                <AvatarFallback className="bg-primary text-white">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground group-hover:underline">
                    {userName}
                  </span>

                  {username && (
                    <span className="text-sm text-muted">
                      @{username}
                    </span>
                  )}
                </div>

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
            </Link>
          </div>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================== */}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">

          {/* =================================================
              LEFT COLUMN
          ================================================== */}

          <main className="min-w-0">

            {/* =================================================
                VIDEO PLAYER
            ================================================== */}

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
                      {formatDuration(duration)}
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

                  {duration && (
                    <div className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
                      {formatDuration(duration)}
                    </div>
                  )}

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

            {/* =================================================
                VIDEO ACTIONS
            ================================================== */}

            <div className="mt-3 flex flex-wrap items-center gap-3">
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

            {/* =================================================
                DESCRIPTION
            ================================================== */}

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

            {/* =================================================
                RATINGS & REVIEWS
            ================================================== */}

            <section className="mt-8">

              <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Ratings & Reviews
                </h2>

                <span className="text-sm text-muted">
                  0 reviews
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)]">

                <div className="rounded-xl bg-muted-bg p-5">
                  <div className="text-4xl font-bold tracking-tight text-foreground">
                    —
                  </div>

                  <div className="mt-2 flex gap-1 text-muted">
                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <Star
                          key={star}
                          className="h-4 w-4"
                        />
                      )
                    )}
                  </div>

                  <p className="mt-2 text-sm text-muted">
                    No ratings yet
                  </p>
                </div>

                <div className="flex flex-col justify-center">
                  <p className="font-medium text-foreground">
                    Be the first to review this video
                  </p>

                  <p className="mt-1 max-w-lg text-sm leading-6 text-muted">
                    Share your experience and help
                    other learners decide if this
                    video is right for them.
                  </p>

                  <Button
                    variant="outline"
                    className="mt-4 w-fit rounded-lg border-border"
                  >
                    Write a Review
                  </Button>
                </div>

              </div>
            </section>

          </main>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================== */}

          <aside className="self-start">

            {/* =================================================
                VIDEO DETAILS
            ================================================== */}

            <Card className="rounded-xl border-border bg-muted-bg p-4 shadow-none">

              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">
                  Video Details
                </h2>
              </div>

              {/* Compact 2-column details */}

              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3">

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
                    value={subtitleLanguage}
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

              {/* Access / Subscription */}

<div className="mt-2 border-t border-border/70 pt-2">

  {isFree ? (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs text-muted">
          Video access
        </p>

        <p className="mt-0.5 text-base font-semibold text-foreground">
          Free
        </p>
      </div>

      <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
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
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-foreground">
          <Check className="h-3.5 w-3.5" />
          Subscribed
        </span>
      ) : (
        channel?.slug && (
          <Link href={`/channels/${channel.slug}`}>
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

          

{/* =================================================
    CHANNEL
================================================= */}

<Card className="mt-7 rounded-xl border-border bg-white p-4 shadow-none">

  {/* Posted under */}
  <p className="text-xs font-medium text-muted">
    Posted under
  </p>

  {/* Channel */}
  <div className="flex items-center gap-3">

    <Link
      href={
        channel?.slug
          ? `/channels/${channel.slug}`
          : "#"
      }
      className="group flex min-w-0 items-center gap-3"
    >
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarImage
          src={channel?.logo_url ?? ""}
          alt={
            channel?.channel_name ??
            userName
          }
        />

        <AvatarFallback className="bg-primary text-white">
          {getInitials(
            channel?.channel_name ||
              userName
          )}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground group-hover:underline">
          {channel?.channel_name || "Channel"}
        </p>

        {username && (
          <p className="truncate text-xs text-muted">
            @{username}
          </p>
        )}
      </div>
    </Link>

  </div>

  {/* View Channel button */}
  {channel?.slug && (
    <Link
      href={`/channels/${channel.slug}`}
      className="block"
    >
      <Button
        variant="outline"
        className="w-full rounded-lg border-border"
      >
        View Channel
      </Button>
    </Link>
  )}

</Card>
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

        {/* =================================================
            RELATED VIDEOS
        ================================================== */}

        <section className="mt-10">

          <div className="border-b border-border pb-3">
            <h2 className="text-xl font-semibold text-foreground">
              Related Videos
            </h2>
          </div>

          <div className="py-6">

            <div className="rounded-xl border border-dashed border-border p-8 text-center">

              <p className="font-medium text-foreground">
                Related videos will appear here
              </p>

              <p className="mt-1 text-sm text-muted">
                We will show videos from the
                same language and category.
              </p>

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

/* =========================================================
   COMPACT DETAIL
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