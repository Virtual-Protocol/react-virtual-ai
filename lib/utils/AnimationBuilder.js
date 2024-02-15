import {
  AnimationClip,
  Interpolant,
  NumberKeyframeTrack,
  Quaternion,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack,
} from "three";
import {
  blendshape_map_by_MMD_name_VRM0,
  blendshape_map_by_MMD_name_VRM1,
  boneMap,
} from "./boneMapper";

// interpolation

class CubicBezierInterpolation extends Interpolant {
  constructor(
    parameterPositions,
    sampleValues,
    sampleSize,
    resultBuffer,
    params
  ) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);

    this.interpolationParams = params;
  }

  interpolate_(i1, t0, t, t1) {
    const result = this.resultBuffer;
    const values = this.sampleValues;
    const stride = this.valueSize;
    const params = this.interpolationParams;

    const offset1 = i1 * stride;
    const offset0 = offset1 - stride;

    // No interpolation if next key frame is in one frame in 30fps.
    // This is from MMD animation spec.
    // '1.5' is for precision loss. times are Float32 in Three.js Animation system.
    const weight1 = t1 - t0 < (1 / 30) * 1.5 ? 0.0 : (t - t0) / (t1 - t0);

    if (stride === 4) {
      // Quaternion

      const x1 = params[i1 * 4 + 0];
      const x2 = params[i1 * 4 + 1];
      const y1 = params[i1 * 4 + 2];
      const y2 = params[i1 * 4 + 3];

      const ratio = this._calculate(x1, x2, y1, y2, weight1);

      Quaternion.slerpFlat(result, 0, values, offset0, values, offset1, ratio);
    } else if (stride === 3) {
      // Vector3

      for (let i = 0; i !== stride; ++i) {
        const x1 = params[i1 * 12 + i * 4 + 0];
        const x2 = params[i1 * 12 + i * 4 + 1];
        const y1 = params[i1 * 12 + i * 4 + 2];
        const y2 = params[i1 * 12 + i * 4 + 3];

        const ratio = this._calculate(x1, x2, y1, y2, weight1);

        result[i] =
          values[offset0 + i] * (1 - ratio) + values[offset1 + i] * ratio;
      }
    } else {
      // Number

      const x1 = params[i1 * 4 + 0];
      const x2 = params[i1 * 4 + 1];
      const y1 = params[i1 * 4 + 2];
      const y2 = params[i1 * 4 + 3];

      const ratio = this._calculate(x1, x2, y1, y2, weight1);

      result[0] = values[offset0] * (1 - ratio) + values[offset1] * ratio;
    }

    return result;
  }

  _calculate(x1, x2, y1, y2, x) {
    /*
     * Cubic Bezier curves
     *   https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B.C3.A9zier_curves
     *
     * B(t) = ( 1 - t ) ^ 3 * P0
     *      + 3 * ( 1 - t ) ^ 2 * t * P1
     *      + 3 * ( 1 - t ) * t^2 * P2
     *      + t ^ 3 * P3
     *      ( 0 <= t <= 1 )
     *
     * MMD uses Cubic Bezier curves for bone and camera animation interpolation.
     *   http://d.hatena.ne.jp/edvakf/20111016/1318716097
     *
     *    x = ( 1 - t ) ^ 3 * x0
     *      + 3 * ( 1 - t ) ^ 2 * t * x1
     *      + 3 * ( 1 - t ) * t^2 * x2
     *      + t ^ 3 * x3
     *    y = ( 1 - t ) ^ 3 * y0
     *      + 3 * ( 1 - t ) ^ 2 * t * y1
     *      + 3 * ( 1 - t ) * t^2 * y2
     *      + t ^ 3 * y3
     *      ( x0 = 0, y0 = 0 )
     *      ( x3 = 1, y3 = 1 )
     *      ( 0 <= t, x1, x2, y1, y2 <= 1 )
     *
     * Here solves this equation with Bisection method,
     *   https://en.wikipedia.org/wiki/Bisection_method
     * gets t, and then calculate y.
     *
     * f(t) = 3 * ( 1 - t ) ^ 2 * t * x1
     *      + 3 * ( 1 - t ) * t^2 * x2
     *      + t ^ 3 - x = 0
     *
     * (Another option: Newton's method
     *    https://en.wikipedia.org/wiki/Newton%27s_method)
     */

    let c = 0.5;
    let t = c;
    let s = 1.0 - t;
    const loop = 15;
    const eps = 1e-5;
    const math = Math;

    let sst3, stt3, ttt;

    for (let i = 0; i < loop; i++) {
      sst3 = 3.0 * s * s * t;
      stt3 = 3.0 * s * t * t;
      ttt = t * t * t;

      const ft = sst3 * x1 + stt3 * x2 + ttt - x;

      if (math.abs(ft) < eps) break;

      c /= 2.0;

      t += ft < 0 ? c : -c;
      s = 1.0 - t;
    }

    return sst3 * y1 + stt3 * y2 + ttt;
  }
}

export class AnimationBuilder {
  /**
   * @param {Object} vmd - parsed VMD data
   * @return {AnimationClip}
   */
  build(vmd, bones, vrm) {
    // combine skeletal and morph animations

    const tracks = this.buildSkeletalAnimation(vmd, bones, vrm).tracks;
    // const tracks2 = this.buildMorphAnimation(vmd, bones, vrm).tracks;
    // console.log("tracks2", tracks2);

    // for (let i = 0, il = tracks2.length; i < il; i++) {
    //   tracks.push(tracks2[i]);
    // }

    // console.log("tracks", tracks);

    return new AnimationClip("", -1, tracks);
  }

