"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Star } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface Rating {
  id: string;
  video_id: string;
  user_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
}

interface VideoRatingsProps {
  videoId: string;
  isAuthenticated: boolean;
  translations: Record<string, string>;
}

function getDisplayName(
  rating: Rating,
  translations: Record<string, string>
) {
  return (
    rating.profile?.display_name ||
    rating.profile?.username ||
    translations["rating.user"]
  );
}

export default function VideoRatings({
  videoId,
  isAuthenticated,
  translations,
}: VideoRatingsProps) {
  const supabase = createClient();

  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userId, setUserId] = useState<string | null>(
    null
  );

  const [selectedRating, setSelectedRating] =
    useState(0);

  const [review, setReview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const loadRatings = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      setUserId(user?.id ?? null);

      const {
        data,
        error: ratingsError,
      } = await supabase
        .from("ratings")
        .select(`
          id,
          video_id,
          user_id,
          rating,
          review,
          created_at,
          updated_at,
          profiles (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq("video_id", videoId)
        .order("created_at", {
          ascending: false,
        });

      if (ratingsError) {
        throw ratingsError;
      }

      const normalizedRatings =
        (data ?? []).map((item: any) => ({
          ...item,
          profile: Array.isArray(item.profiles)
            ? item.profiles[0] ?? null
            : item.profiles ?? null,
        }));

      setRatings(normalizedRatings);

      if (user) {
        const ownRating =
          normalizedRatings.find(
            (item: Rating) =>
              item.user_id === user.id
          );

        if (ownRating) {
          setSelectedRating(
            ownRating.rating
          );

          setReview(
            ownRating.review ?? ""
          );
        }
      }
    } catch (err) {
      console.error(
        "Failed to load ratings:",
        err
      );

      setError(
        translations["rating.loading_error"]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRatings();
  }, [videoId]);

  const averageRating = useMemo(() => {
    if (!ratings.length) {
      return 0;
    }

    const total = ratings.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    return total / ratings.length;
  }, [ratings]);

  const distribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map(
      (rating) => ({
        rating,
        count: ratings.filter(
          (item) =>
            item.rating === rating
        ).length,
      })
    );
  }, [ratings]);

  const ownRating = ratings.find(
    (item) => item.user_id === userId
  );

  const submitRating = async () => {
    if (!isAuthenticated) {
      setError(
        translations["rating.login_error"]
      );
      return;
    }

    if (
      selectedRating < 1 ||
      selectedRating > 5
    ) {
      setError(
        translations["rating.select_error"]
      );
      return;
    }

    if (
      review.trim().length > 0 &&
      review.trim().length < 3
    ) {
      setError(
        translations["rating.review_min_error"]
      );
      return;
    }

    if (review.length > 2000) {
      setError(
        translations["rating.review_max_error"]
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          translations["rating.login_error"]
        );
      }

      const payload = {
        video_id: videoId,
        user_id: user.id,
        rating: selectedRating,
        review:
          review.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const {
        error: saveError,
      } = await supabase
        .from("ratings")
        .upsert(payload, {
          onConflict:
            "video_id,user_id",
        });

      if (saveError) {
        throw saveError;
      }

      setEditing(false);

      await loadRatings();
    } catch (err: any) {
      console.error(
        "Failed to save rating:",
        err
      );

      setError(
        err?.message ||
          translations["rating.save_error"]
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    if (ownRating) {
      setSelectedRating(
        ownRating.rating
      );

      setReview(
        ownRating.review ?? ""
      );
    }

    setEditing(true);
    setError(null);
  };

  return (
    <section className="mt-8">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-xl font-semibold text-foreground">
          {translations["rating.title"]}
        </h2>

        <span className="text-sm text-muted">
          {ratings.length}{" "}
          {ratings.length === 1
            ? translations["rating.rating"]
            : translations["rating.ratings"]}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted" />
        </div>
      ) : (
        <>
{/* =====================================================
    RATING SUMMARY + RATE VIDEO
===================================================== */}

<div className="grid gap-8 lg:grid-cols-2">

  {/* ===================================================
      LEFT — RATING SUMMARY
  =================================================== */}

  <div className="rounded-xl bg-muted-bg p-6">

    <div className="text-5xl font-bold tracking-tight text-foreground">
      {ratings.length
        ? averageRating.toFixed(1)
        : "—"}
    </div>

    <div className="mt-3 flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= Math.round(averageRating)
              ? "fill-current text-rating"
              : "text-muted"
          }`}
        />
      ))}
    </div>

    <p className="mt-2 text-sm text-muted">
      {ratings.length
        ? `${ratings.length} ${
            ratings.length === 1
              ? translations["rating.rating"]
              : translations["rating.ratings"]
          }`
        : translations["rating.no_ratings"]}
    </p>

    {/* Distribution */}

    <div className="mt-6 space-y-2">

      {distribution.map(({ rating, count }) => {
        const percentage = ratings.length
          ? (count / ratings.length) * 100
          : 0;

        return (
          <div
            key={rating}
            className="flex items-center gap-2 text-xs"
          >
            <span className="w-3 text-muted">
              {rating}
            </span>

            <Star className="h-3 w-3 fill-current text-rating" />

            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-rating"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

            <span className="w-6 text-right text-muted">
              {count}
            </span>
          </div>
        );
      })}

    </div>

  </div>


  {/* ===================================================
      RIGHT — RATE THIS VIDEO
  =================================================== */}

  <div className="rounded-xl border border-border p-6">

    <div className="flex items-center justify-between gap-3">

      <div>
        <h3 className="text-base font-semibold text-foreground">
          {ownRating && !editing
            ? translations["rating.your_rating"]
            : translations["rating.rate_video"]}
        </h3>

        {!isAuthenticated && (
          <p className="mt-1 text-sm text-muted">
            {translations["rating.login_to_rate"]}
          </p>
        )}
      </div>

      {ownRating &&
        !editing &&
        isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            onClick={startEditing}
            className="rounded-lg"
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            {translations["rating.edit"]}
          </Button>
        )}

    </div>


    {isAuthenticated && (
      <>

        {/* Stars */}

        <div className="mt-5 flex gap-1">

          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={
                saving ||
                (!editing && !!ownRating)
              }
              onClick={() =>
                setSelectedRating(star)
              }
              className="rounded-md p-1 transition hover:bg-muted-bg disabled:cursor-default"
              aria-label={translations[
                "rating.rating_aria"
              ].replace("{count}", String(star))}
            >
              <Star
                className={`h-7 w-7 ${
                  star <= selectedRating
                    ? "fill-current text-rating"
                    : "text-muted"
                }`}
              />
            </button>
          ))}

        </div>


        {/* Review */}

        {(editing || !ownRating) && (
          <>
            <textarea
              value={review}
              onChange={(event) =>
                setReview(event.target.value)
              }
              maxLength={2000}
              placeholder={translations[
                "rating.review_placeholder"
              ]}
              className="mt-5 min-h-[110px] w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground"
            />

            <div className="mt-2 flex items-center justify-between">

              <span className="text-xs text-muted">
                {review.length}/2000
              </span>

              <div className="flex gap-2">

                {editing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    className="rounded-lg"
                  >
                    {translations["channel_form.cancel"]}
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  onClick={submitRating}
                  disabled={saving}
                  className="rounded-lg"
                >
                  {saving && (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  )}

                  {ownRating
                    ? translations["rating.update"]
                    : translations["rating.submit"]}
                </Button>

              </div>

            </div>
          </>
        )}


        {/* Existing user's review */}

        {ownRating &&
          !editing &&
          ownRating.review && (
            <p className="mt-4 text-sm leading-6 text-secondary">
              {ownRating.review}
            </p>
          )}

      </>
    )}

    {error && (
      <p className="mt-3 text-sm text-red-600">
        {error}
      </p>
    )}

  </div>

