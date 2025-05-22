import * as THREE from "three";

export const createCamera = (aspectWidth, aspectHeight, frustumSize) => {
  const aspect = aspectWidth / aspectHeight;

  const camera = new THREE.OrthographicCamera(
    (-frustumSize * aspect) / 2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    -frustumSize / 2,
    0.1,
    1000
  );

  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  camera.resize = (newAspect) => {
    camera.left   = (-frustumSize * newAspect) / 2;
    camera.right  = ( frustumSize * newAspect) / 2;
    camera.top    = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
  };

  return camera;
};
