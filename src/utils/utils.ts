import { ChatMessageDto } from "../types/ChatMessageDto";
import { MessageType } from "../types/MessageType";

export const getQuotedTexts = (text: string) => {
  const pattern = /".*?"/g;

  let current;
  const ls: string[] = [];
  while ((current = pattern.exec(text)))
    ls.push(current?.[0]?.slice(1, (current?.[0]?.length ?? 0) - 1));
  return ls;
};

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
