import { NormalizedLandmarkList } from '@mediapipe/face_mesh';
import * as THREE from 'three';

import { scaleLandmark } from '../facemesh/landmarks_helpers';
import { loadModel } from './models_helpers';

const NUM_ANIMALS = 10;

export default class Animals {
  scene: THREE.Scene;
  width: number;
  height: number;
  needsUpdate: boolean;
  landmarks: NormalizedLandmarkList | null;
  objects: THREE.Object3D[];
  scaleFactor: number;

  constructor(scene: THREE.Scene, width: number, height: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.needsUpdate = false;
    this.landmarks = null;
    this.objects = [];
    this.loadModel();
  }

  async loadModel() {
    const model = (await loadModel('/3d/animals/bull.gltf')) as THREE.Object3D;

    // scale 3d object
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());
    this.scaleFactor = size.x;

    for (let i = 0; i < NUM_ANIMALS; i++) {
      const object = model.clone();
      object.name = 'animals' + i;
      this.objects.push(object);
    }
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

  updateAnimals() {
    if (!this.landmarks && this.objects.length > 0) return;
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

    // scale to make object size
    // relative to the distance between
    // left eye corner and right eye corner
    const eyeDist = Math.sqrt(
      (leftEyeUpper1.x - rightEyeUpper1.x) ** 2 +
        (leftEyeUpper1.y - rightEyeUpper1.y) ** 2 +
        (leftEyeUpper1.z - rightEyeUpper1.z) ** 2
    );
    const scale = eyeDist / 4 / this.scaleFactor;

    // use two vectors to rotate objects
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

    const radius = eyeDist * 1.5; // objects are placed in a circle around the eyes

    for (let i = 0; i < this.objects.length; i++) {
      const angle = (i / NUM_ANIMALS) * Math.PI * 2;
      const x = midEyes.x + radius * Math.cos(angle);
      const y = midEyes.y;
      const z = midEyes.z + radius * Math.sin(angle) + 200;

      this.objects[i].position.set(x, y, z);
      this.objects[i].rotation.set(xRot, yRot, zRot);
      this.objects[i].scale.set(scale, scale, scale);
    }
  }

  addAnimals() {
    for (let i = 0; i < this.objects.length; i++) {
      this.scene.add(this.objects[i]);
    }
  }

  removeAnimals() {
    for (let i = 0; i < this.objects.length; i++) {
      this.scene.remove(this.objects[i]);
    }
  }

  update() {
    if (this.needsUpdate) {
      const inScene = !!this.scene.getObjectByName('animals0');
      const shouldShow = !!this.landmarks;
      if (inScene) {
        shouldShow ? this.updateAnimals() : this.removeAnimals();
      } else {
        if (shouldShow) {
          this.addAnimals();
        }
      }
    }
  }
}
