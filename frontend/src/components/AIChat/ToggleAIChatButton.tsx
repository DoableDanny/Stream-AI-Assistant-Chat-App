import classes from "./AIChat.module.css";

interface Props {
  onClick: () => void;
  showAIChat: boolean;
}

const ToggleAIChatButton = ({ onClick, showAIChat }: Props) => {
  return (
    <button onClick={onClick} className={classes.toggleAIChatButton}>
      {showAIChat ? "⏷" : "💬"}
    </button>
  );
};
export default ToggleAIChatButton;
