import { useState } from "react";
import AIChat from "./AIChat";
import ToggleAIChatButton from "./ToggleAIChatButton";
import classes from "./AIChat.module.css";

const AIChatWidget = () => {
  const [showAIChat, setShowAIChat] = useState(false);

  const toggleAIChat = () => {
    setShowAIChat((prev) => !prev);
  };

  return (
    <div>
      <div
        className={`${classes.chatPanel} ${!showAIChat ? classes.hidden : ""}`}
      >
        <AIChat />
      </div>

      <ToggleAIChatButton onClick={toggleAIChat} showAIChat={showAIChat} />
    </div>
  );
};
export default AIChatWidget;
