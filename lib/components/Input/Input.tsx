"use client";

import { useEffect, useMemo, useState } from "react";
import { ChakraProvider, Icon, IconButton, Textarea } from "@chakra-ui/react";
import { FaMicrophone } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { FaKeyboard } from "react-icons/fa6";
import { IoMdCloseCircle } from "react-icons/io";
import { secondsToTimeStr } from "../../utils/time";
import { ChangeEventHandler, ReactElement } from "react";
import "../../index.css";

type InputProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  onSubmit: Function;
  disabled?: boolean;
  loading: boolean;
  onSubmitVoice: (b: Blob) => void;
  onVoiceCall: Function;
  hideVoice?: boolean;
  onFocus?: Function;
  className?: string;
  Toolbar?: ReactElement;
  onBlur?: Function;
};

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  loading,
  onSubmitVoice,
  hideVoice,
  onFocus,
  className,
  Toolbar,
  onBlur,
}) => {
  const [isVoice, setIsVoice] = useState(false);
  const [allowedToSendVoice, setAllowedToSendVoice] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | undefined>();

  const {
    startRecording,
    stopRecording,
    recordingBlob,
    isRecording,
    recordingTime,
  } = useAudioRecorder();

  useEffect(() => {
    if (!audioEl) return;
    audioEl.addEventListener("play", () => {
      setIsPlaying(true);
    });
    audioEl.addEventListener("pause", () => {
      setIsPlaying(false);
    });
  }, [audioEl]);

  useEffect(() => {
    return () => {
      if (!!onBlur) onBlur();
    };
  }, []);

  const recordingUrl = useMemo(() => {
    if (!recordingBlob) return "";
    const audioUrl = URL.createObjectURL(recordingBlob);
    // downloadBlob(recordingBlob, "audio.webm");
    return audioUrl;
  }, [recordingBlob]);

  if (!isRecording && !!recordingUrl && allowedToSendVoice && !!recordingBlob) {
    return (
      <ChakraProvider>
        <div
          className={`virtual-z-10 virtual-w-full virtual-flex virtual-flex-col virtual-p-3 virtual-gap-3 virtual-items-center virtual-fixed virtual-lg:w-[600px] virtual-bottom-[88px] ${className}`}
        >
          {!!Toolbar && Toolbar}
          <div className="virtual-w-full virtual-relative virtual-backdrop-blur-xl virtual-flex virtual-flex-row virtual-items-center virtual-gap-1 virtual-px-2 virtual-py-1 virtual-rounded-2xl virtual-bg-black/20">
            <audio ref={(el: HTMLAudioElement) => setAudioEl(el)}>
              <source src={recordingUrl} />
            </audio>
            <IconButton
              aria-label="Cancel Recording"
              icon={
                <Icon
                  as={IoMdCloseCircle}
                  className="virtual-text-red-400 virtual-text-sm"
                />
              }
              className="virtual-rounded-full virtual-hover:bg-red-400/50"
              onClick={() => {
                setAllowedToSendVoice(false);
              }}
            />
            <button
              onClick={() => {
                // Play recorded voice
                if (!audioEl) return;
                if (isPlaying) {
                  audioEl.pause();
                } else {
                  audioEl.load();
                  audioEl.play();
                }
              }}
              className={`virtual-text-base virtual-rounded-xl virtual-w-full virtual-px-4 virtual-py-2 virtual-hover:opacity-50 virtual-text-center virtual-font-wenhei virtual-text-white`}
            >
              {isPlaying ? "Stop" : "Play"}
            </button>
            <IconButton
              aria-label="Send Message"
              isDisabled={disabled || loading}
              icon={
                <Icon
                  as={IoMdSend}
                  className="virtual-text-white virtual-text-sm"
                />
              }
              className="virtual-rounded-full virtual-w-10 virtual-h-10"
              onClick={async () => {
                onSubmitVoice(recordingBlob);
                // Reset states
                setIsVoice(false);
                setAllowedToSendVoice(false);
              }}
            />
          </div>
        </div>
      </ChakraProvider>
    );
  }

  if (isRecording) {
    // voice message input when recording
    return (
      <ChakraProvider>
        <div
          className={`virtual-z-10 virtual-w-full virtual-flex virtual-flex-col virtual-p-3 virtual-gap-3 virtual-items-center virtual-fixed virtual-bottom-[88px] virtual-lg:w-[600px] ${className}`}
        >
          {!!Toolbar && Toolbar}
          <div className="virtual-w-full virtual-relative virtual-backdrop-blur-xl virtual-flex virtual-flex-row virtual-items-center virtual-gap-1 virtual-px-2 virtual-py-1 virtual-rounded-2xl virtual-bg-black/20">
            <IconButton
              aria-label="Cancel Recording"
              icon={
                <Icon
                  as={IoMdCloseCircle}
                  className="virtual-text-red-400 virtual-text-sm"
                />
              }
              className="virtual-rounded-full virtual-hover:bg-red-400/50"
              onClick={() => {
                stopRecording();
                setAllowedToSendVoice(false);
              }}
            />
            <button
              onClick={() => {
                stopRecording();
                setAllowedToSendVoice(true);
              }}
              className="virtual-font-wenhei virtual-flex virtual-flex-row virtual-justify-between virtual-text-base virtual-text-white virtual-bg-transparent virtual-rounded-xl virtual-w-full virtual-px-4 virtual-py-2 virtual-hover:opacity-50 virtual-text-center"
            >
              Recording...
              <p>{secondsToTimeStr(recordingTime)}</p>
            </button>
          </div>
        </div>
      </ChakraProvider>
    );
  }

  if (isVoice) {
    // voice message input
    return (
      <ChakraProvider>
        <div
          className={`virtual-z-10 virtual-w-full virtual-flex virtual-flex-col virtual-p-3 virtual-gap-3 virtual-items-center virtual-fixed virtual-bottom-[88px] virtual-lg:w-[600px] ${className}`}
        >
          {!!Toolbar && Toolbar}
          <div className="virtual-w-full virtual-relative virtual-backdrop-blur-xl virtual-flex virtual-flex-row virtual-items-center virtual-gap-1 virtual-px-2 virtual-py-1 virtual-rounded-2xl virtual-bg-black/20">
            <button
              onClick={() => {
                startRecording();
                setAllowedToSendVoice(false);
              }}
              className="virtual-font-wenhei virtual-text-base virtual-text-white virtual-bg-transparent virtual-rounded-xl virtual-w-full virtual-py-2 virtual-hover:opacity-50 virtual-text-center"
            >
              Tap to record
            </button>
            <IconButton
              aria-label="Change Keyboard"
              isDisabled={disabled || loading}
              icon={
                <Icon
                  as={FaKeyboard}
                  className="virtual-text-white virtual-text-lg"
                />
              }
              className="virtual-rounded-full virtual-hover:bg-[#b9c3ff]/50"
              onClick={() => {
                setIsVoice(false);
              }}
            />
          </div>
        </div>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <div
        className={`virtual-z-10 virtual-w-full virtual-flex virtual-flex-col virtual-p-3 virtual-gap-3 virtual-items-center virtual-fixed virtual-bottom-[88px] ${className}`}
      >
        {!!Toolbar && Toolbar}
        <div className="virtual-w-full virtual-relative virtual-backdrop-blur-xl virtual-flex virtual-flex-row virtual-items-center virtual-gap-1 virtual-px-2 virtual-py-1 virtual-rounded-2xl virtual-bg-black/20">
          <Textarea
            placeholder="Start typing..."
            className="virtual-font-wenhei virtual-text-white virtual-text-sm virtual-w-full virtual-border-0 virtual-bg-transparent"
            value={value}
            onChange={onChange}
            onKeyUp={(e) => {
              if (!onSubmit || disabled) return;
              if (e.key === "Enter" && !e.shiftKey) {
                onSubmit();
              }
            }}
            onFocus={() => {
              if (!!onFocus) onFocus();
            }}
            onBlur={() => {
              if (!!onBlur) onBlur();
            }}
            isDisabled={disabled || loading}
            rows={1}
          />
          {!!value.trim() && (
            <IconButton
              aria-label="Send Message"
              type="submit"
              isDisabled={disabled || loading}
              icon={
                <Icon
                  as={IoMdSend}
                  className="virtual-text-white virtual-text-sm"
                />
              }
              className="virtual-rounded-full virtual-w-10 virtual-h-10"
            />
          )}
          {!value.trim() && !hideVoice && (
            <IconButton
              aria-label="Send Voice"
              isDisabled={disabled || loading}
              icon={
                <Icon
                  as={FaMicrophone}
                  className="virtual-text-white virtual-text-lg"
                />
              }
              className="virtual-rounded-full virtual-hover:bg-[#b9c3ff]/50"
              onClick={() => {
                setIsVoice(true);
              }}
            />
          )}
        </div>
      </div>
    </ChakraProvider>
  );
};
