export type MessageType = {
  uid: string;
  content: {
    prompt?: string;
    text?: string;
    body: {
      url: string;
      sentiment: string;
    };
    audioUid?: string;
  };
  isBotReply?: boolean;
  metadata?: any;
  hasRead: boolean;
  createdAt: string;
  audio?: {
    url: string;
  };
};
