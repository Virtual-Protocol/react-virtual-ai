"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { AICharacter } from "../AICharacter/AICharacter";
import { Vector3 } from "three";
import { VirtualConfigType } from "../../types/VirtualConfigType";
import "../../index.css";
import { SimpleAICharacter } from "../SimpleAICharacter/SimpleAICharacter";

type CharacterSceneType = {
  animation: string;
  modelUrl?: string;
  virtualConfig: VirtualConfigType;
  onAudioEnd?: Function;
  aside?: boolean;
  speakCount?: number;
  emotion?: string;
  zoom?: number;
  position?: number[];
  loadingText?: string;
  multiple?: boolean;
};

export const CharacterScene: React.FC<CharacterSceneType> = ({
  animation,
  modelUrl,
  virtualConfig,
  onAudioEnd,
  aside,
  speakCount = 0,
  emotion,
  zoom,
  position,
  loadingText,
  multiple,
}) => {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(false);
  }, [modelUrl]);

  return (
    <div
      className={`lg:rounded-3xl flex relative items-center justify-center h-full w-full`}
    >
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl px-4 py-2 bg-black/30 flex items-center justify-center pointer-events-none ${
          done ? "fadeOut" : ""
        }`}
      >
        <p
          className={`font-wenhei text-lg text-white animate-flicker text-center w-fit`}
        >
          {loadingText ?? "Your Virtual is Dressing Up..."}
        </p>
      </div>
      <Suspense fallback={null}>
        <Canvas
          camera={{
            position: [0, 3, 15],
            zoom: zoom ? zoom : 2,
          }}
          linear
          flat
        >
          {!!modelUrl &&
            (multiple ? (
              <SimpleAICharacter
                animation={animation}
                url={modelUrl}
                speakCount={speakCount}
                virtualConfig={virtualConfig}
                onAudioEnd={onAudioEnd}
                onLoad={() => {
                  setDone(true);
                }}
                aside={aside}
                emotion={emotion}
                position={position}
              />
            ) : (
              <AICharacter
                animation={animation}
                url={modelUrl}
                speakCount={speakCount}
                virtualConfig={virtualConfig}
                onAudioEnd={onAudioEnd}
                onLoad={() => {
                  setDone(true);
                }}
                aside={aside}
                emotion={emotion}
                position={position}
              />
            ))}
          <directionalLight
            color="#FFFFFF"
            intensity={1.5294117647058822}
            position={new Vector3(2, 0, 3)}
          />
          <ambientLight intensity={1.6666666666666665} color="#FFF" />
        </Canvas>
      </Suspense>
    </div>
  );
};
