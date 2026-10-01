"use client";

import { useEffect, useRef, useState } from "react";
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
  user_id: string;
  profiles: {
    id: string;
    username: string;
    display_name: string;
  };
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
  slug: string;
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
  translations: Record<string, string>;
  locale: string;
};

export default function AdminEditVideoForm({
  video,
  channels,
  languages,
  languageRegions,
  categories,
  translations,
  locale,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  void locale;

  const steps = [
    {
      number: 1,
      title: translations["video.step_video"] ?? "Video",
    },
    {
      number: 2,
      title: translations["video.step_details"] ?? "Details",
    },
    {
      number: 3,
      title: translations["video.step_language"] ?? "Language",
    },
    {
      number: 4,
      title: translations["video.step_learning"] ?? "Learning",
    },
    {
      number: 5,
      title:
        translations["video.step_category_access"] ??
        "Category & Access",
    },
    ];

  const [currentStep, setCurrentStep] = useState(1);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    video.thumbnail_url
  );

  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description ?? "");
  const [channelId, setChannelId] = useState(video.channel_id);

  const [level, setLevel] = useState(video.level);
  const [isNativeSpeaker, setIsNativeSpeaker] = useState(
    video.is_native_speaker
  );
  const [captionsOriginal, setCaptionsOriginal] = useState(
    video.captions_original
  );
  const [subtitleLanguageCode, setSubtitleLanguageCode] = useState(
    video.subtitle_language_code ?? ""
  );
  const [explainsIdioms, setExplainsIdioms] = useState(
    video.explains_idioms
  );
  const [explainsTechnicalLingo, setExplainsTechnicalLingo] = useState(
    video.explains_technical_lingo
  );
  const [profanity, setProfanity] = useState(video.profanity);
  const [aiVoice, setAiVoice] = useState(video.ai_voice);

  const [accessType, setAccessType] = useState(video.access_type);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  function nextStep() {
    setError("");
    setCurrentStep((step) => Math.min(step + 1, steps.length));
  }

  function previousStep() {
    setError("");
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  async function generateThumbnail(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement("video");
      const objectUrl = URL.createObjectURL(file);

      videoElement.preload = "metadata";
      videoElement.src = objectUrl;
      videoElement.muted = true;
      videoElement.playsInline = true;

      videoElement.onloadedmetadata = () => {
        const duration = videoElement.duration;

        if (!Number.isFinite(duration) || duration <= 0) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Unable to determine video duration."));
          return;
        }

        const seekTime = Math.max(
          0,
          Math.min(duration * 0.1, duration - 0.1)
        );

        videoElement.currentTime = seekTime;
      };

      videoElement.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");

          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;

          const context = canvas.getContext("2d");

          if (!context) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Unable to create thumbnail."));
            return;
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
              URL.revokeObjectURL(objectUrl);

              if (!blob) {
                reject(new Error("Unable to generate thumbnail."));
                return;
              }

              const fileName =
                file.name.replace(/\.[^/.]+$/, "") + "-thumbnail.jpg";

              resolve(
                new File([blob], fileName, {
                  type: "image/jpeg",
                })
              );
            },
            "image/jpeg",
            0.85
          );
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };

      videoElement.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to load video."));
      };
    });
  }

  async function handleVideoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        translations["video.invalid_video_type"] ??
          "Please select an MP4, WebM, or MOV video."
      );

      event.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        translations["video.video_size_error"] ??
          "Video must be smaller than 2 GB."
      );

      event.target.value = "";
      return;
    }

    setError("");
    setVideoFile(file);

    try {
      const generatedThumbnail = await generateThumbnail(file);

      setThumbnailFile(generatedThumbnail);

      if (thumbnailPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }

      setThumbnailPreview(URL.createObjectURL(generatedThumbnail));
    } catch (err) {
      console.error("THUMBNAIL GENERATION ERROR:", err);

      setError(
        translations["video.thumbnail_generation_error"] ??
          "Unable to generate a thumbnail from this video."
      );
    }
  }

  function handleThumbnailChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        translations["video.thumbnail_type_error"] ??
          "Thumbnail must be JPG, PNG, or WebP."
      );

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        translations["video.thumbnail_size_error"] ??
          "Thumbnail must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    setError("");

    if (thumbnailPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  async function handleSave(shouldPublish = false) {
    if (saving || deleting) return;

    setSaving(true);
    setError("");

    let uploadedVideoPath: string | null = null;
    let uploadedThumbnailPath: string | null = null;

    try {
      if (!title.trim()) {
        throw new Error(
          translations["video.title_required"] ?? "Title is required."
        );
      }

      if (!channelId) {
        throw new Error(
          translations["video.select_channel"] ??
            "Please select a channel."
        );
      }

      if (!level) {
        throw new Error(
          translations["video.select_level"] ??
            "Please select a level."
        );
      }

      const languageCode =
        document.querySelector<HTMLInputElement>(
          '[name="language_code"]'
        )?.value;

      const languageRegionId =
        document.querySelector<HTMLInputElement>(
          '[name="language_region_id"]'
        )?.value;

      const categoryId =
        document.querySelector<HTMLInputElement>(
          '[name="category_id"]'
        )?.value;

      if (!languageCode) {
        throw new Error(
          translations["video.select_language"] ??
            "Please select a language."
        );
      }

      if (!languageRegionId) {
        throw new Error(
          translations["video.select_region_error"] ??
            "Please select a region."
        );
      }

      if (!categoryId) {
        throw new Error(
          translations["video.select_category_error"] ??
            "Please select a category."
        );
      }

      const oldVideoPath =
        video.video_provider === "supabase"
          ? video.video_id
          : null;

      let newVideoPath = video.video_id;

      if (videoFile) {
        setVideoUploading(true);

        const fileExtension =
          videoFile.type === "video/webm"
            ? "webm"
            : videoFile.type === "video/quicktime"
              ? "mov"
              : "mp4";

        const uniqueSuffix = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

        const path = `${video.id}/video-${uniqueSuffix}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("videos")
          .upload(path, videoFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: videoFile.type,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        uploadedVideoPath = path;
        newVideoPath = path;
      }

      let newThumbnailUrl = video.thumbnail_url;

      if (thumbnailFile) {
        const thumbnailPath = `${video.id}/${crypto.randomUUID()}-thumbnail.jpg`;

        const { error: thumbnailUploadError } =
          await supabase.storage
            .from("video-thumbnails")
            .upload(thumbnailPath, thumbnailFile, {
              cacheControl: "3600",
              upsert: false,
              contentType: "image/jpeg",
            });

        if (thumbnailUploadError) {
          throw new Error(thumbnailUploadError.message);
        }

        uploadedThumbnailPath = thumbnailPath;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("video-thumbnails")
          .getPublicUrl(thumbnailPath);

        newThumbnailUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from("videos")
        .update({
          channel_id: channelId,
          category_id: categoryId,
          title: title.trim(),
          description: description.trim() || null,

          language_code: languageCode,
          language_region_id: Number(languageRegionId),

          is_native_speaker: isNativeSpeaker,
          level,

          captions_original: captionsOriginal,
          subtitle_language_code:
            subtitleLanguageCode || null,

          explains_idioms: explainsIdioms,
          explains_technical_lingo: explainsTechnicalLingo,
          profanity,
          ai_voice: aiVoice,

          access_type: accessType,

          video_id: newVideoPath,
          video_provider: videoFile
            ? "supabase"
            : video.video_provider,

          thumbnail_url: newThumbnailUrl,

          status: shouldPublish
            ? "published"
            : video.status,

          published_at: shouldPublish
            ? new Date().toISOString()
            : null,
        })
        .eq("id", video.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      if (
        videoFile &&
        oldVideoPath &&
        oldVideoPath !== newVideoPath
      ) {
        const { error: oldVideoDeleteError } =
          await supabase.storage
            .from("videos")
            .remove([oldVideoPath]);

        if (oldVideoDeleteError) {
          console.error(
            "OLD VIDEO DELETE ERROR:",
            oldVideoDeleteError
          );
        }
      }

      if (thumbnailFile) {
        const { data: thumbnailFiles } =
          await supabase.storage
            .from("video-thumbnails")
            .list(video.id);

        if (thumbnailFiles?.length) {
          const oldThumbnailPaths = thumbnailFiles
            .filter(
              (file) =>
                `${video.id}/${file.name}` !==
                uploadedThumbnailPath
            )
            .map(
              (file) =>
                `${video.id}/${file.name}`
            );

          if (oldThumbnailPaths.length) {
            const { error: thumbnailCleanupError } =
              await supabase.storage
                .from("video-thumbnails")
                .remove(oldThumbnailPaths);

            if (thumbnailCleanupError) {
              console.error(
                "THUMBNAIL CLEANUP ERROR:",
                thumbnailCleanupError
              );
            }
          }
        }
      }

      setVideoUploading(false);

      if (shouldPublish) {
        alert(
          translations["video.published_success"] ??
            "Video published successfully."
        );
      } else if (videoFile) {
        alert(
          translations["video.replaced_success"] ??
            "Video replaced successfully."
        );
      } else {
        alert(
          translations["video.updated_success"] ??
            "Video updated successfully."
        );
      }

      router.push("/admin/videos");
      router.refresh();
    } catch (err) {
      console.error("ADMIN SAVE VIDEO ERROR:", err);

      if (uploadedVideoPath) {
        await supabase.storage
          .from("videos")
          .remove([uploadedVideoPath]);
      }

      if (uploadedThumbnailPath) {
        await supabase.storage
          .from("video-thumbnails")
          .remove([uploadedThumbnailPath]);
      }

      setVideoUploading(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save this video."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleting || saving) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/videos/${video.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Unable to delete this video."
        );
      }

      alert(
        translations["video.deleted_success"] ??
          "Video deleted successfully."
      );

      router.push("/admin/videos");
      router.refresh();
    } catch (err) {
      console.error("ADMIN DELETE VIDEO ERROR:", err);

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
            {steps.map((step, index) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div
                  key={step.number}
                  className="flex min-w-fit flex-1 items-center"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isCompleted) {
                        setCurrentStep(step.number);
                        setError("");
                      }
                    }}
                    disabled={!isCompleted && !isActive}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium ${
                        isActive || isCompleted
                          ? "border-primary bg-primary text-white"
                          : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? "✓" : step.number}
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

                  {index < steps.length - 1 && (
                    <div
                      className={`mx-3 h-px flex-1 ${
                        currentStep > step.number
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
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
        {translations["video.upload_video"] ?? "Video"}
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-6">
      {/* Current Video */}
      <div>
        <p className="mb-3 text-sm font-medium">
          {translations["video.current_video"] ?? "Current Video"}
        </p>

        <div className="rounded-xl border border-border bg-muted-bg p-4">
          <p className="text-sm text-foreground">
            {translations["video.current_video_uploaded"] ??
              "The current video file is already uploaded."}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {translations["video.replace_video_description"] ??
              "Select a new video below if you want to replace the current video."}
          </p>
        </div>
      </div>

      {/* Replace Video */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">
          {translations["video.replace_video"] ?? "Replace Video"}
        </label>

        <div className="mt-4">
          <label
            htmlFor="video-upload"
            className="inline-flex cursor-pointer items-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted-bg"
          >
            {translations["video.choose_video"] ?? "Choose Video"}
          </label>

          <input
            ref={videoInputRef}
            id="video-upload"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="sr-only"
            onChange={handleVideoChange}
            disabled={saving || deleting}
          />

          {videoFile && (
            <p className="mt-3 text-sm text-muted-foreground">
              {videoFile.name}
            </p>
          )}
        </div>

        {videoFile && (
          <div className="rounded-lg border border-border bg-muted-bg p-3">
            <p className="text-sm font-medium">
              {translations["video.new_video_selected"] ??
                "New video selected"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {videoFile.name}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {translations["video.leave_video_empty"] ??
            "Leave this empty if you do not want to replace the current video."}
        </p>
      </div>

      {/* Thumbnail */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">
            {translations["video.thumbnail"] ?? "Thumbnail"}
          </p>

          {thumbnailPreview && (
            <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
              {translations["video.change_thumbnail"] ??
                "Change Thumbnail"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleThumbnailChange}
                disabled={saving || deleting}
              />
            </label>
          )}
        </div>

        {thumbnailPreview && (
          <div className="overflow-hidden rounded-xl border">
            <img
              src={thumbnailPreview}
              alt={
                translations["video.thumbnail_preview_alt"] ??
                "Video thumbnail preview"
              }
              className="aspect-video w-full object-cover"
            />
          </div>
        )}

        {!thumbnailPreview && (
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleThumbnailChange}
            disabled={saving || deleting}
          />
        )}

        <p className="mt-2 text-xs text-muted-foreground">
          {translations["video.thumbnail_format"] ??
            "JPG, PNG or WEBP. Maximum 5 MB."}
        </p>

        {videoFile && (
          <p className="mt-1 text-xs text-muted-foreground">
            {translations["video.thumbnail_auto_generated"] ??
              "A thumbnail was automatically generated from the new video. You can change it if you prefer."}
          </p>
        )}
      </div>
    </CardContent>
  </Card>
</div>

      {/* STEP 2 */}
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
        {translations["video.details"] ??
          "Video Details"}
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium">
          {translations["video.title"] ?? "Title"}
        </label>

        <Input
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder={
            translations["video.enter_title"] ??
            "Enter video title"
          }
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          {translations["video.description"] ??
            "Description"}
        </label>

        <Textarea
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          rows={6}
          placeholder={
            translations["video.describe_learning"] ??
            "Describe what learners will learn in this video"
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          {translations["video.channel"] ?? "Channel"}
        </label>

        <select
          value={channelId}
          onChange={(event) =>
            setChannelId(event.target.value)
          }
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
          required
        >
          <option value="">
            {translations["video.select_channel"] ??
              "Select Channel"}
          </option>

          {channels.map((channel) => (
            <option
              key={channel.id}
              value={channel.id}
            >
              {channel.channel_name} — {channel.profiles.display_name}
            </option>
          ))}
        </select>
      </div>
    </CardContent>
  </Card>
</div>

      {/* STEP 3 */}
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
        {translations["video.step_language"] ??
          "Language"}
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-6">
      <LanguageRegionSelector
        languages={languages}
        languageRegions={languageRegions}
        initialLanguageCode={video.language_code}
        initialRegionId={video.language_region_id}
        uiTranslations={translations}
      />

      <div>
        <label className="mb-2 block text-sm font-medium">
          {translations["video.native_speaker"] ??
            "Native Speaker"}
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="is_native_speaker"
              value="true"
              checked={isNativeSpeaker}
              onChange={() =>
                setIsNativeSpeaker(true)
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["common.yes"] ?? "Yes"}
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="is_native_speaker"
              value="false"
              checked={!isNativeSpeaker}
              onChange={() =>
                setIsNativeSpeaker(false)
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["common.no"] ?? "No"}
          </label>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

      {/* STEP 4 */}
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
        {translations["video.learning_details"] ??
          "Learning Details"}
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">
          {translations["video.level"] ?? "Level"}
        </label>

        <select
          value={level}
          onChange={(event) =>
            setLevel(event.target.value)
          }
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
          required
        >
          <option value="">
            {translations["video.select_level"] ??
              "Select Level"}
          </option>

          <option value="beginner">
            {translations["level.beginner"] ??
              "Beginner"}
          </option>

          <option value="intermediate">
            {translations["level.intermediate"] ??
              "Intermediate"}
          </option>

          <option value="advanced">
            {translations["level.advanced"] ??
              "Advanced"}
          </option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          {translations[
            "video.subtitles_second_language"
          ] ?? "Subtitles for Second Language"}
        </label>

        <select
          value={subtitleLanguageCode}
          onChange={(event) =>
            setSubtitleLanguageCode(
              event.target.value
            )
          }
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
        >
          <option value="">
            {translations["video.no_subtitles"] ??
              "No subtitles"}
          </option>

          {languages.map((language) => (
            <option
              key={language.code}
              value={language.code}
            >
              {translations[
                `language.${language.code}`
              ] ?? language.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          {translations["video.captions_original"] ??
            "Original Captions"}
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="captions_original"
              value="true"
              checked={captionsOriginal}
              onChange={() =>
                setCaptionsOriginal(true)
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["common.yes"] ?? "Yes"}
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="captions_original"
              value="false"
              checked={!captionsOriginal}
              onChange={() =>
                setCaptionsOriginal(false)
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["common.no"] ?? "No"}
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          {translations["video.explains_idioms"] ??
            "Explains Idioms"}
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="explains_idioms"
              value="true"
              checked={explainsIdioms}
              onChange={() =>
                setExplainsIdioms(true)
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["common.yes"] ?? "Yes"}
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="explains_idioms"
              value="false"
              checked={!explainsIdioms}
              onChange={() =>
                setExplainsIdioms(false)
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["common.no"] ?? "No"}
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          {translations[
            "video.explains_technical_lingo"
          ] ?? "Explains Technical Lingo"}
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="explains_technical_lingo"
              value="true"
              checked={explainsTechnicalLingo}
              onChange={() =>
                setExplainsTechnicalLingo(true)
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["common.yes"] ?? "Yes"}
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="explains_technical_lingo"
              value="false"
              checked={!explainsTechnicalLingo}
              onChange={() =>
                setExplainsTechnicalLingo(false)
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["common.no"] ?? "No"}
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          {translations["video.profanity"] ??
            "Profanity"}
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="profanity"
              value="true"
              checked={profanity}
              onChange={() =>
                setProfanity(true)
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["common.yes"] ?? "Yes"}
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="profanity"
              value="false"
              checked={!profanity}
              onChange={() =>
                setProfanity(false)
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["common.no"] ?? "No"}
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          {translations["video.ai_voice"] ??
            "AI Voice"}
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ai_voice"
              value="true"
              checked={aiVoice}
              onChange={() =>
                setAiVoice(true)
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["common.yes"] ?? "Yes"}
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ai_voice"
              value="false"
              checked={!aiVoice}
              onChange={() =>
                setAiVoice(false)
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["common.no"] ?? "No"}
          </label>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

      {/* STEP 5 */}
<div
  className={
    currentStep === 5
      ? "block"
      : "hidden"
  }
>
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>
          {translations["video.category"] ??
            "Category"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <CategorySelector
          languages={languages}
          categories={categories}
          translations={translations}
          initialLanguageCode={video.language_code}
          initialCategoryId={video.category_id ?? ""}
          onLanguageChange={(languageCode) => {
            void languageCode;
          }}
        />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>
          {translations["video.access"] ??
            "Access"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="access_type"
              value="subscriber"
              checked={accessType === "subscriber"}
              onChange={() =>
                setAccessType("subscriber")
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["video.subscribers_only"] ??
              "Subscribers Only"}
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="access_type"
              value="free"
              checked={accessType === "free"}
              onChange={() =>
                setAccessType("free")
              }
              className="h-4 w-4 accent-primary"
            />

            {translations["video.free_preview"] ??
              "Free Preview"}
          </label>
        </div>
      </CardContent>
    </Card>
  </div>
</div>

      {/* Error */}
      {error && (
  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
    {error}
  </div>
)}

     {/* Navigation */}
<div className="flex items-center justify-between pt-6">
  <div>
    {currentStep > 1 && (
      <Button
        type="button"
        variant="outline"
        disabled={saving || deleting}
        onClick={previousStep}
      >
        ← {translations["common.previous"] ?? "Previous"}
      </Button>
    )}
  </div>

  <div className="flex items-center gap-3">
    {currentStep < steps.length ? (
      <Button
        type="button"
        disabled={saving || deleting}
        onClick={nextStep}
      >
        {translations["common.next"] ?? "Next"} →
      </Button>
    ) : (
      <>
        <Button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving || deleting || videoUploading}
        >
          {saving
            ? translations["common.saving"] ?? "Saving..."
            : translations["video.save_changes"] ?? "Save Changes"}
        </Button>

        {video.status === "draft" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={saving || deleting || videoUploading}
          >
            {translations["video.publish"] ?? "Publish"}
          </Button>
        )}
      </>
    )}
  </div>
</div>

      {/* ==================================================
    DANGER ZONE
================================================== */}

<div className="rounded-2xl border border-red-200 bg-background p-8 shadow-sm">
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-red-700">
      {translations["video.danger_zone"] ?? "Danger Zone"}
    </h2>

    <p className="mt-1 text-sm text-muted">
      {translations["video.delete_description"] ??
        "Permanently remove this video from your channel."}
    </p>
  </div>

  {!showDeleteConfirm ? (
    <Button
      type="button"
      variant="destructive"
      disabled={saving || deleting}
      onClick={() => setShowDeleteConfirm(true)}
      className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
    >
      {translations["video.delete_video"] ?? "Delete Video"}
    </Button>
  ) : (
    <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-5">
      <div>
        <p className="font-semibold text-red-900">
          {(
            translations["video.delete_confirmation"] ??
            'Delete "{title}"?'
          ).replace("{title}", video.title)}
        </p>

        <p className="mt-1 text-sm text-red-700">
          {translations["video.delete_warning"] ??
            "This action cannot be undone. The video, thumbnail, and video record will be permanently deleted."}
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="destructive"
          disabled={deleting}
          onClick={handleDelete}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          {deleting
            ? translations["video.deleting"] ?? "Deleting..."
            : translations["video.yes_delete"] ?? "Yes, Delete"}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={deleting}
          onClick={() => setShowDeleteConfirm(false)}
        >
          {translations["common.cancel"] ?? "Cancel"}
        </Button>
      </div>
    </div>
  )}
</div>
    </div>
  );
}

function RadioSetting({
  label,
  description,
  value,
  onChange,
  yesLabel,
  noLabel,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-lg border border-border p-4">
      <div className="space-y-1">
        <div className="text-sm font-medium">{label}</div>

        {description && (
          <div className="text-xs text-muted-foreground">
            {description}
          </div>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={[
            "rounded-md border px-3 py-2 text-sm",
            value
              ? "border-primary bg-primary text-white"
              : "border-border bg-background",
          ].join(" ")}
        >
          {yesLabel}
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={[
            "rounded-md border px-3 py-2 text-sm",
            !value
              ? "border-primary bg-primary text-white"
              : "border-border bg-background",
          ].join(" ")}
        >
          {noLabel}
        </button>
      </div>
    </div>
  );
}