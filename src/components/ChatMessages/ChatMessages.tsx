import { useRef } from "react";
import { MyTextMessage } from "./ChatMessage/MyTextMessage";
import { OtherTextMessage } from "./ChatMessage/OtherTextMessage";
import { ThinkMessage } from "./ChatMessage/ThinkMessage";
import { ChatMessageDto } from "../../types/ChatMessageDto";

type Props = {
  messages: ChatMessageDto[];
  expanded: boolean;
};

export const ChatMessages: React.FC<Props> = ({ messages, expanded }) => {
  const chatMessagesEl = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className="w-full h-full relative overflow-auto overflow-x-hidden flex flex-col pt-4"
      ref={chatMessagesEl}
    >
      <div
        className={`w-full flex gap-1 relative pr-3 overflow-x-hidden flex-col-reverse pointer messages`}
      >
        {messages.map((message) => {
          if (message.type === "TEXT" && message.sender === "You") {
            return <MyTextMessage key={message.id} message={message} />;
          }
          if (message.type === "TEXT" && message.sender !== "You") {
            return (
              <OtherTextMessage
                key={message.id}
                message={message}
                expanded={expanded}
              />
            );
          }
          if (message.type === "THINK") {
            return <ThinkMessage key={message.id} />;
          }
          return (
            <p
              key={message.id}
              className="font-barlow p-2 text-[#111] text-sm bg-[#F0E9FF] rounded-lg whitespace-pre-line"
            >
              {message.message}
            </p>
          );
        })}
      </div>
    </div>
  );
};
