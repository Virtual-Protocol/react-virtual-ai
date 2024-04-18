"use client";

import {
  CSSProperties,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CharacterInput, InputProps } from "../CharacterInput/CharacterInput";
import { Icon, IconButton } from "@chakra-ui/react";
import { HiSpeakerWave } from "react-icons/hi2";
import { startLipSync } from "../../utils/audio";
import { useVirtual } from "../../main";
import { CharacterScene } from "../CharacterScene/CharacterScene";
import { PromptType } from "../../types/PromptType";
import "../../index.css";
import { UNSAFE_initAccessToken } from "../../utils/initAccessToken";
import { ConfigType } from "../../types/ConfigType";
import { VRM } from "@pixiv/three-vrm";
import { ModelConfigs } from "../ModelConfigs/ModelConfigs";
import { Core } from "../../services/VirtualService";
// @ts-ignore
import idleUrl from "../../assets/idle.vmd";

type Props = {
  /**
   * User name that VIRTUAL will address
   */
  userName?: string;
  /**
   * VIRTUAL name
   */
  virtualName?: string;
  /**
   * Whether to hide voice input button
   */
  hideVoice?: boolean;
  /**
   * Addional class name for input container
   */
  inputClassName?: string;
  /**
   * Additional input style
   */
  inputStyle?: CSSProperties;
  /**
   * Whether to hide input component
   */
  hideInput?: boolean;
  /**
   * ThreeJS camera zoom (default 2)
   */
  zoom?: number;
  /**
   * 3D model position in [x,y,z] (default [0, -10, 0])
   */
  position?: number[];
  /**
   * 3D model scale in number (default 10)
   */
  scale?: number;
  /**
   * virtualId that will decide user memory
   */
  virtualId?: number | string;
  /**
   * Whether to put 3D model aside
   */
  aside?: boolean;
  /**
   * Callback on user message created
   * @param content any
   * @returns
   */
  onUserMessageCreated?: (content: any) => Promise<void>;
  /**
   * Callback on virtual message created
   * @param content any
   * @returns
   */
  onVirtualMessageCreated?: (content: any) => Promise<void>;
  /**
   * Callback before sending message
   * @returns
   */
  onBeforeSendMessage?: (content: string | Blob) => Promise<string | Blob>;
  /**
   * Callback when sending message encounters error
   * @param err Error
   * @returns
   */
  onErrorSendingMessage?: (err: any) => void;
  /**
   * Callback when input is focused
   * @returns
   */
  onInputFocused?: () => void;
  /**
   * Callback when input is blurred
   * @returns
   */
  onInputBlurred?: () => void;
  /**
   * Function that takes in virtualId and additional metadata to return runner access token
   * @returns runner access token
   */
  initAccessToken?: (
    virtualId: number | string,
    metadata?: { [id: string]: any }
  ) => Promise<string>;
  /**
   * Callback on audio playback error
   * @returns
   */
  onAudioErr?: () => void;
  /**
   * Validate if user is allowed to send message
   * @returns true if can send message, else false
   */
  validateMessageCapability?: () => boolean;
  /**
   * Override the 3D model URL
   */
  overrideModelUrl?: string;
  /**
   * Function to transform raw model URL
   * @param modelUrl Raw model URL
   * @returns Transformed model URL
   */
  transformModelUrl?: (modelUrl: string) => string;
  /**
   * Callback when /prompt to runner encounters error
   * @param error Error
   * @returns
   */
  onPromptError?: (error: any) => void;
  /**
   * Callback when init is completed
   * @param cores array of supported cores
   * @returns void
   */
  onInitCompleted?: (cores: Core[]) => void;
  /**
   * Additional metadata to pass during initAccessToken
   */
  metadata?: { [id: string]: any };
  /**
   * Override default loading text
   */
  loadingText?: string;
  /**
   * Additinal configurations to send during prompting
   */
  configs?: ConfigType;
  /**
   * Callback on 3D model loading progress change
   * @param v Progerss in percentage (0-100)
   * @returns
   */
  onProgressChange?: (v: number) => void;
  /**
   * Callback when 3D model loading encounters error
   * @param err Error
   * @returns
   */
  onLoadErr?: (err: any) => void;
  showSettings?: boolean;
  modelConfigs?: {
    [boneName: string]: {
      stiffness?: number;
      dragForce?: number;
      hitRadius?: number;
    };
  };
  lang?: "en" | "zh-CN";
  sceneConfigs?: {
    linear: boolean;
    flat: boolean;
    shadows: boolean;
    enableZoom: boolean;
  };
  Input?: React.FC<InputProps>;
  LoadingComponent?: ReactNode;
  speakerStyle?: CSSProperties;
  speakerContainerStyle?: CSSProperties;
};

