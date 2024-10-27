import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const loadModel = (file: string) => {
  return new Promise((res, rej) => {
    const loader = new GLTFLoader();
    loader.load(
      file,
      gltf => {
        res(gltf);
      },
      undefined,
      error => {
        rej(error);
      }
    );
  });
};
