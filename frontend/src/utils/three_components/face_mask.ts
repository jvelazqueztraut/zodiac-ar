import { NormalizedLandmarkList } from '@mediapipe/face_mesh';
import * as THREE from 'three';

import { makeGeometry } from '../facemesh/landmarks_helpers';

export default class FaceMask {
  scene: THREE.Scene;
  needsUpdate: boolean;
  landmarks: NormalizedLandmarkList;
  faces: THREE.Mesh | null;
  width: number;
  height: number;
  material: THREE.Material;

  constructor(scene: THREE.Scene, width: number, height: number) {
    this.scene = scene;
    this.needsUpdate = false;
    this.landmarks = null;
    this.faces = null;
    this.width = width;
    this.height = height;
    this.material = new THREE.MeshNormalMaterial();
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
    this.material = material;
    this.material.needsUpdate = true;
  }

  addFaces() {
    // create faces
    const geometry = makeGeometry(this.landmarks);
    this.faces = new THREE.Mesh(geometry, this.material);
    this.faces.position.set(0, 0, 0);
    this.faces.scale.set(this.width, this.height, this.width);
    this.scene.add(this.faces);
  }

  removeFaces() {
    this.scene.remove(this.faces);
  }

  update() {
    if (this.needsUpdate) {
      if (this.faces !== null) {
        this.removeFaces();
      }
      if (this.landmarks !== null) {
        this.addFaces();
      }
      this.needsUpdate = false;
    }
  }
}
