import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

export const createControls = (camera, renderer, options = {}) => {
  const controls = new TrackballControls(camera, renderer.domElement);

  // Apply settings dynamically
  controls.noRotate = options.noRotate ?? true;
  controls.rotateSpeed = options.rotateSpeed ?? 0;

  controls.noZoom = options.noZoom ?? false;
  controls.zoomSpeed = options.zoomSpeed ?? 1.2;
  controls.minDistance = options.minDistance ?? 0;
  controls.maxDistance = options.maxDistance ?? Infinity;

  controls.noPan = options.noPan ?? false;
  controls.panSpeed = options.panSpeed ?? 0.8;
  controls.screenSpacePanning = options.screenSpacePanning ?? true;

  controls.dynamicDampingFactor = options.dynamicDampingFactor ?? 0.2;

  // Restrict movement to Y-axis only
  // if (options.lockYAxis) {
  //   controls.addEventListener("change", () => {
  //     // controls.object.position.x = 0; // Lock X movement
  //     controls.object.position.y = 0; // Keep Z consta
  //     controls.object.position.z = 0; // Keep Z consta
  //   });
  // }

  return controls;
};
