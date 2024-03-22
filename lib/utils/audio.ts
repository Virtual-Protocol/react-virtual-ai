import { VRM } from "@pixiv/three-vrm";
// @ts-ignore
import { LipSync } from "./lipsync";

/**
 * lipsyncService cache on memory
 */
let lipsyncService: any | undefined;

/**
 *
 * @param currentVrm
 * @param audio
 * @param audioContext
 * @param onAudioStart
 * @param onAudioEnd
 * @param onAudioErr
 * @returns
 */
export const startLipSync = async (
  currentVrm: VRM | undefined,
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
    // console.log("lipsync error, falling back to playing audio", err);
    try {
      audio.currentTime = 0;
      await audio.play();
      if (!!onAudioStart) onAudioStart();

      setTimeout(() => {
        onAudioEnd();
      }, 3000);
    } catch (err: any) {
      // console.log("Audio playback failed, err");
      onAudioErr();
    }
  }
};
