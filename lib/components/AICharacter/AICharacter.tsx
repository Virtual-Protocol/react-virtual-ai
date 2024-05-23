"use client";

import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import { VRM } from "@pixiv/three-vrm";
import { blink, fadeByEmotion } from "../../utils/model";
import gsap from "gsap";
import { VrmService } from "../../services/VrmService";
import "../../index.css";
import { degToRad } from "three/src/math/MathUtils.js";

type AICharacterType = {
  animation: string;
  url?: string;
  onAudioEnd?: Function;
  onLoad?: (progress: number) => void;
  onLoadError?: (err: any) => void;
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
  modelConfigs?: {
    [boneName: string]: {
      stiffness?: number;
      dragForce?: number;
      hitRadius?: number;
    };
  };
  currentVrm?: VRM;
  setCurrentVrm: (v?: VRM) => void;
  scale?: number;
  zoom?: number;
  sceneConfigs?: {
    linear: boolean;
    flat: boolean;
    shadows: boolean;
    enableZoom: boolean;
  };
  intensity?: number;
};

export const AICharacter: React.FC<AICharacterType> = ({
  animation,
  url,
  modelConfigs,
  onAudioEnd,
  onLoad,
  aside,
  speakCount = 0,
  emotion,
  position,
  currentVrm,
  setCurrentVrm,
  onLoadError,
  zoom,
  scale,
  sceneConfigs,
  intensity,
}) => {
  const [camera, setCamera] = useState<THREE.Camera>();
  const [progress, setProgress] = useState(0);
  const [vrmService, setVrmService] = useState<VrmService | undefined>();

  const defaultModelConfigs: {
    [boneName: string]: {
      stiffness?: number;
      dragForce?: number;
      hitRadius?: number;
    };
  } = useMemo(() => {
    if (!currentVrm?.springBoneManager?.joints) return {};
    const conf: {
      [boneName: string]: {
        stiffness?: number;
        dragForce?: number;
        hitRadius?: number;
      };
    } = {};
    currentVrm.springBoneManager.joints.forEach((e) => {
      if (e.bone.name.includes("Skirt")) {
        conf[e.bone.name] = {
          stiffness: 2,
          dragForce: 0.35,
          hitRadius: 0.25,
        };
        return;
      }
      conf[e.bone.name] = {
        stiffness: 2,
        dragForce: 0.35,
        hitRadius: 0.5,
      };
    });
    return conf;
  }, [currentVrm?.springBoneManager?.joints]);

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
    if (!camera) return;
    const c = camera as THREE.PerspectiveCamera;
    c.zoom = zoom ?? 2;
    c.updateProjectionMatrix();
  }, [camera, zoom]);

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
      modelConfigs: modelConfigs,
      onLoad: (vrm) => {
        setCurrentVrm(vrm);
        vrm.scene.castShadow = true;
        vrm.scene.traverse((child) => {
          // @ts-ignore
          if (child.isMesh) {
            child.castShadow = true;
          }
        });
      },
      onLoadProgress: (p) => {
        setProgress(p);
      },
      onLoadError: (error) => {
        if (!!onLoadError) onLoadError(error);
      },
    });
    setVrmService(newVrmService);
    newVrmService.loadModel();
  }, [url, camera]);

  useEffect(() => {
    if (!vrmService) return;
    vrmService.updateModelConfigs(modelConfigs ?? defaultModelConfigs);
  }, [modelConfigs, vrmService, defaultModelConfigs]);

  useFrame((_, delta) => {
    currentVrm?.update(delta);
    vrmService?.mixer?.update(delta);
    if (animation?.toLowerCase()?.includes("dance")) vrmService?.ik?.update();

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

    if (
      !!currentVrm?.lookAt &&
      !!camera &&
      !animation?.toLowerCase().includes("dance")
    ) {
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
    vrmService.fadeToAnimationUrl(animation, animation?.includes("idle.vmd"));
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
      zoom={zoom ?? 2} // Zoom factor when half the polar-max is reached
      rotation={[0, 0, 0]} // Default rotation
      polar={[-Math.PI / 2, Math.PI / 2]} // Vertical limits
      azimuth={[-Infinity, Infinity]} // Horizontal limits
      config={{ mass: 1, tension: 170, friction: 26 }} // Spring config
    >
      <primitive
        object={currentVrm.scene}
        position={position ?? [0, -10, 0]}
        scale={scale ?? 10}
        castShadow
      />
      {sceneConfigs?.shadows && (
        <mesh
          receiveShadow
          rotation={[degToRad(-90), 0, 0]}
          scale={[20, 20, 1]}
          position={[0, -10, 0]}
        >
          <planeGeometry />
          <meshStandardMaterial
            shadowSide={THREE.DoubleSide}
            color="white"
            transparent
          />
        </mesh>
      )}
      <directionalLight
        color="#FFFFFF"
        intensity={intensity ?? 0.25}
        position={new THREE.Vector3(2, 10, 3)}
        castShadow
      />
      <directionalLight
        color="#FFFFFF"
        intensity={intensity ?? 0.25}
        position={new THREE.Vector3(-2, 10, 3)}
        castShadow
      />
      <directionalLight
        color="#FFFFFF"
        intensity={intensity ?? 0.25}
        position={new THREE.Vector3(2, -10, 3)}
        castShadow
      />
      <directionalLight
        color="#FFFFFF"
        intensity={intensity ?? 0.25}
        position={new THREE.Vector3(-2, -10, 3)}
        castShadow
      />
      <directionalLight
        color="#FFFFFF"
        intensity={intensity ?? 0.25}
        position={new THREE.Vector3(-2, -10, -3)}
        castShadow
      />
      <ambientLight intensity={intensity ?? 0.25} color="#FFF" />
    </PresentationControls>
  );
};
