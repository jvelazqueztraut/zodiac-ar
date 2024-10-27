import { NormalizedLandmarkList } from '@mediapipe/face_mesh';
import * as THREE from 'three';

import { makeGeometry } from '../facemesh/landmarks_helpers';

export default class FaceMask {
  scene: THREE.Scene;
  landmarks: NormalizedLandmarkList;
  faceOccluder: THREE.Mesh | null;
  materialOccluder: THREE.Material;
  faceTexture: THREE.Mesh | null;
  texture: THREE.Texture | null;
  materialTexture: THREE.Material | null;
  width: number;
  height: number;

  enabled = false;
  needsUpdate = false;
  isTransitioning = false;

  constructor(scene: THREE.Scene, width: number, height: number) {
    this.scene = scene;
    this.landmarks = null;
    this.width = width;
    this.height = height;
    this.faceOccluder = null;
    this.materialOccluder = new THREE.MeshNormalMaterial({ colorWrite: false }); // change to true for debugging
    this.faceTexture = null;
    // this.loadTexture();
  }

  loadTexture(name: string) {
    this.texture = new THREE.TextureLoader().load(
      `/images/faceMesh/${name}.png`
    );
    this.texture.flipY = false;

    this.materialTexture = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0,
    });
  }

  updateDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.needsUpdate = true;
  }

  updateLandmarks(landmarks: NormalizedLandmarkList) {
    this.landmarks = landmarks;
    this.needsUpdate = true;
  }

  updateMaterial(material: THREE.Material) {
    this.materialTexture = material;
    this.materialTexture.needsUpdate = true;
  }

  addFaces() {
    // create faces
    const geometry = makeGeometry(this.landmarks);
    this.faceOccluder = new THREE.Mesh(geometry, this.materialOccluder);
    this.faceOccluder.renderOrder = 0; // important to make occluding work
    this.faceOccluder.position.set(0, 0, 0);
    this.faceOccluder.scale.set(this.width, this.height, this.width);
    this.scene.add(this.faceOccluder);

    this.faceTexture = new THREE.Mesh(geometry, this.materialTexture);
    this.faceTexture.position.set(0, 0, 0);
    this.faceTexture.scale.set(this.width, this.height, this.width);
    this.scene.add(this.faceTexture);
  }

  removeFaces() {
    this.scene.remove(this.faceOccluder);
    this.scene.remove(this.faceTexture);
  }

  transitionOut(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    return new Promise(resolve => {
      this.isTransitioning = true;
      const fadeOut = () => {
        this.materialTexture.opacity -= 0.05;
        this.needsUpdate = true;
        if (this.materialTexture.opacity > 0) {
          requestAnimationFrame(fadeOut);
        } else {
          this.materialTexture.opacity = 0;
          this.isTransitioning = false;
          this.enabled = false;
          console.log('Face Mask transition out complete');
          resolve();
        }
      };
      fadeOut();
    });
  }

  transitionIn(): Promise<void> {
    if (!this.enabled) return Promise.reject();
    return new Promise(resolve => {
      this.isTransitioning = true;
      this.materialTexture.opacity = 0;
      const fadeIn = () => {
        this.materialTexture.opacity += 0.05;
        this.needsUpdate = true;
        if (this.materialTexture.opacity < 1) {
          requestAnimationFrame(fadeIn);
        } else {
          this.materialTexture.opacity = 1;
          this.isTransitioning = false;
          console.log('Face Mask transition in complete');
          resolve();
        }
      };
      fadeIn();
    });
  }

  updateAssets(name: string): Promise<void> {
    return new Promise(resolve => {
      if (this.texture) this.texture.dispose();
      if (this.materialTexture) this.materialTexture.dispose();
      this.loadTexture(name);
      this.needsUpdate = true;
      this.enabled = true;
      console.log('Face Mask update assets complete');
      resolve();
    });
  }

  update() {
    if (this.enabled && this.needsUpdate) {
      if (this.faceOccluder !== null || this.faceTexture !== null) {
        this.removeFaces();
      }
      if (this.landmarks !== null) {
        this.addFaces();
      }
      this.needsUpdate = false;
    }
  }
}
