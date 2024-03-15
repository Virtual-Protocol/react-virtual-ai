import { VRM, VRMHumanBoneName } from "@pixiv/three-vrm";
import {
  AnimationClip,
  Quaternion,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack,
} from "three";
import { FBXLoader } from "three-stdlib";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader.js";
// @ts-ignore
import { AnimationBuilder } from "./AnimationBuilder";

// idle / think / anger / disgust / fear / joy / neutral / sadness / surprise
export const emotionMap: { [id: string]: string } = {
  idle: "neutral",
  think: "relaxed",
  anger: "angry",
  disgust: "angry",
  fear: "angry",
  joy: "happy",
  neutral: "neutral",
  sadness: "sad",
  surprise: "happy",
};

const escapedExpressions = ["aa", "ih", "ou", "ee", "oh"];

export const getClickedPosition = (
  pos: Vector3,
  partsMap: {
    [id: string]: {
      startX: number;
      endX: number;
      startY: number;
      endY: number;
    };
  }
) => {
  for (const [key, value] of Object.entries(partsMap)) {
    if (
      pos.x >= value.startX &&
      pos.x <= value.endX &&
      pos.y >= value.endY &&
      pos.y <= value.startY
    ) {
      return key;
    }
  }
  return "";
};

export const mixamoVRMRigMap: { [id: string]: string } = {
  mixamorigHips: "hips",
  mixamorigSpine: "spine",
  mixamorigSpine1: "chest",
  mixamorigSpine2: "upperChest",
  mixamorigNeck: "neck",
  mixamorigHead: "head",
  mixamorigLeftShoulder: "leftShoulder",
  mixamorigLeftArm: "leftUpperArm",
  mixamorigLeftForeArm: "leftLowerArm",
  mixamorigLeftHand: "leftHand",
  mixamorigLeftHandThumb1: "leftThumbMetacarpal",
  mixamorigLeftHandThumb2: "leftThumbProximal",
  mixamorigLeftHandThumb3: "leftThumbDistal",
  mixamorigLeftHandIndex1: "leftIndexProximal",
  mixamorigLeftHandIndex2: "leftIndexIntermediate",
  mixamorigLeftHandIndex3: "leftIndexDistal",
  mixamorigLeftHandMiddle1: "leftMiddleProximal",
  mixamorigLeftHandMiddle2: "leftMiddleIntermediate",
  mixamorigLeftHandMiddle3: "leftMiddleDistal",
  mixamorigLeftHandRing1: "leftRingProximal",
  mixamorigLeftHandRing2: "leftRingIntermediate",
  mixamorigLeftHandRing3: "leftRingDistal",
  mixamorigLeftHandPinky1: "leftLittleProximal",
  mixamorigLeftHandPinky2: "leftLittleIntermediate",
  mixamorigLeftHandPinky3: "leftLittleDistal",
  mixamorigRightShoulder: "rightShoulder",
  mixamorigRightArm: "rightUpperArm",
  mixamorigRightForeArm: "rightLowerArm",
  mixamorigRightHand: "rightHand",
  mixamorigRightHandPinky1: "rightLittleProximal",
  mixamorigRightHandPinky2: "rightLittleIntermediate",
  mixamorigRightHandPinky3: "rightLittleDistal",
  mixamorigRightHandRing1: "rightRingProximal",
  mixamorigRightHandRing2: "rightRingIntermediate",
  mixamorigRightHandRing3: "rightRingDistal",
  mixamorigRightHandMiddle1: "rightMiddleProximal",
  mixamorigRightHandMiddle2: "rightMiddleIntermediate",
  mixamorigRightHandMiddle3: "rightMiddleDistal",
  mixamorigRightHandIndex1: "rightIndexProximal",
  mixamorigRightHandIndex2: "rightIndexIntermediate",
  mixamorigRightHandIndex3: "rightIndexDistal",
  mixamorigRightHandThumb1: "rightThumbMetacarpal",
  mixamorigRightHandThumb2: "rightThumbProximal",
  mixamorigRightHandThumb3: "rightThumbDistal",
  mixamorigLeftUpLeg: "leftUpperLeg",
  mixamorigLeftLeg: "leftLowerLeg",
  mixamorigLeftFoot: "leftFoot",
  mixamorigLeftToeBase: "leftToes",
  mixamorigRightUpLeg: "rightUpperLeg",
  mixamorigRightLeg: "rightLowerLeg",
  mixamorigRightFoot: "rightFoot",
  mixamorigRightToeBase: "rightToes",

  mixamorig_Hips: "hips",
  mixamorig_Spine: "spine",
  mixamorig_Spine1: "chest",
  mixamorig_Spine2: "upperChest",
  mixamorig_Neck: "neck",
  mixamorig_Head: "head",
  mixamorig_LeftShoulder: "leftShoulder",
  mixamorig_LeftArm: "leftUpperArm",
  mixamorig_LeftForeArm: "leftLowerArm",
  mixamorig_LeftHand: "leftHand",
  mixamorig_LeftHandThumb1: "leftThumbMetacarpal",
  mixamorig_LeftHandThumb2: "leftThumbProximal",
  mixamorig_LeftHandThumb3: "leftThumbDistal",
  mixamorig_LeftHandIndex1: "leftIndexProximal",
  mixamorig_LeftHandIndex2: "leftIndexIntermediate",
  mixamorig_LeftHandIndex3: "leftIndexDistal",
  mixamorig_LeftHandMiddle1: "leftMiddleProximal",
  mixamorig_LeftHandMiddle2: "leftMiddleIntermediate",
  mixamorig_LeftHandMiddle3: "leftMiddleDistal",
  mixamorig_LeftHandRing1: "leftRingProximal",
  mixamorig_LeftHandRing2: "leftRingIntermediate",
  mixamorig_LeftHandRing3: "leftRingDistal",
  mixamorig_LeftHandPinky1: "leftLittleProximal",
  mixamorig_LeftHandPinky2: "leftLittleIntermediate",
  mixamorig_LeftHandPinky3: "leftLittleDistal",
  mixamorig_RightShoulder: "rightShoulder",
  mixamorig_RightArm: "rightUpperArm",
  mixamorig_RightForeArm: "rightLowerArm",
  mixamorig_RightHand: "rightHand",
  mixamorig_RightHandPinky1: "rightLittleProximal",
  mixamorig_RightHandPinky2: "rightLittleIntermediate",
  mixamorig_RightHandPinky3: "rightLittleDistal",
  mixamorig_RightHandRing1: "rightRingProximal",
  mixamorig_RightHandRing2: "rightRingIntermediate",
  mixamorig_RightHandRing3: "rightRingDistal",
  mixamorig_RightHandMiddle1: "rightMiddleProximal",
  mixamorig_RightHandMiddle2: "rightMiddleIntermediate",
  mixamorig_RightHandMiddle3: "rightMiddleDistal",
  mixamorig_RightHandIndex1: "rightIndexProximal",
  mixamorig_RightHandIndex2: "rightIndexIntermediate",
  mixamorig_RightHandIndex3: "rightIndexDistal",
  mixamorig_RightHandThumb1: "rightThumbMetacarpal",
  mixamorig_RightHandThumb2: "rightThumbProximal",
  mixamorig_RightHandThumb3: "rightThumbDistal",
  mixamorig_LeftUpLeg: "leftUpperLeg",
  mixamorig_LeftLeg: "leftLowerLeg",
  mixamorig_LeftFoot: "leftFoot",
  mixamorig_LeftToeBase: "leftToes",
  mixamorig_RightUpLeg: "rightUpperLeg",
  mixamorig_RightLeg: "rightLowerLeg",
  mixamorig_RightFoot: "rightFoot",
  mixamorig_RightToeBase: "rightToes",
};

