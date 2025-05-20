import "stream-chat-react/dist/css/v2/index.css";
import "./App.css";
import AIChatWidget from "./components/AIChat/AIChatWidget";

const App = () => {
  return (
    <>
      <section className="section">
        <div className="container">
          <h1>Welcome to Stream Chat</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint omnis
            ipsum, incidunt at quas dolorum a earum aspernatur quaerat amet
            impedit vero rerum corrupti autem natus dolor sapiente modi nemo.
          </p>
        </div>
      </section>

      <AIChatWidget />
    </>
  );
};

export default App;
