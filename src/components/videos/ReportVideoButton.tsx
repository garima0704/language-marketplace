"use client";

import { useEffect, useState } from "react";
import { Check, Flag, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface ReportVideoButtonProps {
  videoId: string;
  isAuthenticated: boolean;
}

const REPORT_REASONS = [
  {
    value: "spam",
    label: "Spam or misleading",
  },
  {
    value: "inappropriate",
    label: "Inappropriate or offensive content",
  },
  {
    value: "copyright",
    label: "Copyright violation",
  },
  {
    value: "harassment",
    label: "Harassment or hateful content",
  },
  {
    value: "violence",
    label: "Violence or dangerous content",
  },
  {
    value: "misleading",
    label: "Misleading information",
  },
  {
    value: "other",
    label: "Other",
  },
];

export default function ReportVideoButton({
  videoId,
  isAuthenticated,
}: ReportVideoButtonProps) {
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Reset only the form state.
   *
   * Do NOT reset alreadyReported here because the user
   * should continue seeing "Reported" after closing the dialog.
   */
  const resetForm = () => {
    setReason("");
    setDetails("");
    setError(null);
    setSubmitted(false);
  };

  /*
   * Check whether the current user has already reported
   * this video when the component loads.
   */
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
        console.error("Failed to check report status:", error);
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

  /*
   * Open report dialog.
   */
  const handleOpen = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    resetForm();
    setOpen(true);
  };

  /*
   * Submit report.
   */
  const handleSubmit = async (event: React.FormEvent) => {
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
        console.error("Failed to submit report:", {
          error: insertError,
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });

        /*
         * User already reported this video.
         */
        if (insertError.code === "23505") {
          setAlreadyReported(true);
          return;
        }

        setError(
          insertError.message ||
            "Unable to submit your report. Please try again."
        );

        return;
      }

      /*
       * Report was successfully created.
       */
      setSubmitted(true);
      setAlreadyReported(true);
      setReason("");
      setDetails("");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Close dialog.
   */
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
            ? "Video reported"
            : "Report video"
        }
        title={
          isAuthenticated
            ? alreadyReported
              ? "Reported"
              : "Report video"
            : "Log in to report"
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
          {alreadyReported ? "Reported" : "Report"}
        </span>
      </button>

      {/* Dialog */}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
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
                  Report submitted
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Thanks for helping keep NiceConvo safe.
                  We&apos;ll review your report.
                </p>

                <Button
                  type="button"
                  onClick={handleClose}
                  className="mt-6 rounded-lg"
                >
                  Done
                </Button>
              </div>
            ) : alreadyReported ? (
              /* Already reported */

              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted-bg">
                  <Flag className="h-6 w-6 text-foreground" />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  Already reported
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                  You have already reported this video.
                  Our team will review it.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="mt-6 rounded-lg"
                >
                  Close
                </Button>
              </div>
            ) : (
              /* Form */

              <>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Report video
                  </h2>

                  <p className="mt-1 text-sm text-muted">
                    Tell us what&apos;s wrong with this video.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-5"
                >
                  {/* Reason */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Why are you reporting this video?
                    </label>

                    <div className="space-y-2">
                      {REPORT_REASONS.map((item) => (
                        <label
                          key={item.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm transition ${
                            reason === item.value
                              ? "border-foreground bg-muted-bg"
                              : "border-border hover:bg-muted-bg"
                          }`}
                        >
                          <input
                            type="radio"
                            name="report-reason"
                            value={item.value}
                            checked={reason === item.value}
                            onChange={(event) =>
                              setReason(event.target.value)
                            }
                            className="h-4 w-4"
                          />

                          <span className="text-foreground">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}

                  <div>
                    <label
                      htmlFor="report-description"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Additional details
                      <span className="ml-1 font-normal text-muted">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      id="report-description"
                      value={details}
                      onChange={(event) =>
                        setDetails(event.target.value)
                      }
                      rows={4}
                      maxLength={1000}
                      placeholder="Tell us more about the issue..."
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
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={!reason || loading}
                      className="rounded-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Flag className="mr-2 h-4 w-4" />
                          Submit report
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