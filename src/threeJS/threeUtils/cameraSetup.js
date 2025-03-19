import * as THREE from 'three'

export const createCamera = (width, height) => {
  const camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    0.1,
    1000
  );
  camera.position.z = 10;
  return (camera);
};