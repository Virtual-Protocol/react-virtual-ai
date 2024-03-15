export type PromptDto = {
  text?: string;
  audio?: string;
  prompt?: string;
  body?: {
    uid: string;
    sentiment: string;
    url: string;
  };
  expression: {
    uid: string;
    name: string;
    url: string;
  };
  audioUid?: string;
};
