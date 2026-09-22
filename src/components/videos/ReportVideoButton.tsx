"use client";

import { useEffect, useState } from "react";
import { Check, Flag, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface ReportVideoButtonProps {
  videoId: string;
  isAuthenticated: boolean;
  translations: Record<string, string>;
}

const REPORT_REASONS = [
  {
    value: "spam",
    translationKey: "report.reason_spam",
  },
  {
    value: "inappropriate",
    translationKey: "report.reason_inappropriate",
  },
  {
    value: "copyright",
    translationKey: "report.reason_copyright",
  },
  {
    value: "harassment",
    translationKey: "report.reason_harassment",
  },
  {
    value: "violence",
    translationKey: "report.reason_violence",
  },
  {
    value: "misleading",
    translationKey: "report.reason_misleading",
  },
  {
    value: "other",
    translationKey: "report.reason_other",
  },
];

export default function ReportVideoButton({
  videoId,
  isAuthenticated,
  translations,
}: ReportVideoButtonProps) {
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setReason("");
    setDetails("");
    setError(null);
    setSubmitted(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    const checkExistingReport = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        return;
      }

      const { data, error } = await supabase
        .from("reports")
        .select("id")
        .eq("video_id", videoId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Failed to check report status:",
          error
        );
        return;
      }

      if (!cancelled) {
        setAlreadyReported(!!data);
      }
    };

    checkExistingReport();

    return () => {
      cancelled = true;
    };
  }, [videoId, isAuthenticated, supabase]);

  const handleOpen = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    resetForm();
    setOpen(true);
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!reason || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      const { error: insertError } = await supabase
        .from("reports")
        .insert({
          video_id: videoId,
          user_id: user.id,
          reason,
          description: details.trim() || null,
          status: "pending",
        });

      if (insertError) {
        console.error(
          "Failed to submit report:",
          {
            error: insertError,
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
          }
        );

        if (insertError.code === "23505") {
          setAlreadyReported(true);
          return;
        }

        setError(
          translations["report.submit_error"] ??
            "Unable to submit your report. Please try again."
        );

        return;
      }

      setSubmitted(true);
      setAlreadyReported(true);
      setReason("");
      setDetails("");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    setOpen(false);
    resetForm();
  };

  return (
    <>
      {/* Report button */}

      <button
        type="button"
        onClick={handleOpen}
        disabled={loading}
        aria-label={
          alreadyReported
            ? translations["report.reported"] ??
              "Video reported"
            : translations["report.report_video"] ??
              "Report video"
        }
        title={
          isAuthenticated
            ? alreadyReported
              ? translations["report.reported"] ??
                "Reported"
              : translations["report.report_video"] ??
                "Report video"
            : translations["report.login_to_report"] ??
              "Log in to report"
        }
        className={`
          inline-flex
          h-9
          items-center
          gap-2
          rounded-full
          px-3
          text-sm
          font-medium
          transition-all
          duration-150
          hover:bg-muted-bg
          active:scale-[0.96]
          disabled:cursor-wait
          disabled:opacity-60
          ${
            alreadyReported
              ? "text-foreground"
              : "text-secondary"
          }
        `}
      >
        {alreadyReported ? (
          <Flag className="h-4 w-4 fill-current" />
        ) : (
          <Flag className="h-4 w-4" />
        )}

        <span>
          {alreadyReported
            ? translations["report.reported"] ??
              "Reported"
            : translations["report.report"] ??
              "Report"}
        </span>
      </button>

      {/* Dialog */}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleClose();
            }
          }}
        >
          <div className="my-4 max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-xl">
            {/* Success */}

            {submitted ? (
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted-bg">
                  <Check className="h-6 w-6 text-foreground" />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {translations[
                    "report.submitted"
                  ] ?? "Report submitted"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                  {translations[
                    "report.submitted_description"
                  ] ??
                    "Thanks for helping keep NiceConvo safe. We'll review your report."}
                </p>

                <Button
                  type="button"
                  onClick={handleClose}
                  className="mt-6 rounded-lg"
                >
                  {translations["common.done"] ??
                    "Done"}
                </Button>
              </div>
            ) : alreadyReported ? (
              /* Already reported */

              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted-bg">
                  <Flag className="h-6 w-6 text-foreground" />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {translations[
                    "report.already_reported"
                  ] ?? "Already reported"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                  {translations[
                    "report.already_reported_description"
                  ] ??
                    "You have already reported this video. Our team will review it."}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="mt-6 rounded-lg"
                >
                  {translations["common.close"] ??
                    "Close"}
                </Button>
              </div>
            ) : (
              /* Form */

              <>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {translations[
                      "report.report_video"
                    ] ?? "Report video"}
                  </h2>

                  <p className="mt-1 text-sm text-muted">
                    {translations[
                      "report.description"
                    ] ??
                      "Tell us what's wrong with this video."}
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-5"
                >
                  {/* Reason */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {translations[
                        "report.reason_question"
                      ] ??
                        "Why are you reporting this video?"}
                    </label>

                    <div className="space-y-2">
                      {REPORT_REASONS.map(
                        (item) => (
                          <label
                            key={item.value}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm transition ${
                              reason ===
                              item.value
                                ? "border-foreground bg-muted-bg"
                                : "border-border hover:bg-muted-bg"
                            }`}
                          >
                            <input
                              type="radio"
                              name="report-reason"
                              value={
                                item.value
                              }
                              checked={
                                reason ===
                                item.value
                              }
                              onChange={(
                                event
                              ) =>
                                setReason(
                                  event.target
                                    .value
                                )
                              }
                              className="h-4 w-4"
                            />

                            <span className="text-foreground">
                              {translations[
                                item.translationKey
                              ] ??
                                item.value}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  {/* Description */}

                  <div>
                    <label
                      htmlFor="report-description"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      {translations[
                        "report.additional_details"
                      ] ?? "Additional details"}

                      <span className="ml-1 font-normal text-muted">
                        (
                        {translations[
                          "common.optional"
                        ] ?? "optional"}
                        )
                      </span>
                    </label>

                    <textarea
                      id="report-description"
                      value={details}
                      onChange={(event) =>
                        setDetails(
                          event.target.value
                        )
                      }
                      rows={4}
                      maxLength={1000}
                      placeholder={
                        translations[
                          "report.details_placeholder"
                        ] ??
                        "Tell us more about the issue..."
                      }
                      className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground"
                    />

                    <div className="mt-1 text-right text-xs text-muted">
                      {details.length}/1000
                    </div>
                  </div>

                  {/* Error */}

                  {error && (
                    <div className="rounded-lg border border-border bg-muted-bg px-3 py-2.5 text-sm text-foreground">
                      {error}
                    </div>
                  )}

                  {/* Actions */}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleClose}
                      disabled={loading}
                      className="rounded-lg"
                    >
                      {translations[
                          "channel_form.cancel"
                        ] ??
                        "Cancel"}
                    </Button>

                    <Button
                      type="submit"
                      disabled={
                        !reason || loading
                      }
                      className="rounded-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {translations[
                            "report.submitting"
                          ] ??
                            "Submitting..."}
                        </>
                      ) : (
                        <>
                          <Flag className="mr-2 h-4 w-4" />
                          {translations[
                            "report.submit"
                          ] ??
                            "Submit report"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}