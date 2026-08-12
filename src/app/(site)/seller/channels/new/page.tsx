import ChannelForm from "@/components/channels/ChannelForm";

export default function NewChannelPage() {
  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Create Channel
        </h1>

        <p className="mt-2 text-muted-foreground">
          Launch your language channel and start accepting subscribers.
        </p>
      </div>

      <ChannelForm mode="create" />
    </div>
  );
}