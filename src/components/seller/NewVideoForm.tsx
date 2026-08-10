"use client";

import { useState } from "react";
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

type Props = {
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

export default function NewVideoForm({
  channels,
  languages,
  languageRegions,
  categories,
  categoryTranslations,
}: Props) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [channelId, setChannelId] = useState("");

  const [level, setLevel] = useState("");

  const [isNativeSpeaker, setIsNativeSpeaker] = useState(true);
  const [captionsOriginal, setCaptionsOriginal] = useState(false);
  const [subtitleLanguageCode, setSubtitleLanguageCode] = useState("");
  const [explainsIdioms, setExplainsIdioms] = useState(false);
  const [explainsTechnicalLingo, setExplainsTechnicalLingo] = useState(false);
  const [profanity, setProfanity] = useState(false);
  const [aiVoice, setAiVoice] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [accessType, setAccessType] = useState("subscriber");

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

  async function generateThumbnail(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    video.onloadedmetadata = () => {
      // Take the frame at 10% of the video duration.
      const targetTime = Math.max(
        0,
        Math.min(video.duration * 0.1, video.duration - 0.1)
      );

      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not create canvas context.");
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
              reject(new Error("Could not generate thumbnail."));
              return;
            }

            const thumbnail = new File(
              [blob],
              `${file.name.replace(/\.[^/.]+$/, "")}-thumbnail.jpg`,
              {
                type: "image/jpeg",
              }
            );

            resolve(thumbnail);

            URL.revokeObjectURL(videoUrl);
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
      reject(new Error("Could not load video."));
    };
  });
}

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (isSaving) return;

  setIsSaving(true);

  try {
    console.log("SUBMIT STARTED");

    // --------------------------------
    // 1. Check video
    // --------------------------------

    if (!videoFile) {
      alert("Please select a video file.");
      return;
    }

    console.log("VIDEO FILE:", videoFile);

    // --------------------------------
    // 2. Get form data
    // --------------------------------

    const form = event.currentTarget;
    const formData = new FormData(form);

    console.log("FORM DATA:");

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // --------------------------------
    // 3. Read values
    // --------------------------------

    const titleValue = String(formData.get("title") ?? "").trim();
    const descriptionValue = String(
      formData.get("description") ?? ""
    ).trim();

    const channelIdValue = String(
      formData.get("channel_id") ?? ""
    );

    const languageCodeValue = String(
      formData.get("language_code") ?? ""
    );

    const languageRegionIdValue = String(
      formData.get("language_region_id") ?? ""
    );

    const isNativeSpeakerValue =
      formData.get("is_native_speaker") === "true";

    const levelValue = String(
      formData.get("level") ?? ""
    );

    const captionsOriginalValue =
      formData.get("captions_original") === "true";

    const subtitleLanguageCodeValue =
      String(
        formData.get("subtitle_language_code") ?? ""
      ) || null;

    const explainsIdiomsValue =
      formData.get("explains_idioms") === "true";

    const explainsTechnicalLingoValue =
      formData.get("explains_technical_lingo") === "true";

    const profanityValue =
      formData.get("profanity") === "true";

    const aiVoiceValue =
      formData.get("ai_voice") === "true";

    const categoryIdValue = String(
      formData.get("category_id") ?? ""
    );

    const accessTypeValue = String(
      formData.get("access_type") ?? "subscriber"
    );

    // --------------------------------
    // 4. Validate required fields
    // --------------------------------

    if (!titleValue) {
      alert("Please enter a video title.");
      return;
    }

    if (!channelIdValue) {
      alert("Please select a channel.");
      return;
    }

    if (!languageCodeValue) {
      alert("Please select a language.");
      return;
    }

    if (!languageRegionIdValue) {
      alert("Please select a language region.");
      return;
    }

    if (!levelValue) {
      alert("Please select a level.");
      return;
    }

    if (!categoryIdValue) {
      alert("Please select a category.");
      return;
    }

    // --------------------------------
    // 5. Create Supabase client
    // --------------------------------

    const supabase = createClient();

    // --------------------------------
    // 6. Get logged-in user
    // --------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("USER ERROR:", userError);
      throw userError;
    }

    if (!user) {
      alert("You must be logged in to publish a video.");
      return;
    }

    console.log("USER:", user.id);

    // --------------------------------
    // 7. Generate unique file path
    // --------------------------------

    const fileExtension =
      videoFile.name.split(".").pop() || "mp4";

    const safeFileName = videoFile.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    const videoId = crypto.randomUUID();

    const uniqueFileName = `${crypto.randomUUID()}-${safeFileName}.${fileExtension}`;

    const storagePath = `${user.id}/${uniqueFileName}`;

    console.log("VIDEO ID:", videoId);

    console.log("STORAGE PATH:", storagePath);

    // --------------------------------
    // 8. Upload video
    // --------------------------------

    console.log("UPLOADING VIDEO...");

    const { error: uploadError } =
      await supabase.storage
        .from("videos")
        .upload(storagePath, videoFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: videoFile.type || "video/mp4",
        });

    if (uploadError) {
      console.error("VIDEO UPLOAD ERROR:", uploadError);
      throw new Error(
        `Video upload failed: ${uploadError.message}`
      );
    }

    console.log("VIDEO UPLOADED SUCCESSFULLY");


    // --------------------------------
    // 9. Generate slug
    // --------------------------------

    const baseSlug = titleValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;

    console.log("SLUG:", slug);

    // --------------------------------
    // 10. Insert video database row
    // --------------------------------

    console.log("INSERTING VIDEO ROW...");

    const { data: video, error: insertError } =
      await supabase
        .from("videos")
        .insert({
          id: videoId,
          channel_id: channelIdValue,
          category_id: categoryIdValue,

          title: titleValue,
          slug,

          description:
            descriptionValue || null,

          video_provider: "supabase",
          video_id: storagePath,
          
          language_code: languageCodeValue,
          language_region_id:
            Number(languageRegionIdValue),

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

          status: "published",

          published_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (insertError) {
  console.error(
    "VIDEO DATABASE INSERT ERROR:",
    insertError
  );

  console.log(
    "Deleting uploaded video because database insert failed..."
  );

  await supabase.storage
    .from("videos")
    .remove([storagePath]);

  throw new Error(
    `Video database insert failed: ${insertError.message}`
  );
}

console.log(
  "VIDEO DATABASE ROW CREATED:",
  video
);


// --------------------------------
// 11. Upload thumbnail
// --------------------------------

if (!thumbnailFile) {
  throw new Error("Thumbnail could not be generated.");
}

const thumbnailFileName =
  `${crypto.randomUUID()}-thumbnail.jpg`;

const thumbnailPath =
  `${videoId}/${thumbnailFileName}`;

console.log(
  "THUMBNAIL STORAGE PATH:",
  thumbnailPath
);

console.log("UPLOADING THUMBNAIL...");

const { error: thumbnailUploadError } =
  await supabase.storage
    .from("video-thumbnails")
    .upload(
      thumbnailPath,
      thumbnailFile,
      {
        cacheControl: "3600",
        upsert: false,
        contentType:
          thumbnailFile.type || "image/jpeg",
      }
    );

if (thumbnailUploadError) {
  console.error(
    "THUMBNAIL UPLOAD ERROR:",
    thumbnailUploadError
  );

  // Delete video database row
  await supabase
    .from("videos")
    .delete()
    .eq("id", videoId);

  // Delete uploaded video
  await supabase.storage
    .from("videos")
    .remove([storagePath]);

  throw new Error(
    `Thumbnail upload failed: ${thumbnailUploadError.message}`
  );
}

console.log(
  "THUMBNAIL UPLOADED SUCCESSFULLY"
);


// --------------------------------
// 12. Get thumbnail URL
// --------------------------------

const {
  data: thumbnailPublicUrl,
} =
  supabase.storage
    .from("video-thumbnails")
    .getPublicUrl(thumbnailPath);

const thumbnailUrl =
  thumbnailPublicUrl.publicUrl;

console.log(
  "THUMBNAIL URL:",
  thumbnailUrl
);


// --------------------------------
// 13. Save thumbnail URL
// --------------------------------

const { error: thumbnailUpdateError } =
  await supabase
    .from("videos")
    .update({
      thumbnail_url: thumbnailUrl,
    })
    .eq("id", videoId);

if (thumbnailUpdateError) {
  console.error(
    "THUMBNAIL URL UPDATE ERROR:",
    thumbnailUpdateError
  );

  // Delete thumbnail
  await supabase.storage
    .from("video-thumbnails")
    .remove([thumbnailPath]);

  // Delete video file
  await supabase.storage
    .from("videos")
    .remove([storagePath]);

  // Delete database row
  await supabase
    .from("videos")
    .delete()
    .eq("id", videoId);

  throw new Error(
    `Could not save thumbnail URL: ${thumbnailUpdateError.message}`
  );
}

console.log(
  "THUMBNAIL URL SAVED SUCCESSFULLY"
);

console.log(
  "VIDEO CREATED SUCCESSFULLY:",
  video
);

alert("Video published successfully!");

  router.push("/seller/videos");
  router.refresh();

  } catch (error) {
    console.error("SUBMIT ERROR:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong while publishing the video."
    );
  } finally {
    setIsSaving(false);
  }
}

