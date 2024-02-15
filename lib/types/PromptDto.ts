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
  lipsync?: {
    start: number;
    end: number;
    value: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "X";
  }[];
  audioUid?: string;
};
