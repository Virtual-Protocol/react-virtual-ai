import { useMemo, useState } from "react";
import { CharacterRoom } from "../lib/components/CharacterRoom/CharacterRoom";
import { ChatMessages } from "./components/ChatMessages/ChatMessages";
import { ChatMessageDto } from "./types/ChatMessageDto";
import { formatMessage } from "./utils/utils";
import { MessageType } from "./types/MessageType";
import {
  defaultRinModelConfigs,
  defaultVampireModelConfigs,
  // defaultWolfModelConfigs,
} from "./constants/defaultModelConfigs";

const urls = [
  "/models/rin.vrm",
  "/models/vampirechan.vrm",
  "/models/wolfvtuber.vrm",
];
const scales = [10, 10, 10];
const positions = [
  [0, -11, 0],
  [0, -11, 0],
  [0, -12, 0],
];
const modelConfigs = [
  defaultRinModelConfigs,
  defaultVampireModelConfigs,
  // defaultWolfModelConfigs,
  undefined,
];

function App() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [thinking, setThinking] = useState(false);
  const [selected, setSelected] = useState(0);

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
          setSelected((prev) => {
            if (prev >= urls.length - 1) return 0;
            return prev + 1;
          });
        }}
      >
        Change
      </button>
      <CharacterRoom
        // showSettings
        userName="User"
        virtualName="Virtual"
        virtualId={1}
        onLoadErr={(v) => {
          // alert(v);
          console.log("err", v);
        }}
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
        onInputFocused={() => {}}
        onInputBlurred={() => {}}
        onAudioErr={() => {}}
        onPromptError={(e) => {
          alert(e);
        }}
        metadata={{
          apiKey: "igWTNOBUg6M2IVZpiUyD",
          apiSecret: "onFEp4c1Hrbb4Xfg5njnzKHSME7j7Uq2pfB",
          userUid: "1",
          userName: "Jia Xiong",
        }}
        configs={{ skipTTS: true }}
        overrideModelUrl={urls[selected]}
        scale={scales[selected]}
        position={positions[selected]}
        zoom={2}
        modelConfigs={modelConfigs[selected]}
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
