export type ChatMessageDto = {
  id: string;
  message: string;
  sender: string;
  senderAvatar: string;
  time: Date;
  type: "TEXT" | "CALL" | "BANNER" | "THINK";
  audio?: {
    url: string;
  };
  animation?: string;
  audioUid?: string;
  emotion?: string;
};