export const loadVMDAsync = async (url: string) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("Invalid url"));
      return;
    }
    const mmdLoader = new MMDLoader();
    mmdLoader.loadVMD(
      url,
      (d) => {
        resolve(d);
      },
      undefined,
      (e) => {
        reject(e);
      }
    );
  });
};

/**
 * Helper function to load VMD / Mixamo FBX animation
 * Please take note that other animation formats are not supported at the moment
 *
 * @param url VMD / Mixamo FBX animations
 * @param vrm VRM instance
 * @returns AnimationClip
 */
export const loadAnimation = async (url: string, vrm?: VRM) => {
  if (!url || !vrm) return;

  let rslt: any;

  try {
    rslt = await loadVMDAsync(url);
  } catch (err) {
    // try loading as fbx
    rslt = await loadFbxAnimation(url, vrm);
    return rslt;
  }

  const builder = new AnimationBuilder();
  const clip = builder.build(
    rslt,
    Object.values(vrm.humanoid.humanBones).map((raw) => raw.node),
    vrm
  );
  clip.name = url;

  const tracks: any[] = []; // KeyframeTracks compatible with VRM will be added here

  const restRotationInverse = new Quaternion();
  const parentRestWorldRotation = new Quaternion();
  const _quatA = new Quaternion();
  //   const _vec3 = new Vector3();

  // Adjust with reference to hips height.
  // const motionHipsHeight =
  //   asset.getObjectByName("mixamorigHips")?.position.y ?? 1;
  // const vrmHipsY = vrm.humanoid
  //   ?.getNormalizedBoneNode("hips")
  //   ?.getWorldPosition(_vec3).y;
  // const vrmRootY = vrm.scene.getWorldPosition(_vec3).y;
  // const vrmHipsHeight = Math.abs((vrmHipsY ?? 0) - vrmRootY);
  // const hipsPositionScale = vrmHipsHeight / motionHipsHeight;
  clip.tracks.forEach((track: any) => {
    // Convert each tracks for VRM use, and push to `tracks`
    const trackSplitted = track.name.split(".");
    const vrmBoneName = trackSplitted[0];

    // add as it is for morph track
    if (track.name.includes("morphTargetInfluences")) {
      tracks.push(track);
      return;
    }

    // const vrmBoneName = mixamoVRMRigMap[mixamoRigName] as VRMHumanBoneName;
    const vrmNode = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName as any);
    const vrmNodeName = vrmNode?.name;
    // const mixamoRigNode = asset.getObjectByName(mixamoRigName);

    if (vrmNodeName != null) {
      const propertyName = trackSplitted[1];

      // Store rotations of rest-pose.
      // vrmNode?.getWorldQuaternion(restRotationInverse)?.invert();
      // vrmNode?.parent?.getWorldQuaternion(parentRestWorldRotation);

      if (track instanceof QuaternionKeyframeTrack) {
        // Retarget rotation of mixamoRig to NormalizedBone.
        for (let i = 0; i < track.values.length; i += 4) {
          const flatQuaternion = track.values.slice(i, i + 4);

          _quatA.fromArray(flatQuaternion);

          // 親のレスト時ワールド回転 * トラックの回転 * レスト時ワールド回転の逆
          _quatA
            .premultiply(parentRestWorldRotation)
            .multiply(restRotationInverse);

          _quatA.toArray(flatQuaternion);

          flatQuaternion.forEach((v, index) => {
            track.values[index + i] = v;
          });
        }

        tracks.push(
          new QuaternionKeyframeTrack(
            `${vrmNodeName}.${propertyName}`,
            track.times,
            track.values.map((v, i) =>
              vrm.meta?.metaVersion === "0" && i % 2 === 0 ? -v : v
            )
          )
        );
      } else if (track instanceof VectorKeyframeTrack) {
        const value = track.values.map(
          (v, i) => (vrm.meta?.metaVersion === "0" && i % 3 !== 1 ? -v : v) * 1
        );
        tracks.push(
          new VectorKeyframeTrack(
            `${vrmNodeName}.${propertyName}`,
            track.times,
            value
          )
        );
      }
    }
  });

  return new AnimationClip(url, clip.duration, tracks);
};

