import Link from "next/link";
import { cookies } from "next/headers";

import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/translations";

export default async function BecomeSellerPage() {
  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const translations = await getTranslations(
    [
      "seller.become.title",
      "seller.become.description",
      "seller.become.create_channel.title",
      "seller.become.create_channel.description",
      "seller.become.upload_videos.title",
      "seller.become.upload_videos.description",
      "seller.become.earn_income.title",
      "seller.become.earn_income.description",
      "seller.become.cta.title",
      "seller.become.cta.description",
      "seller.become.cta.button",
    ],
    locale
  );

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {translations["seller.become.title"] ??
              "Become a Seller"}
          </h1>

          <p className="mt-3 text-base leading-7 text-muted">
            {translations["seller.become.description"] ??
              "Share your language knowledge, create your own channel, and earn by teaching learners around the world."}
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-6">
            <h3 className="text-lg font-semibold text-foreground">
              {translations[
                "seller.become.create_channel.title"
              ] ?? "Create Your Channel"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              {translations[
                "seller.become.create_channel.description"
              ] ??
                "Build your language channel and organize your learning content for your audience."}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background p-6">
            <h3 className="text-lg font-semibold text-foreground">
              {translations[
                "seller.become.upload_videos.title"
              ] ?? "Upload Videos"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              {translations[
                "seller.become.upload_videos.description"
              ] ??
                "Upload lessons, conversations, and educational videos for your subscribers."}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background p-6">
            <h3 className="text-lg font-semibold text-foreground">
              {translations[
                "seller.become.earn_income.title"
              ] ?? "Earn Income"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              {translations[
                "seller.become.earn_income.description"
              ] ??
                "Set your subscription price and earn from learners who subscribe to your channel."}
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-border bg-foreground p-8">
          <h2 className="text-2xl font-semibold text-background">
            {translations["seller.become.cta.title"] ??
              "Ready to start teaching?"}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
            {translations["seller.become.cta.description"] ??
              "Create your seller profile and start building your language community."}
          </p>

          <Link href="/profile" className="inline-block">
            <Button className="mt-6 rounded-lg bg-background text-foreground hover:bg-muted-bg">
              {translations["seller.become.cta.button"] ??
                "Start Selling"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}