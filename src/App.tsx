import { useMemo, useState } from "react";
import { CharacterRoom } from "../lib/components/CharacterRoom/CharacterRoom";
import { ChatMessages } from "./components/ChatMessages/ChatMessages";
import { ChatMessageDto } from "./types/ChatMessageDto";
import { formatMessage } from "./utils/utils";
import { MessageType } from "./types/MessageType";
import { UNSAFE_initAccessToken } from "../lib/main";

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
    <div className="virtual-flex virtual-flex-col virtual-w-screen virtual-flex-1 virtual-h-screen virtual-relative virtual-overflow-y-hidden virtual-bg-black">
      <CharacterRoom
        initAccessToken={UNSAFE_initAccessToken}
        userName="User"
        virtualName="Virtual"
        virtualId={1}
        onLoadError={(v) => {
          console.log("on load error", v);
        }}
        sceneConfigs={{
          linear: false,
          flat: true,
          shadows: false,
          enableZoom: false,
        }}
        intensity={1.5}
        // overrideModelUrl="/models/test.vrm"
        overrideModelUrl="/models/vampirechan.vrm"
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
        onBeforeSendMessage={async (v) => {
          setThinking(true);
          return v;
        }}
        onInputFocused={() => {}}
        onInputBlurred={() => {}}
        onAudioError={() => {}}
        onPromptError={(e) => {
          setThinking(false);
          console.log("on prompt error");
          alert(e);
        }}
        metadata={{
          apiKey: "64i4HuDASGailjIDQ3cl",
          apiSecret: "Q1QjdajZSnHgOOkD0STn05QCwhMkfDZdYBa",
          userUid: "1",
          userName: "User",
          env: "development",
        }}
        configs={{
          skipTTS: true,
          speakOnResponse: false,
          overrides: {
            abc: true,
          },
        }}
        zoom={2}
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
