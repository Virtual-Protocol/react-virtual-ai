"use client";

import * as THREE from "three";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { delay } from "framer-motion";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { loadAnimation } from "../utils/model";
import {
  convert as convertVMD,
  bindToVRM as bindVMD2VRM,
} from "../utils/vendors/models/loaders/vmdtovrmbinding";
import VRMIKHandler from "../utils/vendors/models/vrm-ik-handler";
import VRMModelNoise from "../utils/vendors/models/vrm-model-noise";

/**
 * VrmService configurations
 */
type VrmServiceConfigs = {
  /**
   * Callback when VRM model is loaded
   * @param vrm VRM instance
   * @returns
   */
  onLoad?: (vrm: VRM) => void;
  /**
   * Callback when VRM model failed to be loaded
   * @param err Error
   * @returns
   */
  onLoadErr?: (err: any) => void;
  /**
   * Callback when VRM model is loading
   * @param progressInPercentage percentage of loading from 0 to 100
   * @returns
   */
  onLoadProgress?: (progressInPercentage: number) => void;
  /**
   * 3D Model config
   */
  modelConfigs?: {
    [boneName: string]: {
      stiffness?: number;
      dragForce?: number;
      hitRadius?: number;
    };
  };
  /**
   * VRM URL
   */
  vrmUrl: string;
  /**
   * Camera instance to set VRM model lookAt direction
   */
  camera?: THREE.Camera;
};

/**
 * VrmService provides functions to load VRM model and fade to animations.
 */
export class VrmService {
  previousAction: THREE.AnimationAction | undefined;
  activeAction: THREE.AnimationAction | undefined;
  isAnimating = false;
  lastCloseTime = new Date();
  configs: VrmServiceConfigs;
  loader: GLTFLoader;
  currentVrm: VRM | undefined;
  mixer: THREE.AnimationMixer | undefined;
  ik: VRMIKHandler | undefined;
  noise: VRMModelNoise | undefined;

  constructor(configs: VrmServiceConfigs) {
    this.configs = configs;
    const loader = new GLTFLoader();
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });
    this.loader = loader;
  }

  updateModelConfigs(modelConfigs: {
    [boneName: string]: {
      stiffness?: number;
      dragForce?: number;
      hitRadius?: number;
    };
  }) {
    if (!this.currentVrm) return;
    // patch 3d configs
    this.currentVrm.springBoneManager?.joints.forEach((e) => {
      const currentConfig = modelConfigs?.[e.bone.name];
      if (!!currentConfig?.stiffness)
        e.settings.stiffness = currentConfig.stiffness;
      if (!!currentConfig?.dragForce)
        e.settings.dragForce = currentConfig.dragForce;
      if (!!currentConfig?.hitRadius)
        e.settings.hitRadius = currentConfig.hitRadius;
    });
  }

  /**
   * Load VRM model
   */
  loadModel() {
    this.currentVrm = undefined;
    this.loader.load(
      // URL of the VRM you want to load
      this.configs.vrmUrl,

      // called when the resource is loaded
      (gltf) => {
        const v: VRM = gltf.userData.vrm;
        if (!v) return;
        // Disable frustum culling
        v?.scene.traverse((obj: any) => {
          obj.frustumCulled = false;
        });
        v.humanoid.resetNormalizedPose();
        VRMUtils.rotateVRM0(v); // rotate the vrm around y axis if the vrm is VRM0.0
        VRMUtils.removeUnnecessaryJoints(v.scene);
        VRMUtils.removeUnnecessaryVertices(v.scene);

        if (!!v.lookAt) {
          v.lookAt.target = this.configs.camera;
          v.lookAt.autoUpdate = true;
        }

        this.currentVrm = v;

        // initialize ik
        const ik = VRMIKHandler.get(this.currentVrm);
        this.ik = ik;

        // initialize noise
        const noise = VRMModelNoise.get(this.currentVrm);
        this.noise = noise;

        // patch 3d configs
        v.springBoneManager?.joints.forEach((e) => {
          const currentConfig = this.configs.modelConfigs?.[e.bone.name];
          if (!!currentConfig?.stiffness)
            e.settings.stiffness = currentConfig.stiffness;
          if (!!currentConfig?.dragForce)
            e.settings.dragForce = currentConfig.dragForce;
          if (!!currentConfig?.hitRadius)
            e.settings.hitRadius = currentConfig.hitRadius;
        });

        if (!!this.configs?.onLoad) this.configs?.onLoad(v);

        // initialize mixer
        const m = new THREE.AnimationMixer(v.scene);
        this.mixer = m;
        m.addEventListener("finished", () => {
          setTimeout(() => {
            this.isAnimating = false;
          }, 1000);

          this.fadeToAnimationUrl(
            "https://react-virtual-ai.s3.ap-southeast-1.amazonaws.com/idle.vmd",
            true
          );
        });

        this.fadeToAnimationUrl(
          "https://react-virtual-ai.s3.ap-southeast-1.amazonaws.com/idle.vmd",
          true
        );

        // set timeout 1 second to prevent model glitching
        setTimeout(() => {
          this.configs.onLoadProgress?.(100);
        }, 1000);
      },

      // called while loading is progressing
      (progress) => {
        let p = 100.0 * (progress.loaded / progress.total);
        if (p >= 100) p = 99;
        this.configs.onLoadProgress?.(p);
      },

      // called when loading has errors
      (error) => {
        console.error(error);
        this.configs.onLoadErr?.(error);
        this.configs.onLoadProgress?.(0);
      }
    );
  }

  /**
   * Fade to target animation URL
   * @param url VMD / Mixamo FBX Animation. Other formats are not supported at the moment
   * @param loop Whether to loop the selected animation or not
   * @returns
   */
  async fadeToAnimationUrl(url: string, loop?: boolean) {
    if (!this.mixer || !this.currentVrm || !this.configs?.vrmUrl) return;

    let clip: THREE.AnimationClip;
    if (url.includes(".fbx")) {
      clip = await loadAnimation(url, this.currentVrm);
    } else {
      const data = await fetch(url);
      clip = bindVMD2VRM(
        convertVMD(await data.arrayBuffer(), this.currentVrm),
        this.currentVrm
      );
    }
    const clipName = `${url}_${this.configs.vrmUrl}`;
    clip.name = clipName;
    if (!clip) return;

    // if (this.isAnimating && !loop) {
    //   // console.log("is animating, skipping", clip.name);
    //   return;
    // }
    if (!!this.activeAction && this.activeAction.getClip().name === clipName) {
      // console.log("same name, skipping", clipName);
      return;
    }

    if (
      !!this.previousAction &&
      this.previousAction.getClip().name !== clipName
    ) {
      // console.log("fading out", this.previousAction.getClip().name);
      this.previousAction.fadeOut(1);
      this.previousAction = undefined;
      delay(() => {
        this.fadeToAnimationUrl(url, loop);
      }, 0);
      return;
    }

    // clip action
    const mixerAction = this.mixer.clipAction(clip);
    if (!mixerAction) return;
    this.activeAction = mixerAction;
    this.activeAction.clampWhenFinished = true;

    // console.log("fading to", url, loop);
    if (loop) {
      this.isAnimating = false;
      this.activeAction
        ?.reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(1)
        .play();
    } else {
      this.isAnimating = true;
      this.activeAction
        ?.reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(1)
        .setLoop(THREE.LoopOnce, 1)
        .play();
    }
    this.previousAction = this.activeAction;
  }
}
