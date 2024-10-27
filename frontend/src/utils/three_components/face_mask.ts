import { NormalizedLandmarkList } from '@mediapipe/face_mesh';
import * as THREE from 'three';

import { makeGeometry } from '../facemesh/landmarks_helpers';

export default class FaceMask {
  scene: THREE.Scene;
  needsUpdate: boolean;
  landmarks: NormalizedLandmarkList;
  faceOccluder: THREE.Mesh | null;
  materialOccluder: THREE.Material;
  faceTexture: THREE.Mesh | null;
  texture: THREE.Texture;
  materialTexture: THREE.Material;
  width: number;
  height: number;

  constructor(scene: THREE.Scene, width: number, height: number) {
    this.scene = scene;
    this.needsUpdate = false;
    this.landmarks = null;
    this.faceOccluder = null;
    this.materialOccluder = new THREE.MeshNormalMaterial({ colorWrite: false }); // change to true for debugging
    this.faceTexture = null;
    this.texture = new THREE.TextureLoader().load('/images/faceMeshPiscis.png');
    this.texture.flipY = false;
    this.materialTexture = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
    });
    this.width = width;
    this.height = height;
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

  update() {
    if (this.needsUpdate) {
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
