import { currentVrm } from "../components/AICharacter/AICharacter";
// @ts-ignore
import { LipSync } from "./lipsync";

let lipsyncService: any | undefined;

export const startLipSync = async (
  audio: HTMLAudioElement,
  audioContext: AudioContext,
  onAudioStart: Function,
  onAudioEnd: Function,
  onAudioErr: Function
) => {
  if (!currentVrm) return;

  if (!!lipsyncService) {
    lipsyncService.destroy();
  }

  lipsyncService = new LipSync(currentVrm, onAudioEnd);

  try {
    lipsyncService.startWithAudio(
      audio,
      audioContext,
      onAudioStart,
      onAudioEnd
    );
  } catch (err) {
    console.log("lipsync error, falling back to playing audio", err);
    try {
      audio.currentTime = 0;
      await audio.play();
      if (!!onAudioStart) onAudioStart();

      setTimeout(() => {
        onAudioEnd();
      }, 3000);
    } catch (err: any) {
      console.log("Audio playback failed, err");
      onAudioErr();
    }
  }
};
