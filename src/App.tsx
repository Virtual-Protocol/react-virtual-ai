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
    <div className="virtual-flex virtual-flex-col virtual-w-screen virtual-flex-1 virtual-h-screen virtual-relative virtual-overflow-y-hidden virtual-bg-black/70">
      <button
        className="virtual-fixed virtual-top-4 virtual-right-4 virtual-z-50"
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
      <CharacterRoom
        debugging
        userName="User"
        virtualName="Virtual"
        virtualId={1}
        inputClassName="!virtual-bottom-[24px]"
        speakerClassName="!virtual-bottom-[88px]"
        onUserMessageCreated={async (content) => {
          const newMessage = {
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
          const newMessage = {
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
          return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJlZGUxZDkyMy1hOTlhLTQ0ODktODBlYy1iMTlkZmNmMWY5OGIiLCJpZCI6MTAsInZpcnR1YWwiOiJkMTA1MjU4ZS0wOWMxLTQ0NTUtOTIxNy03NjgyMzUwYzVmM2IiLCJ2aXJ0dWFsSWQiOjIwNywidXNlcm5hbWUiOiJraW5nb2ZsZWF2ZXIiLCJ1c2VyVWlkIjoiMWRhODc4NmQtOWY1Ni00MzRlLTkxOWYtZTlkN2RkMTkzMzI1Xzc5MDQyYmEzLWRmNzItNDk4NC1hNTQ4LTg5NjVjYjQyYmY0MCIsImNoYXJDYXJkSW5kZXgiOjAsInJ1bm5lciI6Imh0dHBzOi8vYWxsb3ktaWRlbnRpZnlpbmctZHZkcy1taW5kLnRyeWNsb3VkZmxhcmUuY29tIiwicm9sZSI6InVzZXIiLCJhdWQiOiJ2OjIwNyIsImlhdCI6MTcxMDMxMzU1MiwiZXhwIjoxNzEwMzk5OTUyfQ.hS-bgcKr6r481501KA0iDVmxZoH8R4cKVSWv5gRVTi2RhqW3PnDmtYoICjqeMYATKK5VS-pjNG_ChGsMFdfqES0tm1mkPIWRVI36gg0kSPHURPRZpDTOobgUrSLzLpy1yucu5HG_wAA09WSOt_K_1eH43o0PxpGk7xbS4b_N8PxaRO1D8wUtVCm5PfRo4b-iYklR2v-fewtElfnSnBU0NH7CkQDlayopfVJlfaTvTRm8pVvi5jInx0-aTIbnuFO0sXHWVgiWrS2hYP6n6-OLF9filw60I9pqgPIEWKI9PYjTR2seMfroLiBvCKbhdQfw7kKaQuC0z3meCg4ZrYc4zg";
        }}
        transformModelUrl={(v) => {
          return v.replace("nocache", "production");
        }}
      ></CharacterRoom>
      <div
        className={`virtual-w-[95%] virtual-lg:w-[80%] virtual-max-h-[60vh] virtual-absolute virtual-left-1/2 virtual-bottom-[148px] virtual--translate-x-1/2 virtual-flex virtual-flex-col virtual-messages-outer`}
      >
        {<ChatMessages messages={formattedMessages} expanded />}
      </div>
    </div>
  );
}

export default App;
