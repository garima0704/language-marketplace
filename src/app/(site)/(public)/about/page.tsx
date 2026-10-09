
import Link from "next/link";
import { ArrowRight, MessageCircle, Play, Users } from "lucide-react";
import { notFound } from "next/navigation";

import { getSitePage } from "@/lib/sitePages";

type PageData = Record<string, unknown>;

function getText(
  data: PageData,
  key: string,
  fallback: string
): string {
  const value = data[key];

  return typeof value === "string" ? value : fallback;
}

export default async function AboutPage() {
  const page = await getSitePage("about");

  if (!page) {
    notFound();
  }

  const data = (page.page_data ?? {}) as PageData;

  const heroEyebrow = getText(
    data,
    "heroEyebrow",
    "About NiceConvo"
  );
  const heroTitle = getText(
    data,
    "heroTitle",
    "Learn languages through"
  );
  const heroTitleSecondLine = getText(
    data,
    "heroTitleSecondLine",
    "real conversations."
  );
  const heroDescription = getText(
    data,
    "heroDescription",
    "Practical language learning through video content created around real situations, useful topics, and everyday communication."
  );
  const heroPrimaryButton = getText(
    data,
    "heroPrimaryButton",
    "Explore Videos"
  );
  const heroSecondaryButton = getText(
    data,
    "heroSecondaryButton",
    "Meet Creators"
  );

  const featureOneTitle = getText(
    data,
    "featureOneTitle",
    "Real Conversations"
  );
  const featureOneDescription = getText(
    data,
    "featureOneDescription",
    "Learn language in context through conversations, useful expressions, and situations that feel relevant to everyday communication."
  );

  const featureTwoTitle = getText(
    data,
    "featureTwoTitle",
    "Practical Video Learning"
  );
  const featureTwoDescription = getText(
    data,
    "featureTwoDescription",
    "Explore focused video lessons across languages, topics, situations, and different areas of learning."
  );

  const featureThreeTitle = getText(
    data,
    "featureThreeTitle",
    "Learn From Creators"
  );
  const featureThreeDescription = getText(
    data,
    "featureThreeDescription",
    "Discover content from language creators who share their knowledge, experience, and teaching style with learners."
  );

  const approachEyebrow = getText(
    data,
    "approachEyebrow",
    "Our Approach"
  );
  const missionTitle = getText(
    data,
    "missionTitle",
    "Language learning should feel useful, practical, and connected to real life."
  );
  const missionParagraphOne = getText(
    data,
    "missionParagraphOne",
    "Learning a language is about more than memorizing words and studying grammar. It is about understanding how people communicate, recognizing expressions in context, and becoming more comfortable using the language in real situations."
  );
  const missionParagraphTwo = getText(
    data,
    "missionParagraphTwo",
    "NiceConvo is built around that idea. We bring learners and language creators together through video content that makes language more practical and easier to explore."
  );

  const ctaTitle = getText(
    data,
    "ctaTitle",
    "Ready to start learning?"
  );
  const ctaDescription = getText(
    data,
    "ctaDescription",
    "Explore language-learning videos and discover conversations created for practical learning."
  );
  const ctaButton = getText(
    data,
    "ctaButton",
    "Explore NiceConvo"
  );

  return (
    <div className="w-full">
      {/* Hero */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted">
              {heroEyebrow}
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {heroTitle}
              <span className="block">{heroTitleSecondLine}</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-secondary md:text-lg md:leading-8">
              {heroDescription}
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-background transition hover:opacity-90"
              >
                {heroPrimaryButton}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/sellers"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-muted-bg"
              >
                {heroSecondaryButton}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            <div className="bg-background p-6 md:p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted-bg">
                <MessageCircle className="h-5 w-5 text-foreground" />
              </div>

              <h2 className="text-lg font-semibold text-foreground">
                {featureOneTitle}
              </h2>

              <p className="mt-2.5 text-sm leading-6 text-secondary">
                {featureOneDescription}
              </p>
            </div>

            <div className="bg-background p-6 md:p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted-bg">
                <Play className="h-5 w-5 text-foreground" />
              </div>

              <h2 className="text-lg font-semibold text-foreground">
                {featureTwoTitle}
              </h2>

              <p className="mt-2.5 text-sm leading-6 text-secondary">
                {featureTwoDescription}
              </p>
            </div>

            <div className="bg-background p-6 md:p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted-bg">
                <Users className="h-5 w-5 text-foreground" />
              </div>

              <h2 className="text-lg font-semibold text-foreground">
                {featureThreeTitle}
              </h2>

              <p className="mt-2.5 text-sm leading-6 text-secondary">
                {featureThreeDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-muted-bg">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
                {approachEyebrow}
              </p>
            </div>

            <div>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {missionTitle}
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-secondary">
                {missionParagraphOne}
              </p>

              <p className="mt-4 max-w-2xl text-base leading-8 text-secondary">
                {missionParagraphTwo}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional HTML content managed by admin */}
      {page.content.trim() !== "" && (
        <section>
          <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
            <div
              className="
                prose
                prose-neutral
                max-w-none
                prose-headings:font-semibold
                prose-headings:tracking-tight
                prose-headings:text-foreground
                prose-h1:hidden
                prose-h2:mb-4
                prose-h2:mt-10
                prose-h2:text-2xl
                prose-h3:mb-3
                prose-h3:mt-7
                prose-h3:text-xl
                prose-p:leading-7
                prose-p:text-secondary
                prose-a:text-foreground
                prose-a:underline
                prose-a:underline-offset-4
                prose-strong:text-foreground
                prose-ul:my-5
                prose-ol:my-5
                prose-li:text-secondary
                prose-li:leading-7
                prose-blockquote:border-border
                prose-blockquote:text-secondary
              "
              dangerouslySetInnerHTML={{
                __html: page.content,
              }}
            />
          </div>
        </section>
      )}

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="rounded-2xl border border-border bg-muted-bg px-6 py-12 text-center md:px-10 md:py-14">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {ctaTitle}
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-secondary md:text-base">
              {ctaDescription}
            </p>

            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-background transition hover:opacity-90"
              >
                {ctaButton}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}