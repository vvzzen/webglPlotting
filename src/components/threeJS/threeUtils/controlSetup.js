import {TrackballControls} from "three/examples/jsm/controls/TrackballControls";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

export const createControls = (camera, domElement, options = {}) => {
  let controls;
  switch (options.type) {
    case "trackball":
      controls = new TrackballControls(camera, domElement);
      break;
    case "orbit":
      controls = new OrbitControls(camera, domElement);
      break;
    default:
      throw new Error(`Unknown controls type: ${options.type}`);
  }

  // Apply settings dynamically
  if (options.camera === "perspective") {
    controls.minDistance = options.minDistance ?? 0;
    controls.maxDistance = options.maxDistance ?? Infinity;
  }

  if (options.camera === "orthographic") {
    controls.minZoom = options.minZoom ?? 0;
    controls.maxZoom = options.maxZoom ?? Infinity;
  }

  if (options.type === "orbit") {
    controls.autoRotate = options.autoRotate ?? false;
    controls.autoRotateSpeed = options.autoRotateSpeed ?? 2.0;

    controls.enableRotate = options.enableRotate ?? true;
    controls.rotateSpeed = options.rotateSpeed ?? 0.2;

    controls.enableZoom = options.enableZoom ?? true;
    controls.zoomSpeed = options.zoomSpeed ?? 1.2;

    controls.zoomToCursor = options.zoomToCursor ?? false;

    controls.enablePan = options.enablePan ?? true;
    controls.panSpeed = options.panSpeed ?? 0.8;
    controls.screenSpacePanning = options.screenSpacePanning ?? true;

    controls.enableDamping = options.enableDamping ?? true;
    if (options.enableDamping) {
      controls.dampingFactor = options.dampingFactor ?? 0.25;
    }
  }

  if (options.type === "trackball") {
    controls.rotateSpeed = options.rotateSpeed ?? 1.0;
    controls.zoomSpeed = options.zoomSpeed ?? 1.2;
    controls.panSpeed = options.panSpeed ?? 0.8;
    controls.noRotate = options.noRotate ?? false;
    controls.noZoom = options.noZoom ?? false;
    controls.noPan = options.noPan ?? false;
    controls.staticMoving = options.staticMoving ?? false;
    if (options.staticMoving) {
      controls.dynamicDampingFactor = options.dynamicDampingFactor ?? 0.3;
    }
  }

  // if (options.camera === 'orthographic' && options.customYAxisZoom) {
  //   domElement.addEventListener('wheel', (event) => {
  //     event.preventDefault();

  //     const delta = event.deltaY * options.customYAxisZoom.zoomSpeed;

  //     camera.zoom = THREE.MathUtils.clamp(
  //       camera.zoom + delta,
  //       options.customYAxisZoom.minZoom,
  //       options.customYAxisZoom.maxZoom
  //     );

  //     // Lock X-axis scaling, Zoom only affects Y
  //     camera.scale.set(1, camera.zoom, 1);
  //     camera.updateProjectionMatrix();
  //   }, { passive: false });
  // }
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


// initControls.js (manual controls only)
export const initManualYAxisControls = (camera, domElement, options = {}) => {
  let isPanning = false;
  let startY = 0;
  let startTop = camera.top;
  let startBottom = camera.bottom;

  const zoomSensitivity = options.zoomSensitivity ?? 0.002;
  const panSensitivity = options.panSensitivity ?? 0.01;

  domElement.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * zoomSensitivity;
    const height = camera.top - camera.bottom;
    const newHeight = height * (1 + zoomFactor);

    const centerY = (camera.top + camera.bottom) / 2;

    camera.top = centerY + newHeight / 2;
    camera.bottom = centerY - newHeight / 2;

    camera.updateProjectionMatrix();
  });

  domElement.addEventListener("mousedown", (e) => {
    isPanning = true;
    startY = e.clientY;
    startTop = camera.top;
    startBottom = camera.bottom;
  });

  domElement.addEventListener("mousemove", (e) => {
    if (!isPanning) return;

    const currentHeight = camera.top - camera.bottom;
    const dynamicPanSensitivity = currentHeight * (options.basePanSensitivity ?? 0.001);
  
    const dy = (e.clientY - startY) * dynamicPanSensitivity;
    camera.top = startTop + dy;
    camera.bottom = startBottom + dy;
    camera.updateProjectionMatrix();
  });

  domElement.addEventListener("mouseup", () => {
    isPanning = false;
  });
};
