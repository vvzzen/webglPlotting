import * as THREE from "three";

export const createScene = (mountRef) => {
  const width = mountRef.clientWidth;
  const height = mountRef.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("white");

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  mountRef.appendChild(renderer.domElement);

  return { scene, renderer, width, height };
};
