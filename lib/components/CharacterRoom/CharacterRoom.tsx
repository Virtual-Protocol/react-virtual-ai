"use client";

import { PropsWithChildren, useState } from "react";
import { Input } from "../Input/Input";
import { Icon, IconButton } from "@chakra-ui/react";
import { HiSpeakerWave } from "react-icons/hi2";
import { useRandomInterval } from "../../hooks/useRandomInterval";
import { startLipSync } from "../../utils/audio";
import { useVirtualAI } from "../../main";
import { CharacterScene } from "../CharacterScene/CharacterScene";
import { PromptDto } from "../../types/PromptDto";

type Props = {
  userName?: string;
  virtualName?: string;
  onSendMessage?: Function;
  hideVoice?: boolean;
  inputClassName?: string;
  speakerClassName?: string;
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
  initAccessToken: (
    virtualId: number | string,
    metadata?: { [id: string]: any }
  ) => Promise<string>;
  onAudioErr?: () => void;
  validateMessageCapability?: () => boolean;
  overrideModelUrl?: string;
  transformModelUrl?: (modelUrl: string) => string;
  onPromptError?: (error: any) => void;
  metadata?: { [id: string]: any };
};

export const CharacterRoom: React.FC<PropsWithChildren<Props>> = ({
  virtualName,
  userName,
  onSendMessage,
  hideVoice,
  inputClassName,
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
}) => {
  const [inputText, setInputText] = useState("");
  const [anim, setAnim] = useState(
    "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
  );
  const { modelUrl, createPrompt, virtualConfig } = useVirtualAI({
    virtualId,
    userName,
    virtualName,
    initAccessToken,
    onPromptError,
    metadata,
  });
  const [speakCount, setSpeakCount] = useState(0);
  const [emotion, setEmotion] = useState("idle");
  const [latestBotMessage, setLatestBotMessage] = useState<
    PromptDto | undefined
  >(undefined);
  const [talking, setTalking] = useState(false);

  useRandomInterval(
    async () => {
      // every 30 - 60 seconds, perform an idle animation
      const preloadedIdleAnimations = virtualConfig.preloadMotions;
      if (!preloadedIdleAnimations?.length) return;
      const min = 0;
      const max = preloadedIdleAnimations.length - 1;
      const randomNumber = Math.floor(Math.random() * (max - min)) + min;
      setAnim(preloadedIdleAnimations[randomNumber]?.url ?? "");
    },
    30000,
    60000
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const sendPrompt = async (
    content: string | Blob,
    audioEl: HTMLAudioElement,
    audioContext: AudioContext,
    isRedo?: boolean
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
      const skipTTS = true;
      const skipLipSync = true;
      setLatestBotMessage(undefined);
      const prompt = await createPrompt(
        content,
        true,
        !!isRedo,
        !!skipTTS,
        !!skipLipSync
      );

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
              setEmotion(prompt.body.sentiment);
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
            // setSpeakCount((prev) => prev + 1);
          },
          () => {
            setTalking(false);
            console.log("Resetting audio and animation");
            setAnim(
              "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
            );
            setEmotion("idle");
          },
          () => {
            if (!!onAudioErr) onAudioErr();
            setTalking(false);
            console.log("Resetting audio and animation");
            setAnim(
              "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
            );
            setEmotion("idle");
          }
        );
      } else {
        if (!!prompt.body?.url) {
          setAnim(prompt.body.url);
        }
        if (!!prompt.body?.sentiment) {
          setEmotion(prompt.body.sentiment);
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

  if (!virtualId) return <></>;

  return (
    <form
      className="justify-end h-full w-full flex flex-col overflow-y-hidden relative"
      onSubmit={(e) => {
        e.preventDefault();
        handleSendClick();
      }}
    >
      {debugging && (
        <div className="flex flex-col items-center gap-1 fixed top-2 left-1/2 -translate-x-1/2 z-40">
          <div className="flex flex-row items-center gap-2 flex-wrap">
            <button
              className="bg-white px-2 py-1 rounded-2xl"
              onClick={() => {
                setEmotion("anger");
                setAnim(
                  "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/anger/look_around_angry_189.vmd"
                );
                setSpeakCount((prev) => prev + 1);
              }}
            >
              Angry
            </button>
            <button
              className="bg-white px-2 py-1 rounded-2xl"
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
              className="bg-white px-2 py-1 rounded-2xl"
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
              className="bg-white px-2 py-1 rounded-2xl"
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
              className="bg-white px-2 py-1 rounded-2xl"
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
              className="bg-white px-2 py-1 rounded-2xl"
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
              className="bg-white px-2 py-1 rounded-2xl"
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
      <div className="w-full h-full relative">
        <CharacterScene
          zoom={zoom}
          animation={anim}
          // modelUrl="/models/latest/no_hair.vrm"
          modelUrl={
            !!overrideModelUrl
              ? overrideModelUrl
              : !!transformModelUrl
              ? transformModelUrl(modelUrl)
              : modelUrl
          }
          virtualConfig={virtualConfig}
          speakCount={speakCount}
          onAudioEnd={() => {
            console.log("Resetting audio and animation");
            setAnim(
              "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
            );
            setEmotion("idle");
          }}
          aside={aside}
          emotion={emotion}
          position={position}
        />
      </div>
      {!hideInput && (
        <Input
          value={inputText}
          onChange={handleInputChange}
          onSubmit={handleSendClick}
          loading={anim === "think"}
          onSubmitVoice={handleSendVoice}
          onVoiceCall={() => {}}
          hideVoice={hideVoice}
          onFocus={() => {
            if (!!onInputFocused) onInputFocused();
          }}
          onBlur={() => {
            if (!!onInputBlurred) onInputBlurred();
          }}
          className={inputClassName}
          Toolbar={
            !!latestBotMessage && !hideInput ? (
              <IconButton
                aria-label="Play / Pause"
                icon={
                  <Icon as={HiSpeakerWave} className="text-white text-xl" />
                }
                className={`rounded-full w-10 h-10 bg-black/30 hover:bg-black/30 backdrop-blur-xl z-40 self-end`}
                isDisabled={talking}
                onClick={async () => {
                  setTalking(true);
                  const audio = new Audio(`${latestBotMessage.audioUid ?? ""}`);
                  const audioContext = new AudioContext();
                  await startLipSync(
                    audio,
                    audioContext,
                    () => {
                      // setSpeakCount((prev) => prev + 1);
                      setAnim(
                        latestBotMessage.body?.url ??
                          "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
                      );
                      setEmotion(latestBotMessage.body?.sentiment ?? "idle");
                    },
                    () => {
                      setTalking(false);
                      console.log("Resetting audio and animation");
                      setAnim(
                        "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd"
                      );
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
