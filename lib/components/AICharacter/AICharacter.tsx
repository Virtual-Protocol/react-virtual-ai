"use client";

import * as THREE from "three";
import { useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import { VRM } from "@pixiv/three-vrm";
import { blink, fadeByEmotion } from "../../utils/model";
import gsap from "gsap";
import { VrmService } from "../../services/VrmService";

type AICharacterType = {
  animation: string;
  url?: string;
  onAudioEnd?: Function;
  onLoad?: (progress: number) => void;
  onLoadErr?: (err: any) => void;
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
  position?: number[];
  stiffness?: number;
  currentVrm?: VRM;
  setCurrentVrm: (v?: VRM) => void;
};

export const AICharacter: React.FC<AICharacterType> = ({
  animation,
  url,
  stiffness,
  onAudioEnd,
  onLoad,
  aside,
  speakCount = 0,
  emotion,
  position,
  currentVrm,
  setCurrentVrm,
  onLoadErr,
}) => {
  const [camera, setCamera] = useState<THREE.Camera>();
  const [progress, setProgress] = useState(0);
  const [vrmService, setVrmService] = useState<VrmService | undefined>();

  useThree(({ camera: c }) => {
    if (!camera) setCamera(c);
  });

  useEffect(() => {
    if (!camera) return;
    if (aside) {
      gsap.to(camera.position, {
        x: 1.5,
      });
    } else {
      gsap.to(camera.position, {
        x: 0,
      });
    }
  }, [aside]);

  useEffect(() => {
    if (!!onLoad) onLoad(progress);
  }, [progress]);

  useEffect(() => {
    if (!url || !camera) {
      setVrmService(undefined);
      setCurrentVrm(undefined);
      if (!!onAudioEnd) {
        onAudioEnd();
      }
      return;
    }
    const newVrmService = new VrmService({
      vrmUrl: url,
      camera: camera,
      stiffness: stiffness,
      onLoad: (vrm) => {
        setCurrentVrm(vrm);
      },
      onLoadProgress: (p) => {
        setProgress(p);
      },
      onLoadErr: (error) => {
        if (!!onLoadErr) onLoadErr(error);
      },
    });
    setVrmService(newVrmService);
    newVrmService.loadModel();
  }, [url, camera]);

  useFrame((_, delta) => {
    currentVrm?.update(delta);
    vrmService?.mixer?.update(delta);

    // blink eyes every 5 seconds
    if (
      !!currentVrm &&
      new Date().getTime() - (vrmService?.lastCloseTime?.getTime() ?? 0) >
        5000 &&
      !vrmService?.isAnimating
    ) {
      blink(currentVrm);
      if (!!vrmService) vrmService.lastCloseTime = new Date();
    }

    if (!!currentVrm?.lookAt && !!camera) {
      const headBone = currentVrm.humanoid.getNormalizedBoneNode("head");
      if (headBone) {
        const lookAt = new THREE.Vector3();
        lookAt.subVectors(
          headBone.position,
          new THREE.Vector3(
            camera.position.x,
            camera.position.y - 3,
            camera.position.z
          )
        );

        headBone.lookAt(lookAt);

        if (headBone.rotation.x < -0.6) headBone.rotation.x = -0.6;
        if (headBone.rotation.x > 0.6) headBone.rotation.x = 0.6;
        if (headBone.rotation.y < -0.6) headBone.rotation.y = -0.6;
        if (headBone.rotation.y > 0.6) headBone.rotation.y = 0.6;
        headBone.rotation.z = 0;
      }
    }
  });

  useEffect(() => {
    if (!animation || !vrmService || !url) return;
    vrmService.fadeToAnimationUrl(animation);
  }, [animation, speakCount, url, vrmService]);

  useEffect(() => {
    if (!emotion || !currentVrm) return;
    fadeByEmotion(
      currentVrm,
      emotion as
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
  }, [emotion, speakCount, currentVrm]);

  if (!currentVrm?.scene || progress < 100) return <></>;

  return (
    <PresentationControls
      enabled={true} // the controls can be disabled by setting this to false
      global={true} // Spin globally or by dragging the model
      cursor={false} // Whether to toggle cursor style on drag
      snap={false} // Snap-back to center (can also be a spring config)
      speed={2} // Speed factor
      zoom={1} // Zoom factor when half the polar-max is reached
      rotation={[0, 0, 0]} // Default rotation
      polar={[-Math.PI / 2, Math.PI / 2]} // Vertical limits
      azimuth={[-Infinity, Infinity]} // Horizontal limits
      config={{ mass: 1, tension: 170, friction: 26 }} // Spring config
    >
      <primitive
        object={currentVrm.scene}
        position={position ?? [0, -10, 0]}
        scale={10}
      />
    </PresentationControls>
  );
};
