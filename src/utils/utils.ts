import { ChatMessageDto } from "../types/ChatMessageDto";
import { MessageType } from "../types/MessageType";

export const formatMessage = (
  msg: MessageType,
  virtualName: string
): ChatMessageDto => {
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
