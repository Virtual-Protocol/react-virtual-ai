import { currentVrm } from "../components/AICharacter/AICharacter";
// @ts-ignore
import { LipSync } from "./lipsync";

//   const inputName = "input.webm";
//   const outputName = "output.mp3";

//   const fileData = new Uint8Array(await webmBlob.arrayBuffer());

//   await ffmpeg.writeFile(inputName, fileData);
//   await ffmpeg.exec(["-i", inputName, outputName]);

//   const outputData = await ffmpeg.readFile(outputName);
//   const outputBlob = new Blob([outputData], { type: "audio/mp3" });

//   console.log("here");

//   return outputBlob;
// };

export const convertToDownloadFileExtension = async (
  webmBlob: Blob,
  downloadFileExtension: string
): Promise<Blob> => {
  const FFmpeg = await import("@ffmpeg/ffmpeg");
  const ffmpeg = FFmpeg.createFFmpeg({
    log: false,
    corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
  });
  await ffmpeg.load();

  const inputName = "input.webm";
  const outputName = `output.${downloadFileExtension}`;

  ffmpeg.FS(
    "writeFile",
    inputName,
    new Uint8Array(await webmBlob.arrayBuffer())
  );

  await ffmpeg.run("-i", inputName, outputName);

  const outputData = ffmpeg.FS("readFile", outputName);
  const outputBlob = new Blob([outputData.buffer], {
    type: `audio/${downloadFileExtension}`,
  });

  return outputBlob;
};

let lipsyncService: any | undefined;

export const startLipSync = async (
  audio: HTMLAudioElement,
  onAudioStart: Function,
  onAudioEnd: Function,
  onAudioErr: Function
) => {
  // const audioContext = new AudioContext();
  // audioContext.createGain();
  // audioContext.resume();

  if (!currentVrm) return;

  if (!!lipsyncService) {
    lipsyncService.destroy();
  }

  lipsyncService = new LipSync(currentVrm, onAudioEnd);

  try {
    lipsyncService.startWithAudio(audio, onAudioStart, onAudioEnd);
  } catch (err) {
    console.log("lipsync error, falling back to playing audio", err);
    try {
      audio.currentTime = 0;
      audio.play();
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
