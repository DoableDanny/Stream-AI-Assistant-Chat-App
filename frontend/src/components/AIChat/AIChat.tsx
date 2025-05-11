import { useEffect, useState } from "react";
import { type Channel as ChannelType, StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
  AIStateIndicator,
} from "stream-chat-react";
import { v4 as uuidv4 } from "uuid";
import MyChannelHeader from "./MyChannelHeader";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

if (!apiKey) {
  throw new Error("Missing Stream API key");
}

const client = new StreamChat(apiKey);

const AIChat = () => {
  const [channel, setChannel] = useState<ChannelType>();

  useEffect(() => {
    const setUpGuestChat = async () => {
      // create a guest user
      await client.setGuestUser({ id: `guest_user` });

      // create channel (in other words, a chat room) for this guest
      const guestChannel = client.channel(
        "messaging",
        `ai_support_channel_${uuidv4()}`
      );
      setChannel(guestChannel);
    };
    setUpGuestChat();
  }, []);

  if (!client || !channel) return <div>Setting up client & connection...</div>;

  return (
    <Chat client={client}>
      <Channel channel={channel}>
        <Window>
          <MyChannelHeader />
          <MessageList />
          <AIStateIndicator />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
};
export default AIChat;
