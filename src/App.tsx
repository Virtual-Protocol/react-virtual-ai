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
      <button
        className="virtual-fixed virtual-top-4 virtual-left-4 virtual-z-50"
        onClick={() => {}}
      >
        Random action
      </button>
      <CharacterRoom
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
          return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI5NGM0YTBlMC1kYWY3LTQyMjMtOWVmOS0xZDFlYzhhNzAzMGYiLCJpZCI6OCwidmlydHVhbCI6IjJiMmQxMTUzLTA2ZTQtNGY3MC04YTMzLWM4MTA1MGI5YTA0MiIsInZpcnR1YWxJZCI6MjA2LCJ1c2VybmFtZSI6ImtpbmdvZmxlYXZlciIsInVzZXJVaWQiOiIxZGE4Nzg2ZC05ZjU2LTQzNGUtOTE5Zi1lOWQ3ZGQxOTMzMjVfNDZhNTcxNzEtZDBmNy00MzU2LWI2YTEtNGQxYzYwMzU2ZWUzIiwiY2hhckNhcmRJbmRleCI6MCwicnVubmVyIjoiaHR0cHM6Ly9yZWFkeS1wYXJhbWV0ZXItY2VydGFpbmx5LWJveGluZy50cnljbG91ZGZsYXJlLmNvbSIsInJvbGUiOiJ1c2VyIiwiYXVkIjoidjoyMDYiLCJpYXQiOjE3MTAyMzAwMDksImV4cCI6MTcxMDMxNjQwOX0.btiudHN7lIlU343FSUmJBT2x_IO2v7v922To_mTzg4LcgtDmqUDzQFsXzRQq2h0tLjNfAohSephHjWVdS1cB591NFaprn86TeVLCnLsPln6eNBJ7BMintTIfLHTfR5MLCLh9tBQB_tQfI2f3-i9yc7MQkgXrps39hNTkaMsMykkuJ77sSkuX0PNfs2jTD2JYiOMmBsjar3nY10ZTjf70lRkh1r7lPKmrqhiLVQJXlt4Y4WDkDzljafLeWzN-ulRY5fuUu7A7ka0q4fnimbEgSA8TxNxPRakftrt8rFyy66sga0UZCsg0VOECdVpV1dF90F5DVPtyUugqF1lYpfB_4w";
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
