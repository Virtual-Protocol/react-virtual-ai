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
          className={`z-10 w-full flex flex-col p-3 gap-3 items-center fixed lg:w-[600px] bottom-[88px] ${className}`}
        >
          {!!Toolbar && Toolbar}
          <div className="w-full relative backdrop-blur-xl flex flex-row items-center gap-1 px-2 py-1 rounded-2xl bg-black/20">
            <audio ref={(el: HTMLAudioElement) => setAudioEl(el)}>
              <source src={recordingUrl} />
            </audio>
            <IconButton
              aria-label="Cancel Recording"
              icon={
                <Icon as={IoMdCloseCircle} className="text-red-400 text-sm" />
              }
              className="rounded-full hover:bg-red-400/50"
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
              className={`text-base rounded-xl w-full px-4 py-2 hover:opacity-50 text-center font-wenhei text-white`}
            >
              {isPlaying ? "Stop" : "Play"}
            </button>
            <IconButton
              aria-label="Send Message"
              isDisabled={disabled || loading}
              icon={<Icon as={IoMdSend} className="text-white text-sm" />}
              className="rounded-full w-10 h-10"
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
          className={`z-10 w-full flex flex-col p-3 gap-3 items-center fixed bottom-[88px] lg:w-[600px] ${className}`}
        >
          {!!Toolbar && Toolbar}
          <div className="w-full relative backdrop-blur-xl flex flex-row items-center gap-1 px-2 py-1 rounded-2xl bg-black/20">
            <IconButton
              aria-label="Cancel Recording"
              icon={
                <Icon as={IoMdCloseCircle} className="text-red-400 text-sm" />
              }
              className="rounded-full hover:bg-red-400/50"
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
              className="font-wenhei flex flex-row justify-between text-base text-white bg-transparent rounded-xl w-full px-4 py-2 hover:opacity-50 text-center"
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
          className={`z-10 w-full flex flex-col p-3 gap-3 items-center fixed bottom-[88px] lg:w-[600px] ${className}`}
        >
          {!!Toolbar && Toolbar}
          <div className="w-full relative backdrop-blur-xl flex flex-row items-center gap-1 px-2 py-1 rounded-2xl bg-black/20">
            <button
              onClick={() => {
                startRecording();
                setAllowedToSendVoice(false);
              }}
              className="font-wenhei text-base text-white bg-transparent rounded-xl w-full py-2 hover:opacity-50 text-center"
            >
              Tap to record
            </button>
            <IconButton
              aria-label="Change Keyboard"
              isDisabled={disabled || loading}
              icon={<Icon as={FaKeyboard} className="text-white text-lg" />}
              className="rounded-full hover:bg-[#b9c3ff]/50"
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
        className={`z-10 w-full flex flex-col p-3 gap-3 items-center fixed bottom-[88px] ${className}`}
      >
        {!!Toolbar && Toolbar}
        <div className="w-full relative backdrop-blur-xl flex flex-row items-center gap-1 px-2 py-1 rounded-2xl bg-black/20">
          <Textarea
            placeholder="Start typing..."
            className="font-wenhei text-white text-sm w-full border-0 bg-transparent"
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
              icon={<Icon as={IoMdSend} className="text-white text-sm" />}
              className="rounded-full w-10 h-10"
            />
          )}
          {!value.trim() && !hideVoice && (
            <IconButton
              aria-label="Send Voice"
              isDisabled={disabled || loading}
              icon={<Icon as={FaMicrophone} className="text-white text-lg" />}
              className="rounded-full hover:bg-[#b9c3ff]/50"
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
