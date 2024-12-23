import { animate } from 'framer-motion';
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  HueSaturationEffect,
  RenderPass,
  VignetteEffect,
} from 'postprocessing';
import * as THREE from 'three';

import {
  FilterHueSaturationMapping,
  FilterTransitionDuration,
} from 'constants/ar-constants';

const VIGNETTE_DARKNESS = 0.6;
const VIGNETTE_OFFSET = 0.5;
const BLOOM_INTENSITY = 0.5;
const BLOOM_LUMINANCE_THRESHOLD = 0.5;

export default class PostProcessing {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  composer: EffectComposer;
  vignetteEffect: VignetteEffect;
  bloomEffect: BloomEffect;
  hueSaturationEffect: HueSaturationEffect;

  currentHue = 0;
  currentSaturation = 0;

  enabled = false;
  isTransitioning = false;

  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
  ) {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    this.composer = new EffectComposer(this.renderer);
    this.vignetteEffect = new VignetteEffect({
      darkness: 0,
      offset: VIGNETTE_OFFSET,
    });
    this.bloomEffect = new BloomEffect({
      intensity: 0,
      luminanceThreshold: BLOOM_LUMINANCE_THRESHOLD,
    });
    this.hueSaturationEffect = new HueSaturationEffect({
      hue: 0,
      saturation: 0,
    });
    this.buildComposer();
  }

  buildComposer() {
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const hueSaturationEffectPass = new EffectPass(
      this.camera,
      this.hueSaturationEffect
    );
    this.composer.addPass(hueSaturationEffectPass);

    const vignetteEffectPass = new EffectPass(this.camera, this.vignetteEffect);
    this.composer.addPass(vignetteEffectPass);

    const bloomEffectPass = new EffectPass(this.camera, this.bloomEffect);
    this.composer.addPass(bloomEffectPass);
  }

  transitionOut(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    if (this.isTransitioning) return Promise.reject();
    return new Promise(resolve => {
      this.isTransitioning = true;
      this.vignetteEffect.darkness = VIGNETTE_DARKNESS;
      this.bloomEffect.intensity = BLOOM_INTENSITY;
      animate(1, 0, {
        duration: FilterTransitionDuration,
        onUpdate: latest => {
          this.vignetteEffect.darkness = latest * VIGNETTE_DARKNESS;
          this.bloomEffect.intensity = latest * BLOOM_INTENSITY;
          this.hueSaturationEffect.hue = latest * this.currentHue;
          this.hueSaturationEffect.saturation = latest * this.currentSaturation;
        },
        onComplete: () => {
          this.isTransitioning = false;
          this.enabled = false;
          console.log('Postprocessing transition out complete');
          resolve();
        },
      });
    });
  }

  transitionIn(): Promise<void> {
    if (!this.enabled || this.isTransitioning) return Promise.reject();
    return new Promise(resolve => {
      this.isTransitioning = true;
      this.vignetteEffect.darkness = 0;
      this.bloomEffect.intensity = 0;
      animate(0, 1, {
        duration: FilterTransitionDuration,
        onUpdate: latest => {
          this.vignetteEffect.darkness = latest * VIGNETTE_DARKNESS;
          this.bloomEffect.intensity = latest * BLOOM_INTENSITY;
          this.hueSaturationEffect.hue = latest * this.currentHue;
          this.hueSaturationEffect.saturation = latest * this.currentSaturation;
        },
        onComplete: () => {
          this.isTransitioning = false;
          console.log('Postprocessing transition in complete');
          resolve();
        },
      });
    });
  }

  // TODO use asset name to edit effects
  updateEffects(assetName: string): Promise<void> {
    this.currentHue = FilterHueSaturationMapping[assetName].hue;
    this.currentSaturation = FilterHueSaturationMapping[assetName].saturation;
    this.enabled = true;
    return Promise.resolve();
  }

  setSize(width: number, height: number) {
    this.composer.setSize(width, height);
  }

  render() {
    this.composer.render();
  }
}
