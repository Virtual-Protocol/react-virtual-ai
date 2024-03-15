"use client";

import * as THREE from "three";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import "../../index.css";
import { delay } from "framer-motion";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { loadAnimation } from "../utils/model";

type VrmServiceConfigs = {
  onLoad?: (vrm: VRM) => void;
  onLoadErr?: (err: any) => void;
  onLoadProgress?: (progressInPercentage: number) => void;
  stiffness?: number;
  vrmUrl: string;
};

export class VrmService {
  previousAction: THREE.AnimationAction | undefined;
  activeAction: THREE.AnimationAction | undefined;
  isAnimating = false;
  lastCloseTime = new Date();
  configs: VrmServiceConfigs;
  loader: GLTFLoader;
  currentVrm: VRM | undefined;
  mixer: THREE.AnimationMixer | undefined;

  constructor(configs: VrmServiceConfigs) {
    this.configs = configs;
    const loader = new GLTFLoader();
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });
    this.loader = loader;
  }

  loadModel(url: string) {
    this.currentVrm = undefined;
    this.loader.load(
      // URL of the VRM you want to load
      url,

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

        this.currentVrm = v;

        // restrict stiffness
        v.springBoneManager?.joints.forEach((e) => {
          if (e.bone.name.includes("Skirt")) {
            e.settings.stiffness = 5;
            e.settings.dragForce = 0.2;
            e.settings.hitRadius = 1;
            return;
          }
          e.settings.stiffness = this.configs?.stiffness ?? 6;
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
            "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd",
            true
          );
        });

        this.fadeToAnimationUrl(
          "https://s3.ap-southeast-1.amazonaws.com/waifu-cdn.virtuals.gg/vmds/a_idle_neutral_loop_88.vmd",
          true
        );

        this.configs.onLoadProgress?.(100);
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

  async fadeToAnimationUrl(url: string, loop?: boolean) {
    if (!this.mixer || !this.currentVrm || !this.configs?.vrmUrl) return;

    const clip = await loadAnimation(url, this.currentVrm);
    const clipName = `${url}_${this.configs.vrmUrl}`;
    clip.name = clipName;
    if (!clip) return;

    if (this.isAnimating && !loop) {
      console.log("is animating, skipping", clip.name);
      return;
    }
    if (!!this.activeAction && this.activeAction.getClip().name === clipName) {
      console.log("same name, skipping", clipName);
      return;
    }

    if (
      !!this.previousAction &&
      this.previousAction.getClip().name !== clipName
    ) {
      console.log("fading out", this.previousAction.getClip().name);
      this.previousAction.fadeOut(0.5);
      this.previousAction = undefined;
      delay(() => {
        this.fadeToAnimationUrl(url, loop);
      }, 500);
      return;
    }

    // clip action
    const mixerAction = this.mixer.clipAction(clip);
    if (!mixerAction) return;
    this.activeAction = mixerAction;
    this.activeAction.clampWhenFinished = true;

    console.log("fading to", url, loop);
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
