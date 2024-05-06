export type ConfigType = {
  skipTTS: boolean;
  ttsMode?: boolean;
  speakOnResponse: boolean;
  overrides?: { [id: string]: any };
};
