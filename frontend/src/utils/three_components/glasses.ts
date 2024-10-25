import { NormalizedLandmarkList } from '@mediapipe/face_mesh';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { scaleLandmark } from '../facemesh/landmarks_helpers';

function loadModel(file) {
  return new Promise((res, rej) => {
    const loader = new GLTFLoader();
    loader.load(
      file,
      gltf => {
        res(gltf.scene);
      },
      undefined,
      error => {
        rej(error);
      }
    );
  });
}

export default class Glasses {
  scene: THREE.Scene;
  width: number;
  height: number;
  needsUpdate: boolean;
  landmarks: NormalizedLandmarkList;
  glasses: THREE.Object3D;
  scaleFactor: number;

  constructor(scene, width, height) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.needsUpdate = false;
    this.landmarks = null;
    this.loadGlasses();
  }

  async loadGlasses() {
    this.glasses = await loadModel('/3d/black-glasses/scene.gltf');

    // scale glasses
    const bbox = new THREE.Box3().setFromObject(this.glasses);
    const size = bbox.getSize(new THREE.Vector3());
    this.scaleFactor = size.x;

    this.glasses.name = 'glasses';
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

  updateGlasses() {
    // Points for reference
    // https://raw.githubusercontent.com/google/mediapipe/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png

    const midEyes = scaleLandmark(this.landmarks[168], this.width, this.height);
    const leftEyeInnerCorner = scaleLandmark(
      this.landmarks[463],
      this.width,
      this.height
    );
    const rightEyeInnerCorner = scaleLandmark(
      this.landmarks[243],
      this.width,
      this.height
    );
    const noseBottom = scaleLandmark(
      this.landmarks[2],
      this.width,
      this.height
    );

    // These points seem appropriate 446, 265, 372, 264
    const leftEyeUpper1 = scaleLandmark(
      this.landmarks[264],
      this.width,
      this.height
    );
    // These points seem appropriate 226, 35, 143, 34
    const rightEyeUpper1 = scaleLandmark(
      this.landmarks[34],
      this.width,
      this.height
    );

    if (this.glasses) {
      // position
      this.glasses.position.set(midEyes.x, midEyes.y, midEyes.z);

      // scale to make glasses
      // as wide as distance between
      // left eye corner and right eye corner
      const eyeDist = Math.sqrt(
        (leftEyeUpper1.x - rightEyeUpper1.x) ** 2 +
          (leftEyeUpper1.y - rightEyeUpper1.y) ** 2 +
          (leftEyeUpper1.z - rightEyeUpper1.z) ** 2
      );
      const scale = eyeDist / this.scaleFactor;
      this.glasses.scale.set(scale, scale, scale);

      // use two vectors to rotate glasses
      // Vertical Vector from midEyes to noseBottom
      // is used for calculating rotation around x and z axis
      // Horizontal Vector from leftEyeCorner to rightEyeCorner
      // us use to calculate rotation around y axis
      const upVector = new THREE.Vector3(
        midEyes.x - noseBottom.x,
        midEyes.y - noseBottom.y,
        midEyes.z - noseBottom.z
      ).normalize();

      const sideVector = new THREE.Vector3(
        leftEyeInnerCorner.x - rightEyeInnerCorner.x,
        leftEyeInnerCorner.y - rightEyeInnerCorner.y,
        leftEyeInnerCorner.z - rightEyeInnerCorner.z
      ).normalize();

      const zRot =
        new THREE.Vector3(1, 0, 0).angleTo(
          upVector.clone().projectOnPlane(new THREE.Vector3(0, 0, 1))
        ) -
        Math.PI / 2;

      const xRot =
        Math.PI / 2 -
        new THREE.Vector3(0, 0, 1).angleTo(
          upVector.clone().projectOnPlane(new THREE.Vector3(1, 0, 0))
        );

      const yRot =
        new THREE.Vector3(sideVector.x, 0, sideVector.z).angleTo(
          new THREE.Vector3(0, 0, 1)
        ) -
        Math.PI / 2;

      this.glasses.rotation.set(xRot, yRot, zRot);
    }
  }

  addGlasses() {
    if (this.glasses) {
      this.scene.add(this.glasses);
    }
  }

  removeGlasses() {
    this.scene.remove(this.glasses);
  }

  update() {
    if (this.needsUpdate) {
      const inScene = !!this.scene.getObjectByName('glasses');
      const shouldShow = !!this.landmarks;
      if (inScene) {
        shouldShow ? this.updateGlasses() : this.removeGlasses();
      } else {
        if (shouldShow) {
          this.addGlasses();
        }
      }
    }
  }
}
