import { useMemo, useState } from "react";
import { CharacterRoom } from "../lib/components/CharacterRoom/CharacterRoom";
import { ChatMessages } from "./components/ChatMessages/ChatMessages";
import { ChatMessageDto } from "./types/ChatMessageDto";
import { formatMessage } from "./utils/utils";
import { MessageType } from "./types/MessageType";
import { UNSAFE_initAccessToken } from "../lib/utils/initAccessToken";

const urls = ["/models/gaia.vrm", "/models/ignis.vrm", "/models/seraphina.vrm"];

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
        debugging
        userName="User"
        virtualName="Virtual"
        virtualId={1}
        inputClassName="!virtual-bottom-[24px]"
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
        aside={false}
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
        initAccessToken={async () => {
          return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI4YThmODY2My1jOTZmLTRlODYtYTBjYS0xMzEwYWM5YmY1MTAiLCJpZCI6NSwidmlydHVhbCI6IjQzNWUyNjE0LWY0ZjktNGQwMS04ODczLWNkNzA4YzJlNjc5NiIsInZpcnR1YWxJZCI6MTIsInVzZXJVaWQiOiJjMjExNjIwYi1mYjY3LTQxYmMtODk4OS0wOTMyNjc0N2Q4MmUiLCJydW5uZXIiOiJodHRwczovL3Nob3djYXNlLWFuZHJlYXMtaGVhZHNldC1sZW4udHJ5Y2xvdWRmbGFyZS5jb20iLCJyb2xlIjoidXNlciIsImF1ZCI6InY6MTIiLCJpYXQiOjE3MTA5MzExMDQsImV4cCI6MTcxMTAxNzUwNH0.BQwmCE-s7D5YvTK45bL3NLysPbzqNgZUB8ULIXgD4e5hL7YXmJbGX6AQ2wcUt44kPGMvy7sx2CKlBsU4zSSskvcqpdbY1xXXtiSM5jormBRLrqIyMFGu3CqNtcD1HfoSMFxf8OShoaUFJ6ZFtijFpwyb_Sr8ESzwCE-iRaSInZkxKPprLlD_odVXPE0YjNGD3kqlLJmM3okZyAXy_LPB8Vvmv5-QBDpJum7ZTDIHCaePPFGgVMuqF2p6s5paNSPx2yhJRSzCIthvqktVgDNE3t9cm4fLSUI5FNnCipV5CybwdJjApdehKrQdIIOsTZX_NIrHfvppGRMprOQp8BO1vw";
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
