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

  console.log(formattedMessages);

  return (
    <div className="flex flex-col w-screen flex-1 h-screen relative overflow-y-hidden bg-black/70">
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
          return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJiMDg5MTM1Yi1iYThkLTQxNTYtYTg5OC05MmQwOTBhMzdkMjYiLCJpZCI6OSwidmlydHVhbCI6IjBkNmM5OGNhLTE1YWEtNDQ1NC1hYTExLTFmM2E5Y2FmNmExMyIsInZpcnR1YWxJZCI6MTI0LCJ1c2VybmFtZSI6Indpbmc4ODgiLCJ1c2VyVWlkIjoidXNlci0xIiwicnVubmVyIjoiaHR0cHM6Ly9jb25zaWRlcmluZy1uZXdtYW4tcHVyc3VhbnQtam9obnNvbi50cnljbG91ZGZsYXJlLmNvbSIsImlhdCI6MTcwOTU1MDEwMywiZXhwIjoxNzA5NjM2NTAzfQ.CJ-1f9ZfbAsRkFmeZ70fEfWqrf7Use4_KxLrtwZb3_L2kjFr-xZHl6l4RtHCDSvTFcSg_gwSj-Fzkuw7qmFtQ9B1M3aM2Ky0Y69AKbC8LzfVUjLKCdYDlZhxE4TU5iRbAdm7P70qMEWzc495jsip3G0GYkY6tGZ4SQ4GcVaQD3E6OpTOZHnI9t8T8_gFP_abuvFHY79mjirlc_HEqhN1J7s7j_nBc6b31f3EgnIHCtfP5cGsxX0CqLY5lDd9opY02YNes6uXs7el4c0p4qXB8Jwe94GG6evfi_0HXPMg1bdBElVshJscO1i0BzeKBe0c-l2_483k0jq4-qjYSFaLxw";
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