  /**
   * @param {Object} vmd - parsed VMD data
   * @return {AnimationClip}
   */
  buildSkeletalAnimation(vmd, bones, vrm) {
    function pushInterpolation(array, interpolation, index) {
      array.push(interpolation[index + 0] / 127); // x1
      array.push(interpolation[index + 8] / 127); // x2
      array.push(interpolation[index + 4] / 127); // y1
      array.push(interpolation[index + 12] / 127); // y2
    }

    const tracks = [];

    const motions = {};

    for (let i = 0; i < vmd.metadata.motionCount; i++) {
      const motion = vmd.motions[i];
      const boneName = motion.boneName;

      if (!Object.keys(boneMap).includes(boneName)) {
        continue;
      }
      // if (boneNameDictionary[boneName] === undefined) continue;

      motions[boneName] = motions[boneName] || [];
      motions[boneName].push(motion);
    }

    // console.log("motions", motions);

    for (const key in motions) {
      const array = motions[key];

      array.sort(function (a, b) {
        return a.frameNum - b.frameNum;
      });

      const times = [];
      const positions = [];
      const rotations = [];
      const pInterpolations = [];
      const rInterpolations = [];

      const normalizedBoneNode = vrm.humanoid.getNormalizedBoneNode(
        boneMap[key]
      );
      if (!normalizedBoneNode) {
        continue;
      }

      const basePosition = normalizedBoneNode.position.toArray();
      // const tmpBoneName = key;
      let rotation0 = 0;
      if (key === "右腕") {
        rotation0 = 0.3;
      } else if (key === "左腕") {
        rotation0 = -0.3;
      }

      for (let i = 0, il = array.length; i < il; i++) {
        const time = array[i].frameNum / 30;
        const position = array[i].position;
        const rotation = array[i].rotation;
        const interpolation = array[i].interpolation;

        times.push(time);

        for (let j = 0; j < 3; j++)
          positions.push(basePosition[j] + position[j]);
        for (let j = 0; j < 4; j++) {
          if (j === 0) rotations.push(rotation[j]);
          else if (j === 1) rotations.push(rotation[j]);
          else if (j === 2) rotations.push(rotation[j] + rotation0);
          else rotations.push(rotation[j]);
        }
        for (let j = 0; j < 3; j++)
          pushInterpolation(pInterpolations, interpolation, j);

        pushInterpolation(rInterpolations, interpolation, 3);
      }

      const targetBoneNode = vrm.humanoid?.getNormalizedBoneNode(boneMap[key]);
      if (!targetBoneNode) continue;

      tracks.push(
        this._createTrack(
          boneMap[key] + ".position",
          VectorKeyframeTrack,
          times,
          positions,
          pInterpolations
        )
      );
      tracks.push(
        this._createTrack(
          boneMap[key] + ".quaternion",
          QuaternionKeyframeTrack,
          times,
          rotations,
          rInterpolations
        )
      );
    }

    return new AnimationClip("", -1, tracks);
  }

  /**
   * @param {Object} vmd - parsed VMD data
   * @return {AnimationClip}
   */
  buildMorphAnimation(vmd, bones, vrm) {
    const tracks = [];

    const morphs = {};
    const metaVersion = vrm.meta.metaVersion;
    const expressionMapping = blendshape_map_by_MMD_name_VRM1; // TODO: Check if needed to use VRM0

    for (let i = 0; i < vmd.metadata.morphCount; i++) {
      const morph = vmd.morphs[i];
      const morphName = morph.morphName;

      if (!expressionMapping[morphName]) continue;

      morphs[morphName] = morphs[morphName] || [];
      morphs[morphName].push(morph);
    }

    for (const key in morphs) {
      const array = morphs[key];

      array.sort(function (a, b) {
        return a.frameNum - b.frameNum;
      });

      const times = [];
      const values = [];

      for (let i = 0, il = array.length; i < il; i++) {
        times.push(array[i].frameNum / 30);
        values.push(array[i].weight);
      }

      tracks.push(
        new NumberKeyframeTrack(
          ".morphTargetInfluences[" + expressionMapping[key] + "]",
          times,
          values
        )
      );
    }

    return new AnimationClip("", -1, tracks);
  }

  _createTrack(node, typedKeyframeTrack, times, values, interpolations) {
    /*
     * optimizes here not to let KeyframeTrackPrototype optimize
     * because KeyframeTrackPrototype optimizes times and values but
     * doesn't optimize interpolations.
     */
    if (times.length > 2) {
      times = times.slice();
      values = values.slice();
      interpolations = interpolations.slice();

      const stride = values.length / times.length;
      const interpolateStride = interpolations.length / times.length;

      let index = 1;

      for (
        let aheadIndex = 2, endIndex = times.length;
        aheadIndex < endIndex;
        aheadIndex++
      ) {
        for (let i = 0; i < stride; i++) {
          if (
            values[index * stride + i] !== values[(index - 1) * stride + i] ||
            values[index * stride + i] !== values[aheadIndex * stride + i]
          ) {
            index++;
            break;
          }
        }

        if (aheadIndex > index) {
          times[index] = times[aheadIndex];

          for (let i = 0; i < stride; i++) {
            values[index * stride + i] = values[aheadIndex * stride + i];
          }

          for (let i = 0; i < interpolateStride; i++) {
            interpolations[index * interpolateStride + i] =
              interpolations[aheadIndex * interpolateStride + i];
          }
        }
      }

      times.length = index + 1;
      values.length = (index + 1) * stride;
      interpolations.length = (index + 1) * interpolateStride;
    }

    const track = new typedKeyframeTrack(node, times, values);

    track.createInterpolant = function InterpolantFactoryMethodCubicBezier(
      result
    ) {
      // CubicBezierInterpolation
      return new CubicBezierInterpolation(
        this.times,
        this.values,
        this.getValueSize(),
        result,
        new Float32Array(interpolations)
      );
    };

    return track;
  }
}
