import { useMemo, useState } from "react";
import { CharacterRoom } from "../lib/components/CharacterRoom/CharacterRoom";
import { ChatMessages } from "./components/ChatMessages/ChatMessages";
import { ChatMessageDto } from "./types/ChatMessageDto";
import { formatMessage } from "./utils/utils";
import { MessageType } from "./types/MessageType";
import { CharacterScene } from "../lib/main";

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
      <CharacterScene
        animation={
          "https://s3.ap-southeast-1.amazonaws.com/cdn-staging.hiddenhands.io/vmd/Idle/Sleepy_yawn_idle_113.vmd"
        }
        // modelUrl="/models/latest/no_hair.vrm"
        modelUrl={
          "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/3d/nocache/ignis.vrm"
        }
        virtualConfig={{
          model:
            "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/3d/nocache/ignis.vrm",
          animations: {
            face: {
              voice: "/like.mp3",
              url: "https://s3.ap-southeast-1.amazonaws.com/cdn-staging.hiddenhands.io/vmd/Idle/Sleepy_yawn_idle_113.vmd",
            },
            chest: {
              voice: "/angry.mp3",
              url: "https://s3.ap-southeast-1.amazonaws.com/cdn-staging.hiddenhands.io/vmd/Misc/State/Hand_on_cheast_106.vmd",
            },
            lower: {
              voice: "/shy.mp3",
              url: "https://s3.ap-southeast-1.amazonaws.com/cdn-staging.hiddenhands.io/vmd/Idle/Sleepy_yawn_idle_113.vmd",
            },
          },
          parts: {
            face: {
              startX: -0.82,
              endX: 0.82,
              startY: 2.64,
              endY: 0.19,
            },
            chest: {
              startX: -0.82,
              endX: 0.82,
              startY: -0.87,
              endY: -2.54,
            },
            lower: {
              startX: -1.34,
              endX: 1.6,
              startY: -4.13,
              endY: -5.73,
            },
          },
          position: [0, -9, 0],
          stiffness: 6,
          preloadMotions: [
            {
              uid: "idle1",
              sentiment: "idle",
              url: "https://s3.ap-southeast-1.amazonaws.com/cdn-staging.hiddenhands.io/vmd/Idle/Sleepy_yawn_idle_113.vmd",
            },
            {
              uid: "idle2",
              sentiment: "idle",
              url: "https://s3.ap-southeast-1.amazonaws.com/cdn-staging.hiddenhands.io/vmd/Misc/State/Hand_on_cheast_106.vmd",
            },
            {
              uid: "idle6",
              sentiment: "idle",
              url: "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/idle/Swaying+Arms+and+Hips.vmd",
            },
          ],
        }}
      />
      {/* <CharacterRoom
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
          return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2NzYyY2M2MC1mOGQzLTQ1MDEtOGE4NC1lMmE2YTJiYzFkZDUiLCJpZCI6OSwidmlydHVhbCI6IjBkNmM5OGNhLTE1YWEtNDQ1NC1hYTExLTFmM2E5Y2FmNmExMyIsInZpcnR1YWxJZCI6MTI0LCJ1c2VybmFtZSI6Indpbmc4ODgiLCJ1c2VyVWlkIjoidXNlci0xIiwicnVubmVyIjoiaHR0cHM6Ly9jb25zaWRlcmluZy1uZXdtYW4tcHVyc3VhbnQtam9obnNvbi50cnljbG91ZGZsYXJlLmNvbSIsImlhdCI6MTcwOTYyNjQzOCwiZXhwIjoxNzA5NzEyODM4fQ.cYX7bJ9hM290ypEF7hYGHm-a7CAK1F0y0MIAjpDfW1KzeaCjvPJgeVYmCkbhY0T7Aul06O7df4iLR-4uWuTmmEPstTDnici6FuCSiPuCQOyH1qWZg3-o_Cew7VLQ3zL-AI_TqOojxfsMYo4UKmShjA7vQEfOFp3mlUR6-OmdFHcj1DASbf3cU8yv_PVG28c_A-Q1ZF-c53vaIlgToLfQWPpo5krx3zixbmCxMLrmVfkc5NuUIPiEVqThywnxVxi2YV_AoZzplBlGvNEky3xsjoeeBq4x-EWpdeieU8CjX5U42JaAK8uLx5VFY7U50wozg05xcgN2UuTfAWv6ajeTKg";
        }}
        transformModelUrl={(v) => {
          return v.replace("nocache", "production");
        }}
      ></CharacterRoom> */}
      <div
        className={`w-[95%] lg:w-[80%] max-h-[60vh] absolute left-1/2 bottom-[148px] -translate-x-1/2 flex flex-col messages-outer`}
      >
        {<ChatMessages messages={formattedMessages} expanded />}
      </div>
    </div>
  );
}

export default App;
