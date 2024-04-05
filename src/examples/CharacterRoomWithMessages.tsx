import { useMemo, useState } from "react";
import { CharacterRoom } from "../../lib/components/CharacterRoom/CharacterRoom";
import { UNSAFE_initAccessToken } from "../../lib/utils/initAccessToken";

const formatMessage = (msg: any, virtualName: string): any => {
  return {
    id: msg.uid,
    message: msg.content?.text ?? "",
    sender: msg.isBotReply ? virtualName : "You",
    time: new Date(msg.createdAt),
    type: "TEXT",
    senderAvatar: "",
    audio: msg.audio,
    animation: msg.content?.body?.url ?? "",
    audioUid: msg.content?.audioUid ?? "",
    emotion: msg.content?.body?.sentiment ?? "",
  };
};

export const CharacterRoomWithMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [thinking, setThinking] = useState(false);

  const formattedMessages = useMemo(() => {
    const tmp: any[] = [];

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
        userName="User"
        virtualName="Virtual"
        virtualId={1}
        inputClassName="!virtual-bottom-[24px]"
        onLoadErr={(v) => {
          alert(v);
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
        onBeforeSendMessage={async (v) => {
          setThinking(true);
          return v;
        }}
        onErrorSendingMessage={() => {
          setThinking(false);
        }}
        aside={false}
        onInputFocused={() => {}}
        onInputBlurred={() => {}}
        onAudioErr={() => {}}
        onPromptError={(e) => {
          alert(e);
        }}
        metadata={{
          apiKey: "NsIH8CSaTz22faE1Z1S1",
          apiSecret: "Y237Dlb3LSd9H3ywzgXyCy7tBlpA0E5lNsb",
          userUid: "1",
          userName: "Jia Xiong",
        }}
        configs={{ skipTTS: true }}
        initAccessToken={UNSAFE_initAccessToken}
      ></CharacterRoom>
      <div
        className={`virtual-w-[95%] virtual-lg:w-[80%] virtual-max-h-[60vh] virtual-absolute virtual-left-1/2 virtual-bottom-[148px] virtual--translate-x-1/2 virtual-flex virtual-flex-col virtual-messages-outer`}
      >
        {formattedMessages.map((msg, index) => (
          <p key={index}>{JSON.stringify(msg)}</p>
        ))}
      </div>
    </div>
  );
};
