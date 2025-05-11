import { useChannelStateContext } from "stream-chat-react";
import { useWatchers } from "../../custom-hooks/useWatchers";
import { useEffect } from "react";

export default function MyChannelHeader() {
  const { channel } = useChannelStateContext();
  const { watchers } = useWatchers({ channel });

  const aiInChannel =
    (watchers ?? []).filter((watcher) => watcher.includes("ai-bot")).length > 0;

  useEffect(() => {
    const addAIAgent = async () => {
      if (!channel || aiInChannel) return;
      const endpoint = "start-ai-agent";
      await fetch(`http://127.0.0.1:3000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel_id: channel.id }),
      });
    };

    addAIAgent();
  }, [aiInChannel, channel]);

  return (
    <div className="my-channel-header">
      <h2>AI Assistant</h2>

      {aiInChannel ? (
        <span style={{ fontSize: 12, color: "gray" }}>
          I'm Stream's AI helper!
        </span>
      ) : (
        <span style={{ fontSize: 14, color: "red" }}>Not connected to AI</span>
      )}
    </div>
  );
}
