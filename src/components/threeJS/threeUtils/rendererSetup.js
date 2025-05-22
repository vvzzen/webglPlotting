import * as THREE from 'three';

export const createRenderer = (canvas, width, height, pixelRatio) => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelRatio);
  return renderer;
};
