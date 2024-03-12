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
      className="virtual-w-full virtual-h-full virtual-relative virtual-overflow-auto virtual-overflow-x-hidden virtual-flex virtual-flex-col virtual-pt-4"
      ref={chatMessagesEl}
    >
      <div
        className={`virtual-w-full virtual-flex virtual-gap-1 virtual-relative virtual-pr-3 virtual-overflow-x-hidden virtual-flex-col-reverse virtual-pointer virtual-messages`}
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
              className="virtual-font-barlow virtual-p-2 virtual-text-[#111] virtual-text-sm virtual-bg-[#F0E9FF] virtual-rounded-lg virtual-whitespace-pre-line"
            >
              {message.message}
            </p>
          );
        })}
      </div>
    </div>
  );
};