export const loadFbxAnimation = async (url: string, vrm: VRM) => {
  const loader = new FBXLoader();
  const asset = await loader.loadAsync(url);

  // const asset = await loader.loadAsync("/models/motion.fbx");
  const clip =
    AnimationClip.findByName(asset.animations, "mixamo.com") ??
    asset.animations?.[0]; // extract the AnimationClip

  // console.log("clip", clip);

  const tracks: any[] = []; // KeyframeTracks compatible with VRM will be added here

  const restRotationInverse = new Quaternion();
  const parentRestWorldRotation = new Quaternion();
  const _quatA = new Quaternion();
  const _vec3 = new Vector3();

  // Adjust with reference to hips height.
  const motionHipsHeight =
    asset.getObjectByName("mixamorigHips")?.position.y ?? 0;
  const vrmHipsY =
    vrm.humanoid?.getNormalizedBoneNode("hips")?.getWorldPosition(_vec3).y ?? 0;
  const vrmRootY = vrm.scene.getWorldPosition(_vec3).y;
  const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
  const hipsPositionScale = vrmHipsHeight / motionHipsHeight;

  clip.tracks.forEach((track) => {
    // Convert each tracks for VRM use, and push to `tracks`
    const trackSplitted = track.name.split(".");
    const mixamoRigName = trackSplitted[0];
    const vrmBoneName = mixamoVRMRigMap[mixamoRigName];
    const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(
      vrmBoneName as VRMHumanBoneName
    )?.name;
    const mixamoRigNode = asset.getObjectByName(mixamoRigName);

    if (vrmNodeName != null) {
      const propertyName = trackSplitted[1];

      // Store rotations of rest-pose.
      mixamoRigNode?.getWorldQuaternion(restRotationInverse).invert();
      mixamoRigNode?.parent?.getWorldQuaternion(parentRestWorldRotation);

      if (track instanceof QuaternionKeyframeTrack) {
        // Retarget rotation of mixamoRig to NormalizedBone.
        for (let i = 0; i < track.values.length; i += 4) {
          const flatQuaternion = track.values.slice(i, i + 4);

          _quatA.fromArray(flatQuaternion);

          // 親のレスト時ワールド回転 * トラックの回転 * レスト時ワールド回転の逆
          _quatA
            .premultiply(parentRestWorldRotation)
            .multiply(restRotationInverse);

          _quatA.toArray(flatQuaternion);

          flatQuaternion.forEach((v, index) => {
            track.values[index + i] = v;
          });
        }

        tracks.push(
          new QuaternionKeyframeTrack(
            `${vrmNodeName}.${propertyName}`,
            track.times,
            track.values.map((v, i) =>
              vrm.meta?.metaVersion === "0" && i % 2 === 0 ? -v : v
            )
          )
        );
      } else if (track instanceof VectorKeyframeTrack) {
        const value = track.values.map(
          (v, i) =>
            (vrm.meta?.metaVersion === "0" && i % 3 !== 1
              ? -(v / 10)
              : v / 10) * hipsPositionScale
        );
        tracks.push(
          new VectorKeyframeTrack(
            `${vrmNodeName}.${propertyName}`,
            track.times,
            value
          )
        );
      }
    }
  });

  return new AnimationClip(url, clip.duration, tracks);
};

