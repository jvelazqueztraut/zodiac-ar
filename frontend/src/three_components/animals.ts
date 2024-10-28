import { NormalizedLandmarkList } from '@mediapipe/face_mesh';
import { animate } from 'framer-motion';
import * as THREE from 'three';

import { scaleLandmark } from '../utils/facemesh/landmarks_helpers';
import { loadGLTFModel } from './models_helpers';

import { FilterTransitionDuration } from 'constants/ar-constants';

const NUM_ANIMALS = 12;
const MODEL_SCALE = 0.15;
const RADIUS_SCALE = 1.1;
const ROTATION_SPEED = 0.5;
const Y_SHIFT_SPEED = 4;
const Y_SHIFT_SCALE = 0.5;

export default class Animals {
  scene: THREE.Scene;
  width: number;
  height: number;
  landmarks: NormalizedLandmarkList | null;
  objects: THREE.Object3D[];
  scaleFactor: number;
  mixer: THREE.AnimationMixer;

  time = 0;
  enabled = false;
  needsUpdate = false;
  isTransitioning = false;
  transitionScale = 0;

  constructor(scene: THREE.Scene, width: number, height: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.landmarks = null;
    this.objects = [];
    // this.loadModel();
  }

  async loadModel(name: string) {
    const model = (await loadGLTFModel(
      `/3d/animals/${name}.gltf`
    )) as THREE.Object3D;
    console.log(model);

    if (model.animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(model);
      console.log(model.animations[0]);
      const action = this.mixer.clipAction(model.animations[0]);
      action.setLoop(THREE.LoopRepeat);
      action.play();
    }

    // scale 3d object
    const bbox = new THREE.Box3().setFromObject(model.scene);
    const size = bbox.getSize(new THREE.Vector3());
    this.scaleFactor = size.x;

    for (let i = 0; i < NUM_ANIMALS; i++) {
      const object = model.scene.clone();
      object.name = 'animals' + i;
      this.objects.push(object);
    }
    return Promise.resolve(1);
  }

  transitionOut(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    if (this.isTransitioning) return Promise.reject();
    return new Promise(resolve => {
      this.isTransitioning = true;
      animate(1, 0, {
        duration: FilterTransitionDuration,
        onUpdate: latest => {
          this.transitionScale = latest;
        },
        onComplete: () => {
          this.removeAnimals();
          this.isTransitioning = false;
          this.enabled = false;
          console.log('Animals transition out complete');
          resolve();
        },
      });
    });
  }

  transitionIn(): Promise<void> {
    if (!this.enabled || this.isTransitioning) return Promise.reject();
    return new Promise(resolve => {
      this.isTransitioning = true;
      animate(0, 1, {
        duration: FilterTransitionDuration,
        onUpdate: latest => {
          this.transitionScale = latest;
        },
        onComplete: () => {
          this.isTransitioning = false;
          console.log('Animals transition in complete');
          resolve();
        },
      });
    });
  }

  updateAssets(name: string): Promise<void> {
    if (this.isTransitioning) return Promise.reject();
    return new Promise(resolve => {
      for (let i = 0; i < this.objects.length; i++) {
        this.objects[i].traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.material.dispose();
            child.geometry.dispose();
          }
        });
      }
      this.objects = [];
      this.loadModel(name).then(() => {
        this.needsUpdate = true;
        this.enabled = true;
        console.log('Animals update assets complete');
        resolve();
      });
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

  updateAnimals(delta: number) {
    if (!this.landmarks && this.objects.length > 0) return;

    this.time += delta;

    if (this.mixer) this.mixer.update(delta);
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
    const faceCenter = scaleLandmark(
      this.landmarks[1],
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
    const baseScale = (MODEL_SCALE * eyeDist) / this.scaleFactor;

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

    const radius = eyeDist * RADIUS_SCALE; // objects are placed in a circle around the eyes
    const baseRotation = this.time * ROTATION_SPEED; // rotate the objects around the face

    for (let i = 0; i < this.objects.length; i++) {
      const angle = baseRotation + (i / NUM_ANIMALS) * Math.PI * 2;
      const x = midEyes.x + radius * Math.sin(angle);
      const z = midEyes.z + radius * Math.cos(angle); // adjust z position to be in front of the face
      const yShift = eyeDist * Y_SHIFT_SCALE * Math.sin(angle * Y_SHIFT_SPEED); // adjust y position to change with time
      const y = faceCenter.y + yShift; // y position from face center

      this.objects[i].position.set(x, y, z);
      this.objects[i].rotation.set(xRot, yRot + Math.PI / 2 + angle, zRot); // correct to be looking to the side

      const scaleWithDistance =
        (this.transitionScale * baseScale) /
        ((midEyes.z + radius - z) / radius + 1); // fake distance by scaling
      this.objects[i].scale.set(
        scaleWithDistance,
        scaleWithDistance,
        scaleWithDistance
      );
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

  update(delta: number) {
    if (this.enabled && this.needsUpdate) {
      const inScene = !!this.scene.getObjectByName('animals0');
      const shouldShow = !!this.landmarks;
      if (inScene) {
        shouldShow ? this.updateAnimals(delta) : this.removeAnimals();
      } else {
        if (shouldShow) {
          this.addAnimals();
        }
      }
    }
  }
}
