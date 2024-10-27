import { InputImage, NormalizedLandmarkList } from '@mediapipe/face_mesh';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import Animals from './animals';
import FaceMask from './face_mask';
import Glasses from './glasses';

/**
 *
 * Finds distance to position perspective camera
 *
 * @param {Number} height height of video
 * @param {Number} fov fov of perspective camera
 */
const cameraDistance = (height: number, fov: number) => {
  return height / 2 / Math.tan(((fov / 2) * Math.PI) / 180);
};

/**
 *
 * Call these methods.
 *
 * 1) animate inside request animation frame
 * 2) resize inside request animation frame
 * 3) onLandmarks on recieving new face landmarks
 *
 */
export default class SceneManager {
  canvas: HTMLCanvasElement;
  scene: THREE.Scene;
  debug: boolean;
  useOrtho: boolean;
  renderer: THREE.WebGLRenderer;
  fov: number;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  controls: OrbitControls;
  faceMask: FaceMask;
  glasses: Glasses;
  animals: Animals;
  videoWidth: number;
  videoHeight: number;

  constructor(canvas: HTMLCanvasElement, debug = false, useOrtho = true) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.debug = debug;
    this.useOrtho = useOrtho;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      devicePixelRation: window.devicePixelRatio || 1,
      alpha: true,
    });
    this.fov = 63;
    this.buildCamera();
    this.buildControls();
    this.buildFaceMask();
    this.buildGlasses();
    this.buildAnimals();
    this.addLights();
  }

  buildFaceMask() {
    // this component draws faces
    this.faceMask = new FaceMask(
      this.scene,
      this.renderer.domElement.width,
      this.renderer.domElement.height
    );
  }

  buildGlasses() {
    this.glasses = new Glasses(
      this.scene,
      this.renderer.domElement.width,
      this.renderer.domElement.height
    );
  }

  buildAnimals() {
    this.animals = new Animals(
      this.scene,
      this.renderer.domElement.width,
      this.renderer.domElement.height
    );
  }

  buildControls() {
    if (this.debug) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.update();
    }
  }

  buildCamera() {
    this.useOrtho ? this.buildOrthoCamera() : this.buildPerspectiveCamera();
  }

  buildOrthoCamera() {
    this.camera = new THREE.OrthographicCamera(
      -this.renderer.domElement.width / 2,
      this.renderer.domElement.width / 2,
      this.renderer.domElement.height / 2,
      -this.renderer.domElement.height / 2,
      -2000,
      2000
    );
    this.camera.position.z = 1;
  }

  buildPerspectiveCamera() {
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      this.renderer.domElement.width / this.renderer.domElement.height,
      1.0, // near
      10000 // far
    );

    this.camera.position.z = cameraDistance(
      this.renderer.domElement.height,
      this.fov
    );
  }

  addLights() {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1).normalize();
    this.scene.add(directionalLight);
  }

  // we need to resize canvas rendering dimensions
  // when canvas sytling dimensions change
  resizeRendererToDisplaySize() {
    const canvas = this.renderer.domElement;

    // match dimension of canvas with
    // dimension of video
    if (
      this.videoWidth !== canvas.clientWidth ||
      this.videoHeight !== canvas.clientHeight
    ) {
      const width = this.videoWidth;
      const height = this.videoHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    // canvas has 2 width
    // 1) style width set with style attribute
    // 2) rendering width set with width and height attribute
    // update rendering width to match styling width.
    const width = canvas.clientWidth | 0;
    const height = canvas.clientHeight | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
    }
    return needResize;
  }

  updateCamera() {
    // camera need to be adjusted according to
    // renderer dimensions
    this.camera.aspect = this.videoWidth / this.videoHeight;
    if (this.camera.type === 'OrthographicCamera') {
      this.camera.top = this.videoHeight / 2;
      this.camera.bottom = -this.videoHeight / 2;
      this.camera.left = -this.videoWidth / 2;
      this.camera.right = this.videoWidth / 2;
    } else {
      this.camera.position.z = cameraDistance(this.videoHeight, this.fov);
    }
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (this.controls) {
      this.controls.update();
    }

    if (this.resizeRendererToDisplaySize()) {
      // facemask needs to scale faces according to
      // renderer dimensions
      this.faceMask.updateDimensions(
        this.renderer.domElement.width,
        this.renderer.domElement.height
      );

      this.glasses.updateDimensions(
        this.renderer.domElement.width,
        this.renderer.domElement.height
      );

      this.updateCamera();
    }

    // update faces mask
    this.faceMask.update();

    // update glasses
    this.glasses.update();

    // update animals
    this.animals.update();

    // render scene
    this.renderer.render(this.scene, this.camera);
  }

  resize(videoWidth: number, videoHeight: number) {
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
  }

  onLandmarks(image: InputImage, landmarks: NormalizedLandmarkList) {
    if (image && landmarks) {
      // this.videoBg.setImage(image);
      this.faceMask.updateLandmarks(landmarks);
      this.glasses.updateLandmarks(landmarks);
      this.animals.updateLandmarks(landmarks);
    }
  }
}
