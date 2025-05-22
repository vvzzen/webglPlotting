import * as THREE from "three";

export const createScene = (bgColor) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bgColor); // Optional: white background
  return scene;
};