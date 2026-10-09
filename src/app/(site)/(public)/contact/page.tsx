import {
  Mail,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted">
              Contact NiceConvo
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              We'd love to hear from you.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-secondary md:text-lg md:leading-8">
              Have a question, feedback, or need help with NiceConvo?
              Send us a message and we'll get back to you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="bg-muted-bg">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            {/* Contact Information */}
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
                Get In Touch
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                How can we help?
              </h2>

              <p className="mt-4 max-w-md text-base leading-7 text-secondary">
                Whether you are a learner, creator, or simply exploring
                NiceConvo, we're happy to hear from you.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                    <Mail className="h-5 w-5 text-foreground" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Email
                    </h3>

                    <p className="mt-1 text-sm text-secondary">
                      support@niceconvo.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                    <MessageCircle className="h-5 w-5 text-foreground" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      General Questions
                    </h3>

                    <p className="mt-1 max-w-sm text-sm leading-6 text-secondary">
                      For questions about learning, creators, videos,
                      subscriptions, or your account, use the form and
                      we'll help you find the right answer.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-2xl border border-border bg-background p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Send us a message
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-secondary">
                  Fill out the form below and we'll get back to you.
                </p>
              </div>

              <form className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="How can we help?"
                    className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Write your message..."
                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted focus:border-foreground"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-background transition hover:opacity-90"
                >
                  Send Message
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="rounded-2xl border border-border bg-muted-bg px-6 py-12 text-center md:px-10 md:py-14">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Ready to start learning?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-secondary md:text-base">
              Explore language-learning videos and discover conversations
              created for practical learning.
            </p>

            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-background transition hover:opacity-90"
              >
                Explore NiceConvo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}