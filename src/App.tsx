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
          userName: "User",
        }}
        configs={{ skipTTS: true }}
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