const sleep = async (ms: number) => {
  await new Promise((r) => setTimeout(r, ms));
};

export const playMotion = async (
  currentVrm: VRM,
  targetExpression: string,
  value: number,
  unique?: boolean
) => {
  if (!unique) {
    currentVrm.expressionManager?.setValue(targetExpression, value);
    return;
  }
  for (const e of currentVrm?.expressionManager?.expressions ?? []) {
    if (escapedExpressions.includes(e.expressionName)) {
      continue;
    }
    const currentValue =
      currentVrm.expressionManager?.getValue(e.expressionName) ?? 0;
    if (currentValue > 0) {
      currentVrm.expressionManager?.setValue(targetExpression, 0);
      return;
    }
  }
  currentVrm.expressionManager?.setValue(targetExpression, value);
};

export const fadeByExpressionName = async (
  currentVrm: VRM,
  name: string,
  waitMs?: number,
  transitionMs?: number,
  unique?: boolean
) => {
  playMotion(currentVrm, name, 0.1, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.2, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.3, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.4, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.5, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.6, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.7, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.8, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.9, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 1, unique);
  await sleep(waitMs ?? 25);
  playMotion(currentVrm, name, 0.9, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.8, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.7, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.6, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.5, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.4, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.3, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.2, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.1, unique);
  await sleep(transitionMs ?? 25);
  playMotion(currentVrm, name, 0.0, unique);
};

/**
 * Function to blink VRM model's eyes
 * @param currentVrm VRM instance
 */
export const blink = async (currentVrm: VRM) => {
  await fadeByExpressionName(currentVrm, "blink", undefined, undefined);
};

/**
 * Function to fade VRM model's facial expression
 * @param currentVrm VRM instance
 * @param emotion Target emotion to fade
 * @returns void
 */
export const fadeByEmotion = async (
  currentVrm: VRM,
  emotion:
    | "idle"
    | "think"
    | "anger"
    | "disgust"
    | "fear"
    | "joy"
    | "neutral"
    | "sadness"
    | "surprise"
) => {
  const target = emotionMap?.[emotion] ?? "";
  if (!target) return;
  await fadeByExpressionName(currentVrm, target, 3000);
};