async function handleSaveDraft() {
  if (isSaving) return;

  setIsSaving(true);

  try {
    console.log("SAVE DRAFT STARTED");

    if (!videoFile) {
      alert("Please select a video file.");
      return;
    }

    console.log("VIDEO FILE:", videoFile);

    alert("Save Draft button is working!");

  } catch (error) {
    console.error("SAVE DRAFT ERROR:", error);
    alert("Something went wrong.");
  } finally {
    setIsSaving(false);
  }
}

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {/* Stepper */}

      <div className="rounded-xl border bg-background p-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {steps.map((step, index) => {
            const isActive =
              currentStep === step.number;

            const isCompleted =
              currentStep > step.number;

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
                    }
                  }}
                  disabled={!isCompleted && !isActive}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
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

      {/* STEP 1 */}

      <div className={currentStep === 1 ? "block" : "hidden"}>
        <Card>
          <CardHeader>
            <CardTitle>
              Upload Video
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl border-2 border-dashed p-12 text-center">
              <p className="text-lg font-medium">
                Drag & Drop your video here
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                or choose a file from your computer
              </p>

              <Input
  type="file"
  accept="video/*"
  onChange={async (event) => {
    const file = event.target.files?.[0] ?? null;

    setVideoFile(file);
    setThumbnailFile(null);
    setThumbnailPreview(null);

    if (!file) return;

    try {
      const thumbnail = await generateThumbnail(file);

      setThumbnailFile(thumbnail);

      const previewUrl = URL.createObjectURL(thumbnail);
      setThumbnailPreview(previewUrl);

      console.log("THUMBNAIL GENERATED:", thumbnail);
    } catch (error) {
      console.error("THUMBNAIL GENERATION ERROR:", error);
      alert("Could not generate video thumbnail.");
    }
  }}
