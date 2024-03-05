import { useMemo, useState } from "react";
import { CharacterRoom } from "../lib/components/CharacterRoom/CharacterRoom";
import { ChatMessages } from "./components/ChatMessages/ChatMessages";
import { ChatMessageDto } from "./types/ChatMessageDto";
import { formatMessage } from "./utils/utils";
import { MessageType } from "./types/MessageType";

function App() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [thinking, setThinking] = useState(false);

  const formattedMessages = useMemo(() => {
    const tmp: ChatMessageDto[] = [];

    // If thinking, add bot thinking message
    if (thinking) {
      tmp.push({
        id: crypto.randomUUID(),
        message: "",
        sender: "bot",
        time: new Date(),
        type: "THINK",
        senderAvatar: "",
        audioUid: "",
      });
    }

    messages?.forEach((msg) => {
      tmp.push(formatMessage(msg, "Virtual"));
    });

    return tmp;
  }, [messages, thinking]);

  return (
    <div className="flex flex-col w-screen flex-1 h-screen relative overflow-y-hidden bg-black/70">
      <button
        className="fixed top-4 right-4 z-50"
        onClick={() => {
          const audio = new Audio(
            "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/audios/33aa254e-a13b-46fb-9807-6aa76b2da467.wav"
          );
          audio.load();
          audio.play();
        }}
      >
        Audio
      </button>
      <button className="fixed top-4 left-4 z-50" onClick={() => {}}>
        Random action
      </button>
      <CharacterRoom
        userName="User"
        virtualName="Virtual"
        virtualId={1}
        inputClassName="!bottom-[24px]"
        speakerClassName="!bottom-[88px]"
        onUserMessageCreated={async (content: any) => {
          const newMessage: MessageType = {
            uid: crypto.randomUUID(),
            content: content,
            isBotReply: false,
            hasRead: true,
            createdAt: new Date().toLocaleString(),
          };
          setMessages((prev) => {
            return [newMessage, ...prev];
          });
        }}
        validateMessageCapability={() => {
          return true;
        }}
        onVirtualMessageCreated={async (content) => {
          const newMessage: MessageType = {
            uid: crypto.randomUUID(),
            content: content,
            isBotReply: true,
            hasRead: true,
            createdAt: new Date().toLocaleString(),
          };
          setMessages((prev) => {
            return [newMessage, ...prev];
          });
          setThinking(false);
        }}
        onBeforeSendMessage={() => {
          setThinking(true);
        }}
        onErrorSendingMessage={() => {
          setThinking(false);
        }}
        aside={false}
        onInputFocused={() => {}}
        onInputBlurred={() => {}}
        onAudioErr={() => {}}
        initAccessToken={async () => {
          return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJkMzdhNmIxZC05NGQxLTRlODQtODg2Zi04YzFhNmNhOWE2MjMiLCJpZCI6OSwidmlydHVhbCI6IjBkNmM5OGNhLTE1YWEtNDQ1NC1hYTExLTFmM2E5Y2FmNmExMyIsInZpcnR1YWxJZCI6MTI0LCJ1c2VybmFtZSI6Indpbmc4ODgiLCJ1c2VyVWlkIjoidXNlci0xIiwicnVubmVyIjoiaHR0cHM6Ly9jb25zaWRlcmluZy1uZXdtYW4tcHVyc3VhbnQtam9obnNvbi50cnljbG91ZGZsYXJlLmNvbSIsImlhdCI6MTcwOTYxMjcxMSwiZXhwIjoxNzA5Njk5MTExfQ.kWWCoMr67aLW6KeU4djxoMozKQfWUbuRNBQQt6w2duwnjwDH3_gmA7oKrgn4Noqzt5kKFK3notBi0cYdbKchhhIYlokkUiN73gCC0hW55QcuHnJCRKkMUbz_vfEghRc8tddmcOsgQisRgRqHLdRwLnoywJR6kzr5DZbNx_99msbB3Y5K1lLcPCkl7aEATxbI2-E14Z4KoTfvstXjNiwF0_EU-WgiDbI21gPnYS366VNJCnjR7_RMYLTG30IzaEL5fZwvQ184U0zdQ1FpSJQ9XOv7B1Ouw0XQKw8jZ61EqHfjAiJ9BhvQ6P8OHA76pauwqSzNJnlOkxsiYPWRXfKIUg";
        }}
        transformModelUrl={(v) => {
          return v.replace("nocache", "production");
        }}
      ></CharacterRoom>
      <div
        className={`w-[95%] lg:w-[80%] max-h-[60vh] absolute left-1/2 bottom-[148px] -translate-x-1/2 flex flex-col messages-outer`}
      >
        {<ChatMessages messages={formattedMessages} expanded />}
      </div>
    </div>
  );
}

export default App;
