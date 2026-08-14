"use client";

import type { ReactNode } from "react";
import Link from "next/link";

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
  MessageCircle,
  Sparkles,
  Star,
  UserRound,
  Volume2,
  LockKeyhole,
  Play,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import SaveVideoButton from "@/components/videos/SaveVideoButton";

interface VideoDetailProps {
  video: any;
}

/* =========================================================
   Helpers
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
   Main Component
========================================================= */

export default function VideoDetail({
  video,
}: VideoDetailProps) {
  /* -------------------------------------------------------
     Channel
  ------------------------------------------------------- */

  const channel = Array.isArray(video.channels)
    ? video.channels[0]
    : video.channels;

  /* -------------------------------------------------------
     Profile / Creator
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
     Language
  ------------------------------------------------------- */

  const language =
    video.language_name ||
    formatText(video.language_code);

  const languageDescription =
    video.language_description ||
    language;

  /* -------------------------------------------------------
     Subtitle
  ------------------------------------------------------- */

  const subtitleLanguage =
    video.subtitle_language_name ||
    formatText(video.subtitle_language_code);

  /* -------------------------------------------------------
     Access
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
     Duration
  ------------------------------------------------------- */

  const videoRef = useRef<HTMLVideoElement>(null);

  const [duration, setDuration] =
    useState<number | null>(null);

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

  /* -------------------------------------------------------
     Category breadcrumbs
  ------------------------------------------------------- */

  const categoryPath =
    Array.isArray(video.category_path)
      ? video.category_path
      : Array.isArray(video.categories)
        ? video.categories
        : [];

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8 lg:py-8">

        {/* =================================================
            BREADCRUMBS
        ================================================== */}

        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-sm"
        >
          {/* Home */}

          <Link
            href="/"
            className="shrink-0 text-muted transition hover:text-foreground"
          >
            Home
          </Link>

          <ChevronRight className="h-4 w-4 shrink-0 text-muted" />

          {/* Videos */}

          <Link
            href="/videos"
            className="shrink-0 text-muted transition hover:text-foreground"
          >
            Videos
          </Link>

          {/* Categories */}

          {categoryPath.map(
            (category: any, index: number) => {
              const categorySlug = categoryPath
                .slice(0, index + 1)
                .map(
                  (item: any) => item.slug
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
                    className="shrink-0 text-muted transition hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </div>
              );
            }
          )}

          {/* Current Video */}

          <div className="flex min-w-0 shrink-0 items-center gap-1.5">
            <ChevronRight className="h-4 w-4 shrink-0 text-muted" />

            <span
              className="max-w-[280px] truncate text-muted"
              title={video.title}
            >
              {video.title}
            </span>
          </div>
        </nav>

        {/* =================================================
            TITLE + CREATOR
        ================================================== */}

        <div className="mb-8">

          <h1 className="max-w-5xl text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {video.title}
          </h1>

          {/* Creator + Save */}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Creator */}

            <Link
              href={
                username
                  ? `/profile/${username}`
                  : "#"
              }
              className="group inline-flex items-center gap-3 rounded-lg transition"
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
                  <span className="text-sm font-semibold text-foreground transition group-hover:underline">
                    {userName}
                  </span>

                  {username && (
                    <span className="text-sm text-muted transition group-hover:text-foreground">
                      @{username}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
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

            {/* Save Video */}

            <SaveVideoButton
              videoId={video.id}
              isSaved={video.is_saved}
              isAuthenticated={video.is_authenticated}
            />

          </div>
        </div>

        {/* =================================================
            VIDEO + DETAILS
        ================================================== */}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">

          {/* =================================================
              LEFT COLUMN
          ================================================== */}

          <div className="min-w-0">

            {/* =================================================
                VIDEO PLAYER
            ================================================== */}

            <div className="relative overflow-hidden rounded-xl bg-black">

              {/* Free video */}

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

                  {/* Duration */}

                  {duration && (
                    <div className="pointer-events-none absolute bottom-12 right-3 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
                      {formatDuration(duration)}
                    </div>
                  )}

                </div>
              ) : (

                /* Subscriber-only video */

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

                  {/* Dark overlay */}

                  <div className="absolute inset-0 bg-black/55" />

                  {/* Duration */}

                  {duration && (
                    <div className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
                      {formatDuration(duration)}
                    </div>
                  )}

                  {/* Locked video message */}

                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                      <div className="max-w-sm">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                          <LockKeyhole className="h-6 w-6 text-white" />
                        </div>

                        {/* Logged out */}
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

                        {/* Logged in but subscriber-only */}
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
                DESCRIPTION
            ================================================== */}

            <Card className="mt-6 rounded-xl border-border p-6 shadow-none">

              <h2 className="text-lg font-semibold text-foreground">
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
                CHANNEL
            ================================================== */}

            <Card className="mt-6 rounded-xl border-border p-5 shadow-none">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <Link
                  href={
                    channel?.slug
                      ? `/channels/${channel.slug}`
                      : "#"
                  }
                  className="group flex items-center gap-4"
                >
                  <Avatar className="h-12 w-12">

                    <AvatarImage
                      src={
                        channel?.logo_url ?? ""
                      }
                      alt={
                        channel?.channel_name ??
                        userName
                      }
                    />

                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(
                        channel?.channel_name
                      )}
                    </AvatarFallback>

                  </Avatar>

                  <div>

                    <p className="text-xs text-muted">
                      Posted under
                    </p>

                    <p className="font-semibold text-foreground group-hover:underline">
                      {channel?.channel_name ||
                        "Channel"}
                    </p>

                  </div>
                </Link>

                {channel?.slug && (
                  <Link
                    href={`/channels/${channel.slug}`}
                  >
                    <Button
                      variant="outline"
                      className="rounded-lg border-border"
                    >
                      View Channel
                    </Button>
                  </Link>
                )}

              </div>

            </Card>

          </div>

          {/* =================================================
              RIGHT COLUMN — VIDEO DETAILS
          ================================================== */}

          <aside>

            <Card className="rounded-xl border-border p-5 shadow-none">

              <h2 className="text-base font-semibold text-foreground">
                Video Details
              </h2>

              <div className="mt-3 space-y-0.5">

                {/* Skill */}

                {video.level && (
                  <DetailLine
                    icon={
                      <Sparkles className="h-4 w-4" />
                    }
                    label="Skill"
                    value={formatText(
                      video.level
                    )}
                  />
                )}

                {/* Language */}

                <DetailLine
                  icon={
                    <Globe2 className="h-4 w-4" />
                  }
                  label="Language"
                  value={
                    languageDescription ||
                    language
                  }
                />

                {/* Subtitles */}

                {subtitleLanguage && (
                  <DetailLine
                    icon={
                      <Languages className="h-4 w-4" />
                    }
                    label="Subtitles"
                    value={subtitleLanguage}
                  />
                )}

                {/* Native Speaker */}

                <DetailLine
                  icon={
                    <UserRound className="h-4 w-4" />
                  }
                  label="Native Speaker"
                  value={
                    video.is_native_speaker
                      ? "Yes"
                      : "No"
                  }
                />

                {/* Original Captions */}

                <DetailLine
                  icon={
                    <Captions className="h-4 w-4" />
                  }
                  label="Original Captions"
                  value={
                    video.captions_original
                      ? "Yes"
                      : "No"
                  }
                />

                {/* Idioms */}

                <DetailLine
                  icon={
                    <MessageCircle className="h-4 w-4" />
                  }
                  label="Explains Idioms"
                  value={
                    video.explains_idioms
                      ? "Yes"
                      : "No"
                  }
                />

                {/* Technical */}

                <DetailLine
                  icon={
                    <Sparkles className="h-4 w-4" />
                  }
                  label="Technical Language"
                  value={
                    video.explains_technical_lingo
                      ? "Yes"
                      : "No"
                  }
                />

                {/* Profanity */}

                <DetailLine
                  icon={
                    <MessageCircle className="h-4 w-4"
                    />
                  }
                  label="Profanity"
                  value={
                    video.profanity
                      ? "Yes"
                      : "No"
                  }
                />

                {/* AI Voice */}

                <DetailLine
                  icon={
                    <Volume2 className="h-4 w-4" />
                  }
                  label="AI Voice"
                  value={
                    video.ai_voice
                      ? "Yes"
                      : "No"
                  }
                />

              </div>

              {/* =================================================
                  ACCESS
              ================================================== */}

              {!isFree && (
                <div className="mt-5 border-t border-border pt-5">

                  <p className="text-sm text-muted">
                    Channel subscription
                  </p>

                </div>
              )}

              {isFree && (
                <div className="mt-5 flex items-center gap-2 border-t border-border pt-5 text-sm font-medium text-foreground">

                  <Check className="h-4 w-4" />

                  Free to watch

                </div>
              )}

            </Card>

          </aside>

        </div>

        {/* =================================================
            RATINGS & REVIEWS
            FULL WIDTH
        ================================================== */}

        <section className="mt-10">

          <div className="border-b border-border pb-3">

            <h2 className="text-xl font-semibold text-foreground">
              Ratings & Reviews
            </h2>

          </div>

          <div className="py-6">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              <div>

                <div className="text-3xl font-bold text-foreground">
                  —
                </div>

                <div className="mt-2 flex gap-0.5 text-muted">

                  <Star className="h-4 w-4" />
                  <Star className="h-4 w-4" />
                  <Star className="h-4 w-4" />
                  <Star className="h-4 w-4" />
                  <Star className="h-4 w-4" />

                </div>

              </div>

              <div>

                <p className="font-medium text-foreground">
                  No reviews yet
                </p>

                <p className="mt-1 text-sm text-muted">
                  Be the first to rate and
                  review this video.
                </p>

              </div>

            </div>

            <Button
              variant="outline"
              className="mt-5 rounded-lg border-border"
            >
              Write a Review
            </Button>

          </div>

        </section>

        {/* =================================================
            RELATED VIDEOS
            FULL WIDTH
        ================================================== */}

        <section className="mt-8">

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
   Detail Line
========================================================= */

function DetailLine({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">

      <div className="mt-0.5 shrink-0 text-muted">
        {icon}
      </div>

      <div className="flex min-w-0 flex-1 items-start gap-2">

        <span className="shrink-0 text-sm text-muted">
          {label}:
        </span>

        <span className="min-w-0 text-sm font-medium leading-5 text-foreground">
          {value}
        </span>

      </div>

    </div>
  );
}