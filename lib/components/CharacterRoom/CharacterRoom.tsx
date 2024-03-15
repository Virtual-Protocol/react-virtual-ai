"use client";

import { CSSProperties, PropsWithChildren, useEffect, useState } from "react";
import { CharacterInput } from "../CharacterInput/CharacterInput";
import { Icon, IconButton } from "@chakra-ui/react";
import { HiSpeakerWave } from "react-icons/hi2";
import { startLipSync } from "../../utils/audio";
import { useVirtualAI } from "../../main";
import { CharacterScene } from "../CharacterScene/CharacterScene";
import { PromptType } from "../../types/PromptType";
import "../../index.css";
import { UNSAFE_initAccessToken } from "../../utils/initAccessToken";
import { ConfigType } from "../../types/ConfigType";
import { getQuotedTexts } from "../../utils/string";
import { VRM } from "@pixiv/three-vrm";

type Props = {
  userName?: string;
  virtualName?: string;
  onSendMessage?: Function;
  hideVoice?: boolean;
  inputClassName?: string;
  inputStyle?: CSSProperties;
  hideInput?: boolean;
  zoom?: number;
  position?: number[];
  debugging?: boolean;
  virtualId?: number | string;
  aside?: boolean;
  onUserMessageCreated?: (content: any) => Promise<void>;
  onVirtualMessageCreated?: (content: any) => Promise<void>;
  onBeforeSendMessage?: () => void;
  onErrorSendingMessage?: (err: any) => void;
  onInputFocused?: () => void;
  onInputBlurred?: () => void;
  initAccessToken?: (
    virtualId: number | string,
    metadata?: { [id: string]: any }
  ) => Promise<string>;
  onAudioErr?: () => void;
  validateMessageCapability?: () => boolean;
  overrideModelUrl?: string;
  transformModelUrl?: (modelUrl: string) => string;
  onPromptError?: (error: any) => void;
  metadata?: { [id: string]: any };
  loadingText?: string;
  configs?: ConfigType;
  onProgressChange?: (v: number) => void;
  onLoadErr?: (err: any) => void;
};

export const CharacterRoom: React.FC<PropsWithChildren<Props>> = ({
  virtualName,
  userName,
  onSendMessage,
  hideVoice,
  inputClassName,
  inputStyle,
  hideInput,
  zoom,
  position,
  debugging,
  virtualId,
  onUserMessageCreated,
  onVirtualMessageCreated,
  onBeforeSendMessage,
  onErrorSendingMessage,
  aside,
  onInputFocused,
  onInputBlurred,
  initAccessToken,
  onAudioErr,
  validateMessageCapability,
  overrideModelUrl,
  transformModelUrl,
  onPromptError,
  metadata,
  loadingText,
  configs,
  onProgressChange,
  onLoadErr,
}) => {
  const [inputText, setInputText] = useState("");
  const [anim, setAnim] = useState(
    "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
  );
  const { modelUrl, createPrompt, getVoiceUrl } = useVirtualAI({
    virtualId,
    userName,
    virtualName,
    initAccessToken: !!initAccessToken
      ? initAccessToken
      : UNSAFE_initAccessToken,
    onPromptError,
    metadata,
  });
  const [speakCount, setSpeakCount] = useState(0);
  const [emotion, setEmotion] = useState<
    | "idle"
    | "think"
    | "anger"
    | "disgust"
    | "fear"
    | "joy"
    | "neutral"
    | "sadness"
    | "surprise"
  >("idle");
  const [latestBotMessage, setLatestBotMessage] = useState<
    PromptType | undefined
  >(undefined);
  const [talking, setTalking] = useState(false);
  const [currentVrm, setCurrentVrm] = useState<VRM | undefined>();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const sendPrompt = async (
    content: string | Blob,
    audioEl: HTMLAudioElement,
    audioContext: AudioContext
  ) => {
    setTalking(false);
    const canSendMessage = !!validateMessageCapability
      ? validateMessageCapability()
      : true;
    if (!canSendMessage) {
      return;
    }
    if (!!onBeforeSendMessage) onBeforeSendMessage();
    try {
      if (typeof content === "string") {
        if (!!onUserMessageCreated)
          await onUserMessageCreated({
            text: content,
          });
      }
      setLatestBotMessage(undefined);
      const prompt = await createPrompt(content, configs);

      // on prompt received, create new chat message object for the waifu
      if (typeof content !== "string") {
        if (!!onUserMessageCreated)
          await onUserMessageCreated({
            text: prompt.prompt,
          });
      }
      if (!!prompt.audioUid) {
        audioEl.src = prompt.audioUid;
        // const audio = new Audio(
        //   `https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/audios/bdf8a7a4-127e-4f8c-aa26-645a273a2b6e.wav`
        // );
        await startLipSync(
          currentVrm,
          audioEl,
          audioContext,
          async () => {
            // let userAgent = navigator.userAgent || navigator.vendor;
            // const isSafari =
            //   !/chrome/i.test(userAgent) && /safari/i.test(userAgent);
            // if (!isSafari) setTalking(true);
            setTalking(true);
            if (!!prompt.body?.url) {
              setAnim(prompt.body.url);
            }
            if (!!prompt.body?.sentiment) {
              setEmotion(
                prompt.body.sentiment as
                  | "idle"
                  | "think"
                  | "anger"
                  | "disgust"
                  | "fear"
                  | "joy"
                  | "neutral"
                  | "sadness"
                  | "surprise"
              );
            }
            if (!!onVirtualMessageCreated)
              await onVirtualMessageCreated({
                prompt: prompt.prompt,
                text: prompt.text,
                expression: prompt.expression,
                body: prompt.body,
                audioUid: prompt.audioUid,
              });
            setLatestBotMessage(prompt);
            setSpeakCount((prev) => prev + 1);
          },
          () => {
            setTalking(false);
            console.log("Resetting audio and animation");
            // setAnim(
            //   "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
            // );
            setEmotion("idle");
          },
          () => {
            if (!!onAudioErr) onAudioErr();
            setTalking(false);
            console.log("Resetting audio and animation");
            // setAnim(
            //   "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
            // );
            setEmotion("idle");
          }
        );
      } else {
        if (!!prompt.body?.url) {
          setAnim(prompt.body.url);
        }
        if (!!prompt.body?.sentiment) {
          setEmotion(
            prompt.body.sentiment as
              | "idle"
              | "think"
              | "anger"
              | "disgust"
              | "fear"
              | "joy"
              | "neutral"
              | "sadness"
              | "surprise"
          );
        }
        if (!!onVirtualMessageCreated)
          await onVirtualMessageCreated({
            prompt: prompt.prompt,
            text: prompt.text,
            expression: prompt.expression,
            body: prompt.body,
            audioUid: prompt.audioUid,
          });
        setLatestBotMessage(prompt);
        const audioUid = await getVoiceUrl(
          getQuotedTexts(prompt.text ?? "").join(" ")
        );
        setLatestBotMessage((prev) => {
          if (!prev) {
            return undefined;
          } else {
            return {
              ...prev,
              audioUid: audioUid,
            };
          }
        });
      }
    } catch (err: any) {
      setAnim(
        "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
      );
      setEmotion("idle");
      if (!!onErrorSendingMessage) onErrorSendingMessage(err);
    }
  };

  const handleSendClick = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");

    if (!!onSendMessage) {
      await onSendMessage(text);
      return;
    }

    const audio = new Audio();
    const audioContext = new AudioContext();

    await sendPrompt(text, audio, audioContext);

    audioContext.createGain();
    await audioContext.resume();
    await audio.play();
    console.log("audioContext state", audioContext.state);
  };

  const handleSendVoice = async (blob: Blob) => {
    const audio = new Audio();
    const audioContext = new AudioContext();

    await sendPrompt(blob, audio, audioContext);

    audioContext.createGain();
    await audioContext.resume();
    await audio.play();
    console.log("audioContext state", audioContext.state);
  };

  useEffect(() => {
    return () => {
      setLatestBotMessage(undefined);
    };
  }, [virtualId]);

  if (!virtualId) return <></>;

  return (
    <form
      className="virtual-justify-end virtual-h-full virtual-w-full virtual-flex virtual-flex-col virtual-overflow-y-hidden virtual-relative"
      onSubmit={(e) => {
        e.preventDefault();
        handleSendClick();
      }}
    >
      {debugging && (
        <div className="virtual-flex virtual-flex-col virtual-items-center virtual-gap-1 virtual-fixed virtual-top-2 virtual-left-1/2 virtual--translate-x-1/2 virtual-z-40">
          <div className="virtual-flex virtual-flex-row virtual-items-center virtual-gap-2 virtual-flex-wrap">
            <button
              className="virtual-bg-white virtual-px-2 virtual-py-1 virtual-rounded-2xl"
              onClick={() => {
                setEmotion("anger");
                setAnim(
                  "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/anger/Frustrated_y_179.vmd"
                );
                setSpeakCount((prev) => prev + 1);
              }}
            >
              Angry
            </button>
            <button
              className="virtual-bg-white virtual-px-2 virtual-py-1 virtual-rounded-2xl"
              onClick={() => {
                setAnim(
                  "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/mixamo/Joyful+Jump.fbx"
                );
                setEmotion("joy");
                setSpeakCount((prev) => prev + 1);
              }}
            >
              Joyful Jump
            </button>
            <button
              className="virtual-bg-white virtual-px-2 virtual-py-1 virtual-rounded-2xl"
              onClick={() => {
                setAnim(
                  "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/mixamo/Crying.fbx"
                );
                setEmotion("sadness");
                setSpeakCount((prev) => prev + 1);
              }}
            >
              Sad
            </button>
            <button
              className="virtual-bg-white virtual-px-2 virtual-py-1 virtual-rounded-2xl"
              onClick={() => {
                setAnim(
                  "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/Happy_7bb121f971.fbx"
                );
                setEmotion("joy");
                setSpeakCount((prev) => prev + 1);
              }}
            >
              Happy
            </button>
            <button
              className="virtual-bg-white virtual-px-2 virtual-py-1 virtual-rounded-2xl"
              onClick={() => {
                setAnim(
                  "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/Happy_Idle_5c47e63d71.fbx"
                );
                setEmotion("joy");
                setSpeakCount((prev) => prev + 1);
              }}
            >
              Happy Idle
            </button>
            <button
              className="virtual-bg-white virtual-px-2 virtual-py-1 virtual-rounded-2xl"
              onClick={() => {
                setAnim(
                  "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/Thinking_8971a6cf3f.fbx"
                );
                setEmotion("neutral");
                setSpeakCount((prev) => prev + 1);
              }}
            >
              Thinking
            </button>
            <button
              className="virtual-bg-white virtual-px-2 virtual-py-1 virtual-rounded-2xl"
              onClick={() => {
                setAnim(
                  "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/Talking_384b16a4d2.fbx"
                );
                setEmotion("neutral");
                setSpeakCount((prev) => prev + 1);
              }}
            >
              Talking
            </button>
          </div>
        </div>
      )}
      <div className="virtual-w-full virtual-h-full virtual-relative">
        <CharacterScene
          onProgressChange={(v) => {
            if (v < 100) {
              setAnim(
                "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
              );
              setEmotion("idle");
            }
            if (!!onProgressChange) onProgressChange(v);
          }}
          onLoadErr={onLoadErr}
          zoom={zoom}
          animation={anim}
          loadingText={loadingText}
          currentVrm={currentVrm}
          setCurrentVrm={setCurrentVrm}
          // modelUrl="/models/latest/no_hair.vrm"
          modelUrl={
            !!overrideModelUrl
              ? overrideModelUrl
              : !!transformModelUrl
              ? transformModelUrl(modelUrl)
              : modelUrl
          }
          speakCount={speakCount}
          onAudioEnd={() => {
            console.log("Resetting audio and animation");
            // setAnim(
            //   "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
            // );
            setEmotion("idle");
          }}
          aside={aside}
          emotion={emotion}
          position={position}
        />
      </div>
      {!hideInput && (
        <CharacterInput
          value={inputText}
          onChange={handleInputChange}
          onSubmit={handleSendClick}
          disabled={anim === "think"}
          onSubmitVoice={handleSendVoice}
          hideVoice={hideVoice}
          onFocus={() => {
            if (!!onInputFocused) onInputFocused();
          }}
          onBlur={() => {
            if (!!onInputBlurred) onInputBlurred();
          }}
          className={inputClassName}
          style={inputStyle}
          Toolbar={
            !!latestBotMessage && !hideInput ? (
              <IconButton
                aria-label="Play / Pause"
                icon={
                  <Icon
                    as={HiSpeakerWave}
                    className="virtual-text-white virtual-text-xl"
                  />
                }
                className={`virtual-rounded-full virtual-w-10 virtual-h-10 virtual-bg-black/30 virtual-hover:bg-black/30 virtual-backdrop-blur-xl virtual-z-40 virtual-self-end`}
                isDisabled={talking || !latestBotMessage.audioUid}
                onClick={async () => {
                  setTalking(true);
                  if (!latestBotMessage.audioUid) {
                    setTalking(false);
                    return;
                  }
                  const audio = new Audio(`${latestBotMessage.audioUid ?? ""}`);
                  const audioContext = new AudioContext();
                  await startLipSync(
                    currentVrm,
                    audio,
                    audioContext,
                    () => {
                      setSpeakCount((prev) => prev + 1);
                      setAnim(
                        latestBotMessage.body?.url ??
                          "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
                      );
                      setEmotion(
                        (latestBotMessage.body?.sentiment ?? "idle") as
                          | "idle"
                          | "think"
                          | "anger"
                          | "disgust"
                          | "fear"
                          | "joy"
                          | "neutral"
                          | "sadness"
                          | "surprise"
                      );
                    },
                    () => {
                      setTalking(false);
                      console.log("Resetting audio and animation");
                      // setAnim(
                      //   "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
                      // );
                      setEmotion("idle");
                    },
                    () => {
                      if (!!onAudioErr) onAudioErr();
                      setTalking(false);
                    }
                  );
                  audioContext.createGain();
                  await audioContext.resume();
                  audio.preload = "metadata";
                  audio.play();
                  console.log("audioContext state", audioContext.state);
                }}
              />
            ) : (
              <></>
            )
          }
        />
      )}
    </form>
  );
};