</div>

          {/* Reviews */}
          {ratings.length > 0 && (
            <div className="mt-8">

              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  {translations["rating.reviews"]}
                </h3>
              </div>

              <div className="divide-y divide-border">

                {ratings
                  .filter(
                    (item) =>
                      item.review
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className="py-5 first:pt-0"
                    >

                      <div className="flex items-center justify-between gap-3">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted-bg text-xs font-semibold text-foreground">

                            {item.profile
                              ?.avatar_url ? (
                              <img
                                src={
                                  item
                                    .profile
                                    .avatar_url
                                }
                                alt={getDisplayName(item, translations)}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getDisplayName(item, translations)
                                .slice(0, 2)
                                .toUpperCase()
                            )}

                          </div>

                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {getDisplayName(item, translations)}
                            </p>

                            <p className="text-xs text-muted">
                              {formatTimeAgo(
                                item.created_at
                              )}
                            </p>
                          </div>

                        </div>

                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(
                            (star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <=
                                  item.rating
                                    ? "fill-current text-rating"
                                    : "text-muted"
                                }`}
                              />
                            )
                          )}
                        </div>

                      </div>

                      <p className="mt-3 text-sm leading-6 text-secondary">
                        {item.review}
                      </p>

                    </div>
                  ))}

              </div>

            </div>
          )}

          {!ratings.length && (
            <div className="mt-6 rounded-xl border border-dashed border-border p-6 text-center">
              <p className="font-medium text-foreground">
                {translations["rating.first_to_rate"]}
              </p>

              <p className="mt-1 text-sm text-muted">
                {translations["rating.first_to_rate_description"]}
              </p>
            </div>
          )}

        </>
      )}

    </section>
  );
}