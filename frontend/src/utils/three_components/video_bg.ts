import { InputImage } from '@mediapipe/face_mesh';
import * as THREE from 'three';

export default class VideoBackground {
  scene: THREE.Scene;
  image: InputImage | null;
  plane: THREE.Mesh | null;
  width: number;
  height: number;

  imageUpdated = false;
  sizeUpdated = false;

  constructor(scene: THREE.Scene, width: number, height: number) {
    this.scene = scene;
    this.image = null;
    this.plane = null;
    this.width = width;
    this.height = height;
  }

  updateDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.sizeUpdated = true;
  }

  setImage(image: InputImage) {
    this.image = image;
    this.imageUpdated = true;
  }

  createNewPlane() {
    const geometry = new THREE.PlaneGeometry(this.width, this.height);
    const material = this.createMaterial();
    this.plane = new THREE.Mesh(geometry, material);
    this.plane.renderOrder = -1; // so it does not get occluded by other objects
    this.addPlaneToScene();
  }

  addPlaneToScene() {
    if (this.plane !== null) {
      this.scene.add(this.plane);
      this.plane.position.set(0, 0, 0);
    }
  }

  createMaterial() {
    if (this.image === null) {
      return new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xcccccc),
      });
    }
    const material = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(this.image),
    });
    material.transparent = false;
    return material;
  }

  removePlaneFromScene() {
    this.scene.remove(this.plane);
    this.plane = null;
  }

  update() {
    if (this.plane === null) {
      this.createNewPlane();
    }

    if (this.sizeUpdated) {
      this.removePlaneFromScene();
      this.createNewPlane();
      this.sizeUpdated = false;
      this.imageUpdated = false;
    }

    if (this.imageUpdated) {
      this.plane.material = this.createMaterial();
      this.imageUpdated = false;
    }
  }
}
