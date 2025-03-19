import * as THREE from "three";

export const addHelpers = (scene) => {
  const gridHelper = new THREE.GridHelper(5000, 100, "black", "gray");
  gridHelper.rotation.x = Math.PI / 2;
  scene.add(gridHelper);
};