export const CharacterRoom: React.FC<PropsWithChildren<Props>> = ({
  virtualName,
  userName,
  hideVoice,
  inputClassName,
  inputStyle,
  hideInput,
  zoom,
  position,
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
  onInitCompleted,
  metadata,
  loadingText,
  configs,
  onProgressChange,
  onLoadErr,
  scale,
  showSettings,
  modelConfigs,
  lang,
  sceneConfigs,
  LoadingComponent,
  Input,
  speakerStyle,
  speakerContainerStyle,
}) => {
  const [inputText, setInputText] = useState("");
  const [anim, setAnim] = useState(idleUrl);
  const { modelUrl, virtualService, cores } = useVirtual({
    virtualId,
    userName,
    virtualName,
    initAccessToken: !!initAccessToken
      ? initAccessToken
      : UNSAFE_initAccessToken,
    onPromptError,
    metadata,
    onInitCompleted,
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
  // const [talking, setTalking] = useState(false);
  const [currentVrm, setCurrentVrm] = useState<VRM | undefined>();
  const isLLMSupported = useMemo(() => {
    return cores.includes("llm");
  }, [cores]);
  const isTTSSupported = useMemo(() => {
    return cores.includes("tts");
  }, [cores]);
  const [localModelConfigs, setLocalModelConfigs] = useState<
    | {
        [boneName: string]: {
          stiffness?: number;
          dragForce?: number;
          hitRadius?: number;
        };
      }
    | undefined
  >();
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const sendPrompt = async (rawContent: string | Blob) => {
    if (
      (configs?.ttsMode || !isLLMSupported) &&
      typeof rawContent === "string"
    ) {
      try {
        // if tts mode, just use the getTTSPrompt function to get the text to speech result
        const url = await virtualService.getTTSResponse(rawContent);
        const audio = new Audio(url);
        audio.load();
        await audio.play();
      } catch (err: any) {
        // console.log("tts err", err);
        if (!!onPromptError) onPromptError(err);
      }
      return;
    }
    // setTalking(false);
    const canSendMessage = !!validateMessageCapability
      ? validateMessageCapability()
      : true;
    if (!canSendMessage) {
      return;
    }
    let content = rawContent;
    try {
      if (typeof content === "string") {
        if (!!onUserMessageCreated)
          await onUserMessageCreated({
            text: content,
          });
      }
      if (!!onBeforeSendMessage) {
        content = await onBeforeSendMessage(rawContent);
      }
      setLatestBotMessage(undefined);
      const prompt = await virtualService.createPrompt(content, configs);

      // on prompt received, create new chat message object
      if (typeof content !== "string") {
        if (!!onUserMessageCreated)
          await onUserMessageCreated({
            text: prompt.prompt,
          });
      }
      if (!!prompt.audioUid) {
        await playAudioAndAnimation(prompt);
      } else {
        if (!!onVirtualMessageCreated)
          await onVirtualMessageCreated({
            prompt: prompt.prompt,
            text: prompt.text,
            body: prompt.body,
            audioUid: prompt.audioUid,
          });
        setLatestBotMessage(prompt);
        let audioUid = "";
        if (isTTSSupported && !!prompt.text) {
          audioUid = await virtualService.getTTSResponse(prompt.text);
        }
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
        await playAudioAndAnimation({ ...prompt, audioUid: audioUid });
      }
    } catch (err: any) {
      setAnim(idleUrl);
      setEmotion("idle");
      if (!!onErrorSendingMessage) onErrorSendingMessage(err);
    }
  };

  const playAudioAndAnimation = async (msg: PromptType) => {
    try {
      // setTalking(true);
      if (!msg?.audioUid) {
        // setTalking(false);
        return;
      }
      const audio = new Audio(`${msg.audioUid ?? ""}`);
      const audioContext = new AudioContext();
      await startLipSync(
        currentVrm,
        audio,
        audioContext,
        () => {
          setSpeakCount((prev) => prev + 1);
          setAnim(msg.body?.url ?? idleUrl);
          setEmotion(
            (msg.body?.sentiment ?? "idle") as
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
          // setTalking(false);
          // console.log("Resetting audio and animation");
          setAnim(idleUrl);
          setEmotion("idle");
        },
        () => {
          if (!!onAudioErr) onAudioErr();
          // setTalking(false);
        }
      );
      // audioContext.createGain();
      await audioContext.resume();
      audio.preload = "metadata";
      await audio.play();
    } catch (err: any) {
      console.log("play audio error", err);
      // setTalking(false);
    }
  };

  const handleSendClick = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");

    await sendPrompt(text);
  };

  const handleSendVoice = async (blob: Blob) => {
    await sendPrompt(blob);
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
      {showSettings && (
        <ModelConfigs
          vrm={currentVrm}
          configs={localModelConfigs}
          setConfigs={setLocalModelConfigs}
        />
      )}
      <div className="virtual-w-full virtual-h-full virtual-relative">
        <CharacterScene
          sceneConfigs={sceneConfigs}
          scale={scale}
          LoadingComponent={LoadingComponent}
          onProgressChange={(v) => {
            if (v < 100) {
              setAnim(idleUrl);
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
            // console.log("Resetting audio and animation");
            setAnim(idleUrl);
            setEmotion("idle");
          }}
          aside={aside}
          emotion={emotion}
          position={position}
          modelConfigs={localModelConfigs ?? modelConfigs}
        />
      </div>
      {!hideInput &&
        (isLLMSupported || isTTSSupported) &&
        (!!Input ? (
          <Input
            lang={lang}
            value={inputText}
            onChange={handleInputChange}
            onSubmit={handleSendClick}
            disabled={anim === "think"}
            onSubmitVoice={handleSendVoice}
            hideVoice={hideVoice || !isLLMSupported}
            onFocus={() => {
              if (!!onInputFocused) onInputFocused();
            }}
            onBlur={() => {
              if (!!onInputBlurred) onInputBlurred();
            }}
            className={inputClassName}
            style={inputStyle}
            Toolbar={
              !!latestBotMessage?.audioUid && !hideInput ? (
                <IconButton
                  aria-label="Play / Pause"
                  icon={
                    <Icon
                      as={HiSpeakerWave}
                      className="!virtual-text-white !virtual-text-xl"
                      sx={speakerStyle}
                    />
                  }
                  className={`!virtual-rounded-full !virtual-w-10 !virtual-h-10 !virtual-bg-black/30 hover:!virtual-bg-black/30 !virtual-backdrop-blur-xl !virtual-z-40 !virtual-self-end`}
                  sx={speakerContainerStyle}
                  isDisabled={!latestBotMessage.audioUid}
                  onClick={async () => {
                    if (!latestBotMessage?.audioUid) return;
                    await playAudioAndAnimation(latestBotMessage);
                  }}
                />
              ) : (
                <></>
              )
            }
          />
        ) : (
          <CharacterInput
            lang={lang}
            value={inputText}
            onChange={handleInputChange}
            onSubmit={handleSendClick}
            disabled={anim === "think"}
            onSubmitVoice={handleSendVoice}
            hideVoice={hideVoice || !isLLMSupported}
            onFocus={() => {
              if (!!onInputFocused) onInputFocused();
            }}
            onBlur={() => {
              if (!!onInputBlurred) onInputBlurred();
            }}
            className={inputClassName}
            style={inputStyle}
            Toolbar={
              !!latestBotMessage?.audioUid && !hideInput ? (
                <IconButton
                  aria-label="Play / Pause"
                  icon={
                    <Icon
                      as={HiSpeakerWave}
                      className="!virtual-text-white !virtual-text-xl"
                      sx={speakerStyle}
                    />
                  }
                  className={`!virtual-rounded-full !virtual-w-10 !virtual-h-10 !virtual-bg-black/30 hover:!virtual-bg-black/30 !virtual-backdrop-blur-xl !virtual-z-40 !virtual-self-end`}
                  sx={speakerContainerStyle}
                  isDisabled={!latestBotMessage.audioUid}
                  onClick={async () => {
                    if (!latestBotMessage?.audioUid) return;
                    await playAudioAndAnimation(latestBotMessage);
                  }}
                />
              ) : (
                <></>
              )
            }
          />
        ))}
    </form>
  );
};