/>

{thumbnailPreview && (
  <div className="mt-6">
    <div className="mb-2 flex items-center justify-between">
      <p className="text-sm font-medium">
        Video Thumbnail
      </p>

      <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
        Change Thumbnail

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;

            if (!file) return;

            setThumbnailFile(file);

            const previewUrl =
              URL.createObjectURL(file);

            setThumbnailPreview(previewUrl);
          }}
        />
      </label>
    </div>

    <div className="overflow-hidden rounded-xl border">
      <img
        src={thumbnailPreview}
        alt="Video thumbnail preview"
        className="aspect-video w-full object-cover"
      />
    </div>

    <p className="mt-2 text-xs text-muted-foreground">
      A thumbnail was automatically generated from your video.
      You can change it if you prefer.
    </p>
  </div>
)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* STEP 2 */}

      <div className={currentStep === 2 ? "block" : "hidden"}>
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
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                required
              />
            </div>

            {/* Description */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <Textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe what learners will learn in this video"
              />
            </div>

            {/* Channel */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Channel
              </label>

              <select
                name="channel_id"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full rounded-lg border bg-background p-2"
                required
              >
                <option value="">
                  Select Channel
                </option>

                {channels.map((channel) => (
                  <option
                    key={channel.id}
                    value={channel.id}
                  >
                    {channel.channel_name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* STEP 3 */}

      <div className={currentStep === 3 ? "block" : "hidden"}>
        <Card>
          <CardHeader>
            <CardTitle>
              Language
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <LanguageRegionSelector
              languages={languages}
              languageRegions={languageRegions}
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
                    name="is_native_speaker"
                    value="true"
                    defaultChecked
                  />
                  Yes
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_native_speaker"
                    value="false"
                  />
                  No
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* STEP 4 */}

      <div className={currentStep === 4 ? "block" : "hidden"}>
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
                name="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-lg border bg-background p-2"
                required
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

            <div>
              <label className="mb-2 block text-sm font-medium">
                Captions for Original Language
              </label>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="captions_original"
                    value="true"
                  />
                  Yes
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="captions_original"
                    value="false"
                    defaultChecked
                  />
                  No
                </label>
              </div>
            </div>

            {/* Subtitles */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Subtitles for Second Language
              </label>

              <select
                name="subtitle_language_code"
                className="w-full rounded-lg border bg-background p-2"
              >
                <option value="">
                  No subtitles
                </option>

                {languages.map((language) => (
                  <option
                    key={language.code}
                    value={language.code}
                  >
                    {language.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Idioms */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Explains Original Language Idioms
              </label>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="explains_idioms"
                    value="true"
                  />
                  Yes
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="explains_idioms"
                    value="false"
                    defaultChecked
                  />
                  No
                </label>
              </div>
            </div>

            {/* Technical Lingo */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Explains Technical Lingo
              </label>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="explains_technical_lingo"
                    value="true"
                  />
                  Yes
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="explains_technical_lingo"
                    value="false"
                    defaultChecked
                  />
                  No
                </label>
              </div>
            </div>

            {/* Profanity */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Profanity
              </label>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="profanity"
                    value="true"
                  />
                  Yes
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="profanity"
                    value="false"
                    defaultChecked
                  />
                  No
                </label>
              </div>
            </div>

            {/* AI Voice */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                AI Voice
              </label>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ai_voice"
                    value="true"
                  />
                  Yes
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ai_voice"
                    value="false"
                    defaultChecked
                  />
                  No
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* STEP 5 */}

      <div className={currentStep === 5 ? "block" : "hidden"}>
        <>
          {/* Category */}

          <Card>
            <CardHeader>
              <CardTitle>
                Category
              </CardTitle>
            </CardHeader>

            <CardContent>
              <CategorySelector
                categories={categories}
                translations={categoryTranslations}
                localeCode="en"
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
                    name="access_type"
                    value="subscriber"
                    checked={accessType === "subscriber"}
                    onChange={() => setAccessType("subscriber")}
                  />
                  Subscribers Only
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="access_type"
                    value="free"
                    checked={accessType === "free"}
                    onChange={() => setAccessType("free")}
                  />
                  Free Preview
                </label>
              </div>
            </CardContent>
          </Card>
        </>
      </div>

      {/* Navigation */}

      <div className="flex items-center justify-between pt-6">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
            >
              ← Previous
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {currentStep === steps.length && (
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => handleSaveDraft()}
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
          )}

          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={nextStep}
            >
              Next →
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Publishing..." : "Publish Video"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
