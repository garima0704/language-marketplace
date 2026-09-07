"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createClient } from "@/lib/supabase/client";

import LanguageRegionSelector from "@/components/seller/LanguageRegionSelector";
import CategorySelector from "@/components/seller/CategorySelector";

type Channel = {
  id: string;
  channel_name: string;
};

type Language = {
  code: string;
  name: string;
};

type LanguageRegion = {
  id: number;
  language_code: string;
  country: string;
  state: string | null;
  sort_order: number | null;
};

type Category = {
  id: string;
  parent_id: string | null;
  level: number;
  display_order: number;
};

type CategoryTranslation = {
  category_id: string;
  locale_code: string;
  name: string;
};

type Video = {
  id: string;
  channel_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_provider: string;
  video_id: string;
  language_code: string;
  language_region_id: number | null;
  is_native_speaker: boolean;
  level: string;
  captions_original: boolean;
  subtitle_language_code: string | null;
  explains_idioms: boolean;
  explains_technical_lingo: boolean;
  profanity: boolean;
  ai_voice: boolean;
  access_type: string;
  status: string;
};

type Props = {
  video: Video;
  channels: Channel[];
  languages: Language[];
  languageRegions: LanguageRegion[];
  categories: Category[];
  categoryTranslations: CategoryTranslation[];
};

const steps = [
  {
    number: 1,
    title: "Video",
  },
  {
    number: 2,
    title: "Details",
  },
  {
    number: 3,
    title: "Language",
  },
  {
    number: 4,
    title: "Learning",
  },
  {
    number: 5,
    title: "Category & Access",
  },
];

export default function EditVideoForm({
  video,
  channels,
  languages,
  languageRegions,
  categories,
  categoryTranslations,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  // --------------------------------------------------
  // Step
  // --------------------------------------------------

  const [currentStep, setCurrentStep] = useState(1);

  // --------------------------------------------------
  // Video
  // --------------------------------------------------

  const [videoFile, setVideoFile] =
    useState<File | null>(null);

  const [videoUploading, setVideoUploading] =
    useState(false);

  // --------------------------------------------------
  // Thumbnail
  // --------------------------------------------------

  const [thumbnailFile, setThumbnailFile] =
    useState<File | null>(null);

  const [thumbnailPreview, setThumbnailPreview] =
    useState<string | null>(
      video.thumbnail_url
    );

  // --------------------------------------------------
  // Details
  // --------------------------------------------------

  const [title, setTitle] =
    useState(video.title);

  const [description, setDescription] =
    useState(video.description ?? "");

  const [channelId, setChannelId] =
    useState(video.channel_id);

  // --------------------------------------------------
  // Learning
  // --------------------------------------------------

  const [level, setLevel] =
    useState(video.level ?? "");

  const [isNativeSpeaker, setIsNativeSpeaker] =
    useState(video.is_native_speaker);

  const [captionsOriginal, setCaptionsOriginal] =
    useState(video.captions_original);

  const [subtitleLanguageCode, setSubtitleLanguageCode] =
    useState(
      video.subtitle_language_code ?? ""
    );

  const [explainsIdioms, setExplainsIdioms] =
    useState(video.explains_idioms);

  const [
    explainsTechnicalLingo,
    setExplainsTechnicalLingo,
  ] = useState(
    video.explains_technical_lingo
  );

  const [profanity, setProfanity] =
    useState(video.profanity);

  const [aiVoice, setAiVoice] =
    useState(video.ai_voice);

  // --------------------------------------------------
  // Access
  // --------------------------------------------------

  const [accessType, setAccessType] =
    useState(video.access_type);

  // --------------------------------------------------
  // Status
  // --------------------------------------------------

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // Step navigation
  // --------------------------------------------------

  function nextStep() {
    setError("");

    setCurrentStep((step) =>
      Math.min(step + 1, steps.length)
    );
  }

  function previousStep() {
    setError("");

    setCurrentStep((step) =>
      Math.max(step - 1, 1)
    );
  }

  // --------------------------------------------------
  // Thumbnail cleanup
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      if (
        thumbnailPreview?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          thumbnailPreview
        );
      }
    };
  }, [thumbnailPreview]);

  // --------------------------------------------------
  // Generate thumbnail
  // Same behavior as NewVideoForm
  // --------------------------------------------------

  async function generateThumbnail(
    file: File
  ): Promise<File> {
    return new Promise(
      (resolve, reject) => {
        const videoElement =
          document.createElement("video");

        videoElement.preload = "metadata";
        videoElement.muted = true;
        videoElement.playsInline = true;

        const videoUrl =
          URL.createObjectURL(file);

        videoElement.src = videoUrl;

        videoElement.onloadedmetadata =
          () => {
            const targetTime =
              Math.max(
                0,
                Math.min(
                  videoElement.duration *
                    0.1,
                  videoElement.duration -
                    0.1
                )
              );

            videoElement.currentTime =
              targetTime;
          };

        videoElement.onseeked = () => {
          try {
            const canvas =
              document.createElement(
                "canvas"
              );

            canvas.width =
              videoElement.videoWidth;

            canvas.height =
              videoElement.videoHeight;

            const context =
              canvas.getContext("2d");

            if (!context) {
              throw new Error(
                "Could not create canvas context."
              );
            }

            context.drawImage(
              videoElement,
              0,
              0,
              canvas.width,
              canvas.height
            );

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(
                    new Error(
                      "Could not generate thumbnail."
                    )
                  );

                  return;
                }

                const thumbnail =
                  new File(
                    [blob],
                    `${
                      file.name.replace(
                        /\.[^/.]+$/,
                        ""
                      )
                    }-thumbnail.jpg`,
                    {
                      type: "image/jpeg",
                    }
                  );

                resolve(thumbnail);

                URL.revokeObjectURL(
                  videoUrl
                );
              },
              "image/jpeg",
              0.85
            );
          } catch (error) {
            URL.revokeObjectURL(
              videoUrl
            );

            reject(error);
          }
        };

        videoElement.onerror = () => {
          URL.revokeObjectURL(
            videoUrl
          );

          reject(
            new Error(
              "Could not load video."
            )
          );
        };
      }
    );
  }

  // --------------------------------------------------
  // Video replacement
  // --------------------------------------------------

  async function handleVideoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] ?? null;

    setVideoFile(file);
    setError("");

    if (!file) {
      return;
    }

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (
      !allowedVideoTypes.includes(
        file.type
      )
    ) {
      setError(
        "Please select an MP4, WebM, or MOV video."
      );

      event.target.value = "";
      setVideoFile(null);

      return;
    }

    if (
      file.size >
      2 * 1024 * 1024 * 1024
    ) {
      setError(
        "Video size must be 2 GB or less."
      );

      event.target.value = "";
      setVideoFile(null);

      return;
    }

    try {
      const thumbnail =
        await generateThumbnail(file);

      setThumbnailFile(thumbnail);

      if (
        thumbnailPreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          thumbnailPreview
        );
      }

      const previewUrl =
        URL.createObjectURL(
          thumbnail
        );

      setThumbnailPreview(
        previewUrl
      );
    } catch (error) {
      console.error(
        "THUMBNAIL GENERATION ERROR:",
        error
      );

      setError(
        "Could not generate video thumbnail."
      );
    }
  }

  // --------------------------------------------------
  // Thumbnail
  // --------------------------------------------------

  function handleThumbnailChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Please upload a JPG, PNG, or WEBP image."
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Thumbnail size must be 5 MB or less."
      );

      event.target.value = "";

      return;
    }

    setError("");

    if (
      thumbnailPreview?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        thumbnailPreview
      );
    }

    setThumbnailFile(file);

    setThumbnailPreview(
      URL.createObjectURL(file)
    );
  }

  // --------------------------------------------------
  // Save changes
  // --------------------------------------------------

  async function handleSave(shouldPublish = false) {
    if (saving || deleting) {
      return;
    }

    setSaving(true);
    setError("");

    let uploadedVideoPath:
      | string
      | null = null;

    let uploadedThumbnailPath:
      | string
      | null = null;

    try {
      // --------------------------------------------
      // Basic validation
      // --------------------------------------------

      if (!title.trim()) {
        setError(
          "Video title is required."
        );

        return;
      }

      if (!channelId) {
        setError(
          "Please select a channel."
        );

        return;
      }

      if (!level) {
        setError(
          "Please select a level."
        );

        return;
      }

      // --------------------------------------------
      // Language
      // --------------------------------------------

      const languageCode =
        document.querySelector<HTMLInputElement>(
          '[name="language_code"]'
        )?.value;

      const languageRegionId =
        document.querySelector<HTMLInputElement>(
          '[name="language_region_id"]'
        )?.value;

      // --------------------------------------------
      // Category
      // --------------------------------------------

      const categoryId =
        document.querySelector<HTMLInputElement>(
          '[name="category_id"]'
        )?.value;

      if (!languageCode) {
        setError(
          "Please select a language."
        );

        return;
      }

      if (!languageRegionId) {
        setError(
          "Please select a language region."
        );

        return;
      }

      if (!categoryId) {
        setError(
          "Please select a category."
        );

        return;
      }

      // --------------------------------------------
      // Existing video
      // --------------------------------------------

      const oldVideoPath =
        video.video_provider ===
        "supabase"
          ? video.video_id
          : null;

      let newVideoPath =
        video.video_id;

      // --------------------------------------------
      // Replace video
      // --------------------------------------------

      if (videoFile) {
        setVideoUploading(true);

        const fileExtension =
          videoFile.type ===
          "video/webm"
            ? "webm"
            : videoFile.type ===
                "video/quicktime"
              ? "mov"
              : "mp4";

        const uniqueSuffix =
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;

        newVideoPath =
          `${video.id}/video-${uniqueSuffix}.${fileExtension}`;

        const {
          error: videoUploadError,
        } = await supabase.storage
          .from("videos")
          .upload(
            newVideoPath,
            videoFile,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                videoFile.type ||
                "video/mp4",
            }
          );

        if (videoUploadError) {
          throw new Error(
            `Video upload failed: ${videoUploadError.message}`
          );
        }

        uploadedVideoPath =
          newVideoPath;
      }

      // --------------------------------------------
      // Replace thumbnail
      // --------------------------------------------

      let newThumbnailUrl =
        video.thumbnail_url;

      if (thumbnailFile) {
        const thumbnailFileName =
          `${crypto.randomUUID()}-thumbnail.jpg`;

        const thumbnailPath =
          `${video.id}/${thumbnailFileName}`;

        const {
          error: thumbnailUploadError,
        } = await supabase.storage
          .from("video-thumbnails")
          .upload(
            thumbnailPath,
            thumbnailFile,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                thumbnailFile.type ||
                "image/jpeg",
            }
          );

        if (
          thumbnailUploadError
        ) {
          throw new Error(
            `Thumbnail upload failed: ${thumbnailUploadError.message}`
          );
        }

        uploadedThumbnailPath =
          thumbnailPath;

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("video-thumbnails")
          .getPublicUrl(
            thumbnailPath
          );

        newThumbnailUrl =
          publicUrlData.publicUrl;
      }

      // --------------------------------------------
      // Update database
      // --------------------------------------------

      const {
        error: updateError,
      } = await supabase
        .from("videos")
        .update({
          channel_id: channelId,

          category_id: categoryId,

          title: title.trim(),

          description:
            description.trim() ||
            null,

          language_code:
            languageCode,

          language_region_id:
            Number(
              languageRegionId
            ),

          is_native_speaker:
            isNativeSpeaker,

          level,

          captions_original:
            captionsOriginal,

          subtitle_language_code:
            subtitleLanguageCode ||
            null,

          explains_idioms:
            explainsIdioms,

          explains_technical_lingo:
            explainsTechnicalLingo,

          profanity,

          ai_voice: aiVoice,

          access_type:
            accessType,

          video_id:
            newVideoPath,

          video_provider:
            videoFile
              ? "supabase"
              : video.video_provider,

          thumbnail_url:
            newThumbnailUrl,

          status:
            shouldPublish
              ? "published"
              : video.status,

          published_at:
            shouldPublish
              ? new Date().toISOString()
              : null,
        })
        .eq("id", video.id);

      if (updateError) {
        throw new Error(
          `Failed to save video: ${updateError.message}`
        );
      }

      // --------------------------------------------
      // Delete old video
      // --------------------------------------------

      if (
        videoFile &&
        oldVideoPath &&
        oldVideoPath !==
          newVideoPath
      ) {
        const {
          error:
            oldVideoDeleteError,
        } = await supabase.storage
          .from("videos")
          .remove([
            oldVideoPath,
          ]);

        if (
          oldVideoDeleteError
        ) {
          console.error(
            "Could not delete old video:",
            oldVideoDeleteError.message
          );
        }
      }

      // --------------------------------------------
      // Delete old thumbnails
      // Keep newly uploaded thumbnail
      // --------------------------------------------

      if (thumbnailFile) {
        const {
          data: thumbnailFiles,
          error:
            thumbnailListError,
        } = await supabase.storage
          .from("video-thumbnails")
          .list(video.id);

        if (
          thumbnailListError
        ) {
          console.error(
            "Could not list old thumbnails:",
            thumbnailListError.message
          );
        } else if (
          thumbnailFiles &&
          thumbnailFiles.length > 0
        ) {
          const oldThumbnailPaths =
            thumbnailFiles
              .map(
                (file) =>
                  `${video.id}/${file.name}`
              )
              .filter(
                (path) =>
                  path !==
                  uploadedThumbnailPath
              );

          if (
            oldThumbnailPaths.length >
            0
          ) {
            const {
              error:
                thumbnailDeleteError,
            } =
              await supabase.storage
                .from(
                  "video-thumbnails"
                )
                .remove(
                  oldThumbnailPaths
                );

            if (
              thumbnailDeleteError
            ) {
              console.error(
                "Could not delete old thumbnails:",
                thumbnailDeleteError.message
              );
            }
          }
        }
      }

      // --------------------------------------------
      // Success
      // --------------------------------------------

      setVideoUploading(false);

      alert(
        shouldPublish
          ? "Video published successfully!"
          : videoFile
            ? "Video replaced and updated successfully."
            : "Video updated successfully."
      );

      router.push("/seller/videos");

      router.refresh();
    } catch (err) {
      console.error(
        "UPDATE VIDEO ERROR:",
        err
      );

      // --------------------------------------------
      // Rollback video
      // --------------------------------------------

      if (uploadedVideoPath) {
        const {
          error:
            rollbackVideoError,
        } = await supabase.storage
          .from("videos")
          .remove([
            uploadedVideoPath,
          ]);

        if (
          rollbackVideoError
        ) {
          console.error(
            "Could not rollback uploaded video:",
            rollbackVideoError.message
          );
        }
      }

      // --------------------------------------------
      // Rollback thumbnail
      // --------------------------------------------

      if (
        uploadedThumbnailPath
      ) {
        const {
          error:
            rollbackThumbnailError,
        } = await supabase.storage
          .from("video-thumbnails")
          .remove([
            uploadedThumbnailPath,
          ]);

        if (
          rollbackThumbnailError
        ) {
          console.error(
            "Could not rollback uploaded thumbnail:",
            rollbackThumbnailError.message
          );
        }
      }

      setVideoUploading(false);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the video."
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Delete video
  // --------------------------------------------------

  async function handleDelete() {
    if (deleting || saving) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      // --------------------------------------------
      // Delete thumbnails
      // --------------------------------------------

      const {
        data: thumbnailFiles,
        error:
          thumbnailListError,
      } = await supabase.storage
        .from("video-thumbnails")
        .list(video.id);

      if (thumbnailListError) {
        throw new Error(
          `Could not access video thumbnail: ${thumbnailListError.message}`
        );
      }

      if (
        thumbnailFiles &&
        thumbnailFiles.length > 0
      ) {
        const thumbnailPaths =
          thumbnailFiles.map(
            (file) =>
              `${video.id}/${file.name}`
          );

        const {
          error:
            thumbnailDeleteError,
        } = await supabase.storage
          .from("video-thumbnails")
          .remove(
            thumbnailPaths
          );

        if (
          thumbnailDeleteError
        ) {
          throw new Error(
            `Could not delete thumbnail: ${thumbnailDeleteError.message}`
          );
        }
      }

      // --------------------------------------------
      // Delete video file
      // --------------------------------------------

      if (
        video.video_provider ===
          "supabase" &&
        video.video_id
      ) {
        const {
          error:
            videoFileDeleteError,
        } = await supabase.storage
          .from("videos")
          .remove([
            video.video_id,
          ]);

        if (
          videoFileDeleteError
        ) {
          throw new Error(
            `Could not delete video file: ${videoFileDeleteError.message}`
          );
        }
      }

      // --------------------------------------------
      // Delete database row
      // --------------------------------------------

      const {
        error: deleteError,
      } = await supabase
        .from("videos")
        .delete()
        .eq("id", video.id);

      if (deleteError) {
        throw new Error(
          `Could not delete video: ${deleteError.message}`
        );
      }

      alert(
        "Video deleted successfully."
      );

      router.push(
        "/seller/videos"
      );

      router.refresh();
    } catch (err) {
      console.error(
        "DELETE VIDEO ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this video."
      );

      setDeleting(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-8">

      {/* ==================================================
          STEPPER
      ================================================== */}

      <div className="rounded-xl border bg-background p-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {steps.map(
            (step, index) => {
              const isActive =
                currentStep ===
                step.number;

              const isCompleted =
                currentStep >
                step.number;

              return (
                <div
                  key={step.number}
                  className="flex min-w-fit flex-1 items-center"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        isCompleted
                      ) {
                        setCurrentStep(
                          step.number
                        );
                        setError("");
                      }
                    }}
                    disabled={
                      !isCompleted &&
                      !isActive
                    }
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium ${
                        isActive
                          ? "border-primary bg-primary text-white"
                          : isCompleted
                            ? "border-primary bg-primary text-white"
                            : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {isCompleted
                        ? "✓"
                        : step.number}
                    </span>

                    <span
                      className={`hidden text-sm font-medium sm:inline ${
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>

                  {index <
                    steps.length -
                      1 && (
                    <div
                      className={`mx-3 h-px flex-1 ${
                        currentStep >
                        step.number
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* ==================================================
          STEP 1 — VIDEO
      ================================================== */}

      <div
        className={
          currentStep === 1
            ? "block"
            : "hidden"
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>
              Video
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Current Video */}

            <div>
              <p className="mb-3 text-sm font-medium">
                Current Video
              </p>

              <div className="rounded-xl border border-border bg-muted-bg p-4">
                <p className="text-sm text-foreground">
                  The current video file is
                  already uploaded.
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Select a new video below
                  if you want to replace
                  the current video.
                </p>
              </div>
            </div>

            {/* Replace Video */}

            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Replace Video
              </label>

              <Input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={
                  handleVideoChange
                }
                disabled={
                  saving ||
                  deleting
                }
              />

              {videoFile && (
                <div className="rounded-lg border border-border bg-muted-bg p-3">
                  <p className="text-sm font-medium">
                    New video selected
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {videoFile.name}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {(
                      videoFile.size /
                      (1024 * 1024)
                    ).toFixed(
                      2
                    )}{" "}
                    MB
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Leave this empty if you
                do not want to replace
                the current video.
              </p>
            </div>

            {/* Thumbnail */}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">
                  Thumbnail
                </p>

                {thumbnailPreview && (
                  <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
                    Change Thumbnail

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={
                        handleThumbnailChange
                      }
                      disabled={
                        saving ||
                        deleting
                      }
                    />
                  </label>
                )}
              </div>

              {thumbnailPreview && (
                <div className="overflow-hidden rounded-xl border">
                  <img
                    src={
                      thumbnailPreview
                    }
                    alt="Video thumbnail preview"
                    className="aspect-video w-full object-cover"
                  />
                </div>
              )}

              {!thumbnailPreview && (
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleThumbnailChange
                  }
                  disabled={
                    saving ||
                    deleting
                  }
                />
              )}

              <p className="mt-2 text-xs text-muted-foreground">
                JPG, PNG or WEBP.
                Maximum 5 MB.
              </p>

              {videoFile && (
                <p className="mt-1 text-xs text-muted-foreground">
                  A thumbnail was
                  automatically generated
                  from the new video. You
                  can change it if you
                  prefer.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================================================
          STEP 2 — DETAILS
      ================================================== */}

      <div
        className={
          currentStep === 2
            ? "block"
            : "hidden"
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>
              Video Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            {/* Title */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <Input
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="Enter video title"
                disabled={
                  saving ||
                  deleting
                }
              />
            </div>

            {/* Description */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <Textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={6}
                placeholder="Describe what learners will learn in this video"
                disabled={
                  saving ||
                  deleting
                }
              />
            </div>

            {/* Channel */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Channel
              </label>

              <select
                value={channelId}
                onChange={(e) =>
                  setChannelId(
                    e.target.value
                  )
                }
                disabled={
                  saving ||
                  deleting
                }
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">
                  Select Channel
                </option>

                {channels.map(
                  (channel) => (
                    <option
                      key={
                        channel.id
                      }
                      value={
                        channel.id
                      }
                    >
                      {
                        channel.channel_name
                      }
                    </option>
                  )
                )}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================================================
          STEP 3 — LANGUAGE
      ================================================== */}

      <div
        className={
          currentStep === 3
            ? "block"
            : "hidden"
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>
              Language
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            <LanguageRegionSelector
              languages={
                languages
              }
              languageRegions={
                languageRegions
              }
              initialLanguageCode={
                video.language_code
              }
              initialRegionId={
                video.language_region_id
              }
            />

            {/* Native Speaker */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Native Speaker
              </label>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={
                      isNativeSpeaker
                    }
                    onChange={() =>
                      setIsNativeSpeaker(
                        true
                      )
                    }
                    disabled={
                      saving ||
                      deleting
                    }
                    className="h-4 w-4 accent-primary"
                  />

                  Yes
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={
                      !isNativeSpeaker
                    }
                    onChange={() =>
                      setIsNativeSpeaker(
                        false
                      )
                    }
                    disabled={
                      saving ||
                      deleting
                    }
                    className="h-4 w-4 accent-primary"
                  />

                  No
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================================================
          STEP 4 — LEARNING
      ================================================== */}

      <div
        className={
          currentStep === 4
            ? "block"
            : "hidden"
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>
              Learning Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Level */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Level
              </label>

              <select
                value={level}
                onChange={(e) =>
                  setLevel(
                    e.target.value
                  )
                }
                disabled={
                  saving ||
                  deleting
                }
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">
                  Select Level
                </option>

                <option value="beginner">
                  Beginner
                </option>

                <option value="intermediate">
                  Intermediate
                </option>

                <option value="advanced">
                  Advanced
                </option>
              </select>
            </div>

            {/* Captions */}

            <RadioSetting
              label="Captions for Original Language"
              value={
                captionsOriginal
              }
              onChange={
                setCaptionsOriginal
              }
              disabled={
                saving ||
                deleting
              }
            />

            {/* Subtitles */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Subtitles for Second Language
              </label>

              <select
                value={
                  subtitleLanguageCode
                }
                onChange={(e) =>
                  setSubtitleLanguageCode(
                    e.target.value
                  )
                }
                disabled={
                  saving ||
                  deleting
                }
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">
                  No subtitles
                </option>

                {languages.map(
                  (language) => (
                    <option
                      key={
                        language.code
                      }
                      value={
                        language.code
                      }
                    >
                      {
                        language.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Idioms */}

            <RadioSetting
              label="Explains Original Language Idioms"
              value={
                explainsIdioms
              }
              onChange={
                setExplainsIdioms
              }
              disabled={
                saving ||
                deleting
              }
            />

            {/* Technical Lingo */}

            <RadioSetting
              label="Explains Technical Lingo"
              value={
                explainsTechnicalLingo
              }
              onChange={
                setExplainsTechnicalLingo
              }
              disabled={
                saving ||
                deleting
              }
            />

            {/* Profanity */}

            <RadioSetting
              label="Profanity"
              value={
                profanity
              }
              onChange={
                setProfanity
              }
              disabled={
                saving ||
                deleting
              }
            />

            {/* AI Voice */}

            <RadioSetting
              label="AI Voice"
              value={
                aiVoice
              }
              onChange={
                setAiVoice
              }
              disabled={
                saving ||
                deleting
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* ==================================================
          STEP 5 — CATEGORY & ACCESS
      ================================================== */}

      <div
        className={
          currentStep === 5
            ? "block"
            : "hidden"
        }
      >
        <div className="space-y-6">

          {/* Category */}

          <Card>
            <CardHeader>
              <CardTitle>
                Category
              </CardTitle>
            </CardHeader>

            <CardContent>
              <CategorySelector
                categories={
                  categories
                }
                translations={
                  categoryTranslations
                }
                localeCode="en"
                initialCategoryId={
                  video.category_id ??
                  ""
                }
              />
            </CardContent>
          </Card>

          {/* Access */}

          <Card>
            <CardHeader>
              <CardTitle>
                Access
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">

                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={
                      accessType ===
                      "subscriber"
                    }
                    onChange={() =>
                      setAccessType(
                        "subscriber"
                      )
                    }
                    disabled={
                      saving ||
                      deleting
                    }
                  />

                  Subscribers Only
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={
                      accessType ===
                      "free"
                    }
                    onChange={() =>
                      setAccessType(
                        "free"
                      )
                    }
                    disabled={
                      saving ||
                      deleting
                    }
                  />

                  Free Preview
                </label>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ==================================================
          NAVIGATION
      ================================================== */}

      <div className="flex items-center justify-between pt-6">

        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              disabled={
                saving ||
                deleting
              }
              onClick={
                previousStep
              }
            >
              ← Previous
            </Button>
          )}
        </div>

        <div className="flex gap-3">

          {currentStep <
            steps.length ? (
            <Button
              type="button"
              disabled={
                saving ||
                deleting
              }
              onClick={
                nextStep
              }
            >
              Next →
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={
                  saving ||
                  videoUploading ||
                  deleting
                }
              >
                {videoUploading
                  ? "Uploading Video..."
                  : saving
                    ? "Saving..."
                    : "Save Changes"}
              </Button>

              {video.status === "draft" && (
                <Button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={
                    saving ||
                    videoUploading ||
                    deleting
                  }
                >
                  {saving
                    ? "Publishing..."
                    : "Publish Video"}
                </Button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ==================================================
          DANGER ZONE
      ================================================== */}

      <div className="rounded-2xl border border-red-200 bg-background p-8 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-red-700">
            Danger Zone
          </h2>

          <p className="mt-1 text-sm text-muted">
            Permanently remove this
            video from your channel.
          </p>
        </div>

        {!showDeleteConfirm ? (
          <Button
            type="button"
            variant="destructive"
            disabled={
              saving ||
              deleting
            }
            onClick={() =>
              setShowDeleteConfirm(
                true
              )
            }
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete Video
          </Button>
        ) : (
          <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-5">

            <div>
              <p className="font-semibold text-red-900">
                Delete "{video.title}"?
              </p>

              <p className="mt-1 text-sm text-red-700">
                This action cannot be
                undone. The video,
                thumbnail, and video
                record will be
                permanently deleted.
              </p>
            </div>

            <div className="flex gap-3">

              <Button
                type="button"
                variant="destructive"
                disabled={
                  deleting
                }
                onClick={
                  handleDelete
                }
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, Delete"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={
                  deleting
                }
                onClick={() =>
                  setShowDeleteConfirm(
                    false
                  )
                }
              >
                Cancel
              </Button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------
// Radio setting
// --------------------------------------------------

function RadioSetting({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onChange: (
    value: boolean
  ) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium">
        {label}
      </label>

      <div className="flex gap-6">

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={value}
            onChange={() =>
              onChange(true)
            }
            disabled={disabled}
            className="h-4 w-4 accent-primary"
          />

          Yes
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={!value}
            onChange={() =>
              onChange(false)
            }
            disabled={disabled}
            className="h-4 w-4 accent-primary"
          />

          No
        </label>

      </div>
    </div>
  );
}