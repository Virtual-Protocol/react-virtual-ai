"use client";

import { Canvas } from "@react-three/fiber";
import { ReactNode, Suspense, useEffect, useState } from "react";
import { AICharacter } from "../AICharacter/AICharacter";
import "../../index.css";
import { VRM } from "@pixiv/three-vrm";
import { OrbitControls } from "@react-three/drei";

type CharacterSceneType = {
  animation: string;
  modelUrl?: string;
  onAudioEnd?: Function;
  aside?: boolean;
  speakCount?: number;
  emotion?:
    | "idle"
    | "think"
    | "anger"
    | "disgust"
    | "fear"
    | "joy"
    | "neutral"
    | "sadness"
    | "surprise";
  zoom?: number;
  position?: number[];
  loadingText?: string;
  multiple?: boolean;
  modelConfigs?: {
    [boneName: string]: {
      stiffness?: number;
      dragForce?: number;
      hitRadius?: number;
    };
  };
  stiffness?: number;
  dragForce?: number;
  hitRadius?: number;
  currentVrm?: VRM;
  setCurrentVrm?: (v?: VRM) => void;
  onProgressChange?: (v: number) => void;
  onLoadError?: (err: any) => void;
  scale?: number;
  sceneConfigs?: {
    linear: boolean;
    flat: boolean;
    shadows: boolean;
    enableZoom: boolean;
  };
  renderLoadingComponent?: (progress: number) => ReactNode;
  intensity?: number;
};

export const CharacterScene: React.FC<CharacterSceneType> = ({
  animation,
  modelUrl,
  onAudioEnd,
  aside,
  speakCount = 0,
  emotion,
  zoom,
  position,
  loadingText,
  modelConfigs,
  currentVrm,
  setCurrentVrm,
  onProgressChange,
  onLoadError,
  scale,
  sceneConfigs,
  renderLoadingComponent,
  intensity,
  stiffness,
  hitRadius,
  dragForce,
}) => {
  const [progress, setProgress] = useState(0);
  const [localVrm, setLocalVrm] = useState<VRM | undefined>();

  useEffect(() => {
    if (!!onProgressChange) onProgressChange(progress);
  }, [progress]);

  return (
    <div
      className={`virtual-lg:rounded-3xl virtual-flex virtual-relative virtual-items-center virtual-justify-center virtual-h-full virtual-w-full`}
    >
      {!!renderLoadingComponent ? (
        modelUrl === "" || progress >= 100 ? undefined : (
          renderLoadingComponent(progress)
        )
      ) : (
        <div
          className={`virtual-absolute virtual-top-1/2 virtual-left-1/2 virtual--translate-x-1/2 virtual--translate-y-1/2 virtual-rounded-2xl virtual-px-4 virtual-py-2 virtual-bg-black/30 virtual-flex virtual-items-center virtual-justify-center virtual-pointer-events-none virtual-flex-col ${
            modelUrl === "" || progress >= 100 ? "virtual-fadeOut" : ""
          }`}
        >
          <p
            className={`virtual-font-wenhei virtual-text-lg virtual-text-white virtual-animate-flicker virtual-text-center virtual-w-fit`}
          >
            {`${loadingText ?? "Your Virtual is Dressing Up..."}`}
          </p>
          <div className="virtual-bg-white/20 virtual-h-[4px] virtual-w-[80%] virtual-rounded-3xl virtual-mb-2 virtual-mt-4">
            <div
              className="virtual-bg-white virtual-h-[4px] virtual-rounded-3xl"
              style={{
                width: `${progress}%`,
              }}
            ></div>
          </div>
        </div>
      )}
      <Suspense fallback={null}>
        <Canvas
          camera={{
            position: [0, 3, 15],
            zoom: zoom ? zoom : 2,
          }}
          linear={sceneConfigs?.linear ?? true}
          flat={sceneConfigs?.flat ?? true}
          shadows={sceneConfigs?.shadows ?? true}
        >
          <OrbitControls
            makeDefault={sceneConfigs?.enableZoom ?? true}
            enabled={sceneConfigs?.enableZoom ?? true}
            maxDistance={40}
            minDistance={5}
          />
          {!!modelUrl && (
            <AICharacter
              sceneConfigs={sceneConfigs}
              animation={animation}
              url={modelUrl}
              speakCount={speakCount}
              onAudioEnd={onAudioEnd}
              onLoad={(v) => {
                setProgress(v);
              }}
              zoom={zoom ?? 2}
              aside={aside}
              emotion={emotion}
              position={position}
              modelConfigs={modelConfigs}
              currentVrm={!!currentVrm ? currentVrm : localVrm}
              setCurrentVrm={!!setCurrentVrm ? setCurrentVrm : setLocalVrm}
              onLoadError={onLoadError}
              scale={scale}
              intensity={intensity}
              stiffness={stiffness}
              dragForce={dragForce}
              hitRadius={hitRadius}
            />
          )}
        </Canvas>
      </Suspense>
    </div>
  );
};
