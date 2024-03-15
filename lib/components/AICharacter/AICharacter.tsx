"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { blink, fadeByEmotion, loadAnimation as load } from "../../utils/model";
import gsap from "gsap";
import "../../index.css";
import { delay } from "framer-motion";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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
  setCurrentVrm: (v: VRM) => void;
};

let globalMixer: THREE.AnimationMixer | undefined;
let previousAction: THREE.AnimationAction | undefined;
let activeAction: THREE.AnimationAction | undefined;
let isAnimating = false;
let lastCloseTime = new Date();

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
  const tmp = useRef();

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
    if (!url) return;
    const loader = new GLTFLoader();
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });
    // try {
    //   if (!currentVrm) return;
    //   console.log("disposing previous vrm");
    //   VRMUtils.deepDispose(currentVrm.scene);
    // } catch (err: any) {
    //   console.log("Dispose error", err);
    // }
    loader.load(
      // URL of the VRM you want to load
      url,

      // called when the resource is loaded
      (gltf) => {
        // console.log("gltf", gltf?.userData?.vrmMeta?.title, url);
        const v: VRM = gltf.userData.vrm;
        // console.log("vrm", v);
        if (!v) return;

        if (!!v.lookAt && !!camera) {
          v.lookAt.target = camera;
          v.lookAt.autoUpdate = true;
        }
        setCurrentVrm(v);
        // console.log("currentVrm", v);

        // Disable frustum culling
        v?.scene.traverse((obj: any) => {
          obj.frustumCulled = false;
        });
        v.humanoid.resetNormalizedPose();
        VRMUtils.rotateVRM0(v); // rotate the vrm around y axis if the vrm is VRM0.0
        VRMUtils.removeUnnecessaryJoints(v.scene);
        VRMUtils.removeUnnecessaryVertices(v.scene);

        // restrict stiffness
        // console.log("Joints", v.springBoneManager?.joints);
        v.springBoneManager?.joints.forEach((e) => {
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

        // initialize mixer
        const m = new THREE.AnimationMixer(v.scene);
        m.addEventListener("finished", () => {
          setTimeout(() => {
            isAnimating = false;
          }, 1000);

          if (!!previousAction) {
            console.log("fading out", previousAction.getClip().name);
            previousAction.fadeOut(0.5);
            previousAction = undefined;
            delay(() => {
              fadeToActionString(
                "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd",
                v,
                m,
                `https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd_${url}`,
                true
              );
            }, 500);
          } else {
            fadeToActionString(
              "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd",
              v,
              m,
              `https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd_${url}`,
              true
            );
          }
        });

        globalMixer = m;
      },

      // called while loading is progressing
      (progress) => {
        setProgress(100.0 * (progress.loaded / progress.total));
      },

      // called when loading has errors
      (error) => {
        console.error(error);
        if (!!onLoadErr) onLoadErr(error);
        setProgress(0);
      }
    );
    return () => {
      if (!!onAudioEnd) {
        onAudioEnd();
      }
      isAnimating = false;
    };
  }, [url]);

  useFrame((_, delta) => {
    currentVrm?.update(delta);
    globalMixer?.update(delta);

    // blink eyes every 5 seconds
    if (
      !!currentVrm &&
      new Date().getTime() - lastCloseTime.getTime() > 5000 &&
      !isAnimating
    ) {
      blink(currentVrm);
      lastCloseTime = new Date();
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
    if (!animation || !currentVrm || !globalMixer || !url) return;
    fadeToActionString(
      animation,
      currentVrm,
      globalMixer,
      `${animation}_${url}`,
      animation.includes("a_idle_neutral_loop_88") ||
        animation.includes("sample_talk_128")
    );
  }, [animation, speakCount, currentVrm, url]);

  useEffect(() => {
    if (!emotion || !currentVrm) return;
    fadeByEmotion(currentVrm, emotion);
  }, [emotion, speakCount, currentVrm]);

  const fadeToActionString = async (
    action: string,
    v: VRM,
    m: THREE.AnimationMixer,
    clipName: string,
    loop?: boolean
  ) => {
    const mixer = m ?? globalMixer;
    if (!mixer) return;

    const clip = await load(action, v, clipName);
    if (!clip) return;

    if (isAnimating && !loop) {
      console.log("is animating, skipping", clip.name);
      return;
    }

    if (!!activeAction && activeAction.getClip().name === clipName) {
      console.log("same name, slipping", clipName);
      return;
    }

    if (!!previousAction) {
      console.log("fading out", previousAction.getClip().name);
      previousAction.fadeOut(0.5);
      previousAction = undefined;
      delay(() => {
        fadeToActionString(action, v, m, clipName, loop);
      }, 500);
      return;
    }

    // clip action
    const mixerAction = mixer.clipAction(clip);
    if (!mixerAction) return;
    activeAction = mixerAction;
    activeAction.clampWhenFinished = true;

    console.log("fading to", action, loop);
    if (loop) {
      isAnimating = false;
      activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(1)
        .play();
    } else {
      isAnimating = true;
      activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(1)
        .setLoop(THREE.LoopOnce, 1)
        .play();
    }
    previousAction = activeAction;
  };

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
        // position={[0, -9, 0]}
        scale={10}
        ref={tmp}
      />
    </PresentationControls>
  );
};
