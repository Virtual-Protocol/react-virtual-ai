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
        hideInput
        onInputFocused={() => {}}
        onInputBlurred={() => {}}
        onAudioErr={() => {}}
        initAccessToken={async () => {
          return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIyYmE0MTFkNS1iMTBjLTRmZDctOTc2ZC0zZjNkY2E0ZjQ5M2UiLCJpZCI6OSwidmlydHVhbCI6IjM1YzJiNWFmLWE4OTUtNGIyYy1iZDZiLTE4MzJhZmEyZDFlMSIsInZpcnR1YWxJZCI6MjA4LCJ1c2VybmFtZSI6ImtpbmdvZmxlYXZlciIsInVzZXJVaWQiOiIxZGE4Nzg2ZC05ZjU2LTQzNGUtOTE5Zi1lOWQ3ZGQxOTMzMjVfMjMzZDdlMTAtN2RhMS00YWY4LWE4YTItMTI3MTZmMTE0ZjAyIiwiY2hhckNhcmRJbmRleCI6MCwicnVubmVyIjoiaHR0cHM6Ly9yaXNpbmctc29ydGVkLW1vbnN0ZXJzLXR1ZXNkYXkudHJ5Y2xvdWRmbGFyZS5jb20iLCJyb2xlIjoidXNlciIsImF1ZCI6InY6MjA4IiwiaWF0IjoxNzEwMjEzODkzLCJleHAiOjE3MTAzMDAyOTN9.Xfd9EFNDPuYFmEZOxIhhqSZqa4I6m-UDGS2c0oczN6RgarMJ74CKVENhAOo4JvGOUWiiCkgQxqQkVYKEAP9wEv28zPAoVdGsvSk_T7SrRVCZo7ZZrv47HUXVg-KBpr4bajnxBRtfvAY3NMicSidiieIM7I2xUHQgQTuODe3Ey5xwoKf-SQoLkUEsuydBEGA_PMDuwQwYpo1uux_AfpISy1hKbWKSrvc1mTgv_NMOXFa5lAsRNj6lIIcH_Bv4vHStKm_wQAEv-S_LM3fVvkBRrCa6SQfXjYtYtl1n5IpBxGUovioJBv4XggPY1qFteOXiyKl56O87uJ95OJtHaearcg";
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
