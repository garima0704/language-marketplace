"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  profiles:
    | {
        id: string;
        username: string | null;
        display_name: string | null;
      }
    | {
        id: string;
        username: string | null;
        display_name: string | null;
      }[];
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

type Props = {
  channels: Channel[];
  languages: Language[];
  languageRegions: LanguageRegion[];
  categories: Category[];
  translations: Record<string, string>;
};

function getProfileName(
  channel: Channel
) {
  const profile = Array.isArray(channel.profiles)
    ? channel.profiles[0]
    : channel.profiles;

  return (
    profile?.display_name ||
    profile?.username ||
    "Seller"
  );
}

export default function AdminNewVideoForm({
  channels,
  languages,
  languageRegions,
  categories,
  translations,
}: Props) {
  const router = useRouter();

  const formRef = useRef<HTMLFormElement>(null);

  const [currentStep, setCurrentStep] = useState(1);

  const [videoFile, setVideoFile] =
    useState<File | null>(null);

  const [thumbnailFile, setThumbnailFile] =
    useState<File | null>(null);

  const [thumbnailPreview, setThumbnailPreview] =
    useState<string | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [submitAction, setSubmitAction] =
    useState<"draft" | "publish" | null>(null);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [channelId, setChannelId] =
    useState("");

  const [level, setLevel] =
    useState("");

  const [accessType, setAccessType] =
    useState("subscriber");

  const steps = [
    {
      number: 1,
      title:
        translations["video.step_video"] ??
        "Video",
    },
    {
      number: 2,
      title:
        translations["video.step_details"] ??
        "Details",
    },
    {
      number: 3,
      title:
        translations["video.step_language"] ??
        "Language",
    },
    {
      number: 4,
      title:
        translations["video.step_learning"] ??
        "Learning",
    },
    {
      number: 5,
      title:
        translations[
          "video.step_category_access"
        ] ?? "Category & Access",
    },
  ];

  function nextStep() {
    setCurrentStep((step) =>
      Math.min(step + 1, steps.length)
    );
  }

  function previousStep() {
    setCurrentStep((step) =>
      Math.max(step - 1, 1)
    );
  }

  async function generateThumbnail(
    file: File
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const video =
        document.createElement("video");

      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      const videoUrl =
        URL.createObjectURL(file);

      video.src = videoUrl;

      video.onloadedmetadata = () => {
        const targetTime = Math.max(
          0,
          Math.min(
            video.duration * 0.1,
            video.duration - 0.1
          )
        );

        video.currentTime = targetTime;
      };

      video.onseeked = () => {
        try {
          const canvas =
            document.createElement("canvas");

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const context =
            canvas.getContext("2d");

          if (!context) {
            throw new Error(
              "Could not create canvas context."
            );
          }

          context.drawImage(
            video,
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

              const thumbnail = new File(
                [blob],
                `${file.name.replace(
                  /\.[^/.]+$/,
                  ""
                )}-thumbnail.jpg`,
                {
                  type: "image/jpeg",
                }
              );

              URL.revokeObjectURL(
                videoUrl
              );

              resolve(thumbnail);
            },
            "image/jpeg",
            0.85
          );
        } catch (error) {
          URL.revokeObjectURL(videoUrl);
          reject(error);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(videoUrl);

        reject(
          new Error("Could not load video.")
        );
      };
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSaving) return;

    const submitter = (
      event.nativeEvent as SubmitEvent
    ).submitter as HTMLButtonElement | null;

    const action =
      submitter?.value === "draft"
        ? "draft"
        : "publish";

    setSubmitAction(action);
    setIsSaving(true);

    try {
      if (!videoFile) {
        alert(
          translations["video.select_video"] ??
            "Please select a video file."
        );
        return;
      }

      const formData =
        new FormData(event.currentTarget);

      const titleValue = String(
        formData.get("title") ?? ""
      ).trim();

      const descriptionValue =
        String(
          formData.get("description") ?? ""
        ).trim();

      const channelIdValue =
        String(
          formData.get("channel_id") ?? ""
        );

      const languageCodeValue =
        String(
          formData.get("language_code") ?? ""
        );

      const languageRegionIdValue =
        String(
          formData.get(
            "language_region_id"
          ) ?? ""
        );

      const isNativeSpeakerValue =
        formData.get(
          "is_native_speaker"
        ) === "true";

      const levelValue =
        String(
          formData.get("level") ?? ""
        );

      const captionsOriginalValue =
        formData.get(
          "captions_original"
        ) === "true";

      const subtitleLanguageCodeValue =
        String(
          formData.get(
            "subtitle_language_code"
          ) ?? ""
        ) || null;

      const explainsIdiomsValue =
        formData.get(
          "explains_idioms"
        ) === "true";

      const explainsTechnicalLingoValue =
        formData.get(
          "explains_technical_lingo"
        ) === "true";

      const profanityValue =
        formData.get("profanity") ===
        "true";

      const aiVoiceValue =
        formData.get("ai_voice") ===
        "true";

      const categoryIdValue =
        String(
          formData.get("category_id") ?? ""
        );

      const accessTypeValue =
        String(
          formData.get("access_type") ??
            "subscriber"
        );

      // ----------------------------------------
      // Validation
      // ----------------------------------------

      if (!titleValue) {
        alert(
          translations[
            "video.enter_title_error"
          ] ??
            "Please enter a video title."
        );
        return;
      }

      if (!channelIdValue) {
        alert(
          translations[
            "video.select_channel_error"
          ] ??
            "Please select a channel."
        );
        return;
      }

      if (!languageCodeValue) {
        alert(
          translations[
            "video.select_language"
          ] ??
            "Please select a language."
        );
        return;
      }

      if (!languageRegionIdValue) {
        alert(
          translations[
            "video.select_region_error"
          ] ??
            "Please select a language region."
        );
        return;
      }

      if (!levelValue) {
        alert(
          translations[
            "video.select_level_error"
          ] ??
            "Please select a level."
        );
        return;
      }

      if (!categoryIdValue) {
        alert(
          translations[
            "video.select_category_error"
          ] ??
            "Please select a category."
        );
        return;
      }

      if (!thumbnailFile) {
        alert(
          translations[
            "video.thumbnail_generation_error"
          ] ??
            "Could not generate video thumbnail."
        );
        return;
      }

      // ----------------------------------------
      // Supabase
      // ----------------------------------------

      const supabase = createClient();

      const selectedChannel =
        channels.find(
          (channel) =>
            channel.id === channelIdValue
        );

      if (!selectedChannel) {
        throw new Error(
          "Selected channel could not be found."
        );
      }

      const ownerUserId =
        selectedChannel.user_id;

      // ----------------------------------------
      // Video path
      // ----------------------------------------

      const fileExtension =
        videoFile.name
          .split(".")
          .pop() || "mp4";

      const safeFileName =
        videoFile.name
          .replace(/\.[^/.]+$/, "")
          .replace(
            /[^a-zA-Z0-9-_]/g,
            "-"
          )
          .replace(/-+/g, "-")
          .toLowerCase();

      const videoId =
        crypto.randomUUID();

      const uniqueFileName =
        `${crypto.randomUUID()}-${safeFileName}.${fileExtension}`;

      const storagePath =
        `${ownerUserId}/${uniqueFileName}`;

      // ----------------------------------------
      // Upload video
      // ----------------------------------------

      const { error: uploadError } =
        await supabase.storage
          .from("videos")
          .upload(
            storagePath,
            videoFile,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                videoFile.type ||
                "video/mp4",
            }
          );

      if (uploadError) {
        throw new Error(
          `Video upload failed: ${uploadError.message}`
        );
      }

      // ----------------------------------------
      // Slug
      // ----------------------------------------

      const baseSlug =
        titleValue
          .toLowerCase()
          .trim()
          .replace(
            /[^a-z0-9\s-]/g,
            ""
          )
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

      const slug =
        `${baseSlug || "video"}-${crypto
          .randomUUID()
          .slice(0, 8)}`;

      // ----------------------------------------
      // Insert video
      // ----------------------------------------

      const { error: insertError } =
        await supabase
          .from("videos")
          .insert({
            id: videoId,
            channel_id:
              channelIdValue,
            category_id:
              categoryIdValue,
            title: titleValue,
            slug,
            description:
              descriptionValue ||
              null,
            video_provider:
              "supabase",
            video_id:
              storagePath,
            language_code:
              languageCodeValue,
            language_region_id:
              Number(
                languageRegionIdValue
              ),
            is_native_speaker:
              isNativeSpeakerValue,
            level: levelValue,
            captions_original:
              captionsOriginalValue,
            subtitle_language_code:
              subtitleLanguageCodeValue,
            explains_idioms:
              explainsIdiomsValue,
            explains_technical_lingo:
              explainsTechnicalLingoValue,
            profanity:
              profanityValue,
            ai_voice:
              aiVoiceValue,
            access_type:
              accessTypeValue,
            status:
              action === "publish"
                ? "published"
                : "draft",

            published_at:
              action === "publish"
                ? new Date().toISOString()
                : null,
          });

      if (insertError) {
        await supabase.storage
          .from("videos")
          .remove([storagePath]);

        throw new Error(
          `Video database insert failed: ${insertError.message}`
        );
      }

      // ----------------------------------------
      // Upload thumbnail
      // ----------------------------------------

      const thumbnailPath =
        `${videoId}/${crypto.randomUUID()}-thumbnail.jpg`;

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

      if (thumbnailUploadError) {
        await supabase
          .from("videos")
          .delete()
          .eq("id", videoId);

        await supabase.storage
          .from("videos")
          .remove([storagePath]);

        throw new Error(
          `Thumbnail upload failed: ${thumbnailUploadError.message}`
        );
      }

      // ----------------------------------------
      // Thumbnail URL
      // ----------------------------------------

      const {
        data: thumbnailPublicUrl,
      } = supabase.storage
        .from("video-thumbnails")
        .getPublicUrl(
          thumbnailPath
        );

      const thumbnailUrl =
        thumbnailPublicUrl.publicUrl;

      const {
        error: thumbnailUpdateError,
      } = await supabase
        .from("videos")
        .update({
          thumbnail_url:
            thumbnailUrl,
        })
        .eq("id", videoId);

      if (thumbnailUpdateError) {
        await supabase.storage
          .from("video-thumbnails")
          .remove([thumbnailPath]);

        await supabase.storage
          .from("videos")
          .remove([storagePath]);

        await supabase
          .from("videos")
          .delete()
          .eq("id", videoId);

        throw new Error(
          `Could not save thumbnail: ${thumbnailUpdateError.message}`
        );
      }

      alert(
        action === "draft"
          ? translations[
              "video.draft_success"
            ] ?? "Video saved as draft!"
          : translations[
              "video.published_success"
            ] ??
              "Video published successfully!"
      );

      router.push("/admin/videos");
      router.refresh();
    } catch (error) {
      console.error(
        "ADMIN VIDEO CREATE ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the video."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Stepper */}

      <div className="rounded-xl border border-border bg-background p-4">
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
                      if (isCompleted) {
                        setCurrentStep(
                          step.number
                        );
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
                        isActive ||
                        isCompleted
                          ? "border-primary bg-primary text-background"
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

      {/* STEP 1 */}

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
              {translations[
                "video.upload_video"
              ] ??
                "Upload Video"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl border-2 border-dashed border-border bg-light-bg p-12 text-center">
              <p className="text-lg font-medium">
                {translations[
                  "video.drag_drop_video"
                ] ??
                  "Drag & Drop your video here"}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {translations[
                  "video.choose_file"
                ] ??
                  "or choose a file from your computer"}
              </p>

              <div className="mt-4">
                <label
                  htmlFor="admin-video-upload"
                  className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted-bg"
                >
                  {translations[
                    "video.choose_video"
                  ] ??
                    "Choose Video"}
                </label>

                <input
                  id="admin-video-upload"
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={async (
                    event
                  ) => {
                    const file =
                      event.target.files?.[0] ??
                      null;

                    setVideoFile(
                      file
                    );

                    setThumbnailFile(
                      null
                    );

                    setThumbnailPreview(
                      null
                    );

                    if (!file)
                      return;

                    try {
                      const thumbnail =
                        await generateThumbnail(
                          file
                        );

                      setThumbnailFile(
                        thumbnail
                      );

                      setThumbnailPreview(
                        URL.createObjectURL(
                          thumbnail
                        )
                      );
                    } catch (error) {
                      console.error(
                        "THUMBNAIL GENERATION ERROR:",
                        error
                      );

                      alert(
                        translations[
                          "video.thumbnail_generation_error"
                        ] ??
                          "Could not generate video thumbnail."
                      );
                    }
                  }}
                />

                {videoFile && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {videoFile.name}
                  </p>
                )}
              </div>

              {thumbnailPreview && (
                <div className="mt-6 text-left">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {translations[
                        "video.thumbnail"
                      ] ??
                        "Video Thumbnail"}
                    </p>

                    <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
                      {translations[
                        "video.change_thumbnail"
                      ] ??
                        "Change Thumbnail"}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(
                          event
                        ) => {
                          const file =
                            event.target.files?.[0] ??
                            null;

                          if (!file)
                            return;

                          setThumbnailFile(
                            file
                          );

                          setThumbnailPreview(
                            URL.createObjectURL(
                              file
                            )
                          );
                        }}
                      />
                    </label>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-border">
                    <img
                      src={
                        thumbnailPreview
                      }
                      alt="Video thumbnail preview"
                      className="aspect-video w-full object-cover"
                    />
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {translations[
                      "video.thumbnail_auto_generated"
                    ] ??
                      "A thumbnail was automatically generated from your video. You can change it if you prefer."}
                  </p>
                </div>
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
              {translations[
                "video.details"
              ] ??
                "Video Details"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                {translations[
                  "video.title"
                ] ?? "Title"}
              </label>

              <Input
                name="title"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder={
                  translations[
                    "video.enter_title"
                  ] ??
                  "Enter video title"
                }
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {translations[
                  "video.description"
                ] ??
                  "Description"}
              </label>

              <Textarea
                name="description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows={6}
                placeholder={
                  translations[
                    "video.describe_learning"
                  ] ??
                  "Describe what learners will learn in this video"
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {translations[
                  "video.channel"
                ] ?? "Channel"}
              </label>

              <select
                name="channel_id"
                value={channelId}
                onChange={(event) =>
                  setChannelId(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              >
                <option value="">
                  {translations[
                    "video.select_channel"
                  ] ??
                    "Select Channel"}
                </option>

                {channels.map(
                  (channel) => (
                    <option
                      key={channel.id}
                      value={channel.id}
                    >
                      {channel.channel_name}
                      {" — "}
                      {getProfileName(
                        channel
                      )}
                    </option>
                  )
                )}
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
              {translations[
                "video.step_language"
              ] ?? "Language"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <LanguageRegionSelector
              languages={languages}
              languageRegions={
                languageRegions
              }
              uiTranslations={
                translations
              }
            />

            <div>
              <label className="mb-2 block text-sm font-medium">
                {translations[
                  "video.native_speaker"
                ] ??
                  "Native Speaker"}
              </label>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_native_speaker"
                    value="true"
                    defaultChecked
                    className="h-4 w-4 accent-primary"
                  />
                  {translations[
                    "common.yes"
                  ] ?? "Yes"}
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_native_speaker"
                    value="false"
                    className="h-4 w-4 accent-primary"
                  />
                  {translations[
                    "common.no"
                  ] ?? "No"}
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
              {translations[
                "video.learning_details"
              ] ??
                "Learning Details"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                {translations[
                  "video.level"
                ] ?? "Level"}
              </label>

              <select
                name="level"
                value={level}
                onChange={(event) =>
                  setLevel(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              >
                <option value="">
                  {translations[
                    "video.select_level"
                  ] ??
                    "Select Level"}
                </option>

                <option value="beginner">
                  {translations[
                    "level.beginner"
                  ] ?? "Beginner"}
                </option>

                <option value="intermediate">
                  {translations[
                    "level.intermediate"
                  ] ?? "Intermediate"}
                </option>

                <option value="advanced">
                  {translations[
                    "level.advanced"
                  ] ?? "Advanced"}
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {translations[
                  "video.subtitles_second_language"
                ] ??
                  "Subtitles for Second Language"}
              </label>

              <select
                name="subtitle_language_code"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">
                  {translations[
                    "video.no_subtitles"
                  ] ??
                    "No subtitles"}
                </option>

                {languages.map(
                  (language) => (
                    <option
                      key={language.code}
                      value={
                        language.code
                      }
                    >
                      {translations[`language.${language.code}`] ??
                        language.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {[
              [
                "captions_original",
                "video.captions_original",
              ],
              [
                "explains_idioms",
                "video.explains_idioms",
              ],
              [
                "explains_technical_lingo",
                "video.explains_technical_lingo",
              ],
              [
                "profanity",
                "video.profanity",
              ],
              [
                "ai_voice",
                "video.ai_voice",
              ],
            ].map(
              ([name, translationKey]) => (
                <div key={name}>
                  <label className="mb-2 block text-sm font-medium">
                    {translations[
                      translationKey
                    ] ??
                      name}
                  </label>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={name}
                        value="true"
                        className="h-4 w-4 accent-primary"
                      />
                      {translations[
                        "common.yes"
                      ] ?? "Yes"}
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={name}
                        value="false"
                        defaultChecked
                        className="h-4 w-4 accent-primary"
                      />
                      {translations[
                        "common.no"
                      ] ?? "No"}
                    </label>
                  </div>
                </div>
              )
            )}
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
                {translations[
                  "video.category"
                ] ?? "Category"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <CategorySelector
                languages={languages}
                categories={categories}
                translations={
                  translations
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {translations[
                  "video.access"
                ] ?? "Access"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="access_type"
                    value="subscriber"
                    checked={
                      accessType ===
                      "subscriber"
                    }
                    onChange={() =>
                      setAccessType(
                        "subscriber"
                      )
                    }
                    className="h-4 w-4 accent-primary"
                  />

                  {translations[
                    "video.subscribers_only"
                  ] ??
                    "Subscribers Only"}
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="access_type"
                    value="free"
                    checked={
                      accessType ===
                      "free"
                    }
                    onChange={() =>
                      setAccessType(
                        "free"
                      )
                    }
                    className="h-4 w-4 accent-primary"
                  />

                  {translations[
                    "video.free_preview"
                  ] ??
                    "Free Preview"}
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              disabled={isSaving}
            >
              ←{" "}
              {translations["common.previous"] ??
                "Previous"}
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isSaving}
            >
              {translations["common.next"] ??
                "Next"}{" "}
              →
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                type="submit"
                name="submit_action"
                value="draft"
                variant="outline"
                disabled={isSaving}
              >
                {isSaving &&
                submitAction === "draft"
                  ? translations["video.saving"] ??
                    "Saving..."
                  : translations["video.save_draft"] ??
                    "Save Draft"}
              </Button>

              <Button
                type="submit"
                name="submit_action"
                value="publish"
                disabled={isSaving}
              >
                {isSaving &&
                submitAction === "publish"
                  ? translations["video.publishing"] ??
                    "Publishing..."
                  : translations["video.publish"] ??
                    "Publish Video"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}