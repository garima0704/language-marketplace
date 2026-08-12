
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function BecomeSellerPage() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">

        <h1 className="text-3xl font-bold text-gray-900">
          Become a Seller
        </h1>

        <p className="mt-3 text-gray-500">
          Share your language knowledge, create your own channel,
          and earn by teaching learners around the world.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Create Your Channel
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Build your language channel and organize your learning
              content for your audience.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Videos
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Upload lessons, conversations, and educational videos
              for your subscribers.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Earn Income
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Set your subscription price and earn from learners
              who subscribe to your channel.
            </p>
          </div>

        </div>

        <div className="mt-10 rounded-xl bg-gray-900 p-8 text-white">

          <h2 className="text-2xl font-semibold">
            Ready to start teaching?
          </h2>

          <p className="mt-2 text-sm text-gray-300">
            Create your seller profile and start building your
            language community.
          </p>

          <Link href="/profile">
            <Button className="mt-6 bg-white text-gray-900 hover:bg-gray-100">
              Start Selling
            </Button>
          </Link>

        </div>

      </div>
    </div>
  );
}