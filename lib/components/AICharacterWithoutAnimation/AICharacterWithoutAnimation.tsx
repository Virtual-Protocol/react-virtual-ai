"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PresentationControls, useGLTF, useProgress } from "@react-three/drei";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { blink, fadeByEmotion } from "../../utils/model";
import gsap from "gsap";
import "../../index.css";

export type AICharacterType = {
  animation: string;
  url?: string;
  onAudioEnd?: Function;
  onLoad?: Function;
  aside?: boolean;
  speakCount?: number;
  emotion?: string;
  position?: number[];
  stiffness?: number;
};

export const AICharacterWithoutAnimation: React.FC<AICharacterType> = ({
  url,
  onAudioEnd,
  onLoad,
  aside,
  speakCount = 0,
  emotion,
  position,
  stiffness,
}) => {
  const gltf = useGLTF(url ?? "", true, true, (loader) => {
    // @ts-ignore
    loader.register((parser) => {
      // @ts-ignore
      return new VRMLoaderPlugin(parser);
    });
  });
  const progress = useProgress();
  const [camera, setCamera] = useState<THREE.Camera>();
  const tmp = useRef();
  const [currentVrm, setCurrentVrm] = useState<VRM | undefined>();
  const [lastCloseTime, setLastCloseTime] = useState<Date | undefined>();

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
    if (progress.progress >= 100 && !!onLoad) onLoad();
  }, [progress]);

  useEffect(() => {
    const v: VRM = gltf.userData.vrm;
    if (!v) return;
    setCurrentVrm(v);
  }, [gltf]);

  useEffect(() => {
    if (!currentVrm) return;
    if (!!currentVrm.lookAt && !!camera) {
      currentVrm.lookAt.target = camera;
      currentVrm.lookAt.autoUpdate = true;
    }
    setTimeout(() => {
      if (!!onLoad) onLoad();
    }, 2000);
    // Disable frustum culling
    currentVrm?.scene.traverse((obj: any) => {
      obj.frustumCulled = false;
    });
    currentVrm.humanoid.resetNormalizedPose();
    VRMUtils.rotateVRM0(currentVrm); // rotate the vrm around y axis if the vrm is VRM0.0
    VRMUtils.removeUnnecessaryJoints(currentVrm.scene);
    VRMUtils.removeUnnecessaryVertices(currentVrm.scene);

    // restrict stiffness
    // console.log("Joints", v.springBoneManager?.joints);
    currentVrm.springBoneManager?.joints.forEach((e) => {
      // console.log("joints", e.bone.name);
      if (e.bone.name.includes("Skirt")) {
        e.settings.stiffness = 5;
        e.settings.dragForce = 0.2;
        e.settings.hitRadius = 1;
        return;
      }
      //  e.settings.dragForce = 1
      e.settings.stiffness = stiffness ?? 6;
    });

    return () => {
      try {
        if (!currentVrm) return;
        console.log("disposing previous vrm");
        VRMUtils.deepDispose(currentVrm.scene);
      } catch (err: any) {
        console.log("Dispose error", err);
      }
    };
  }, [currentVrm]);

  useEffect(() => {
    return () => {
      if (!!onAudioEnd) {
        onAudioEnd();
      }
    };
  }, [url]);

  useFrame((_, delta) => {
    currentVrm?.update(delta);

    // blink eyes every 5 seconds
    if (
      !!currentVrm &&
      new Date().getTime() - (lastCloseTime?.getTime() ?? 10000) > 5000
    ) {
      blink(currentVrm);
      setLastCloseTime(new Date());
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
    if (!emotion || !currentVrm) return;
    fadeByEmotion(currentVrm, emotion);
  }, [emotion, speakCount]);

  if (!currentVrm?.scene) return <></>;

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
        object={currentVrm?.scene}
        position={position ?? [0, -10, 0]}
        // position={[0, -9, 0]}
        scale={10}
        ref={tmp}
      />
    </PresentationControls>
  );
};
