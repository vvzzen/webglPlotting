// createCamera.js
import * as THREE from "three";

export const createCamera = (initialPlotAreaWidth, initialPlotAreaHeight, targetYFrustum = 4) => {
  // targetYFrustum is the desired Y viewing height (in world units at zoom=1)
  // when the aspect ratio is wide enough not to clip the X data.
  // If the aspect ratio is too narrow, the Y viewing height will expand
  // to ensure all X data remains visible without distortion.

  const camera = new THREE.OrthographicCamera(
    0, // left - will be set by resize
    0, // right - will be set by resize
    0, // top - will be set by resize
    0, // bottom - will be set by resize
    0.1, // near
    1000 // far
  );

  // Store parameters needed by the resize logic
  camera.userData.targetYFrustum = targetYFrustum;
  camera.userData.dataXExtentWidth = 2.0; // Your normalized data spans from -1 to 1 on X (width of 2.0)

  camera.resize = (plotWidth, plotHeight) => {
    if (plotWidth <= 0 || plotHeight <= 0) {
      // Avoid division by zero or invalid states by setting a default failsafe projection
      camera.left = -1; camera.right = 1;
      camera.top = 1; camera.bottom = -1;
      camera.updateProjectionMatrix();
      return;
    }

    const aspect = plotWidth / plotHeight;
    const dataXW = camera.userData.dataXExtentWidth; // e.g., 2.0
    let yFrustumForCalc = camera.userData.targetYFrustum; // Base Y frustum at zoom = 1

    // Calculate initial world dimensions based on the target Y frustum and current aspect ratio
    let worldViewWidth = yFrustumForCalc * aspect;
    let worldViewHeight = yFrustumForCalc;

    // If the calculated worldViewWidth is too narrow to fit all the X data,
    // then the X data extent becomes the constraining dimension.
    if (worldViewWidth < dataXW) {
      worldViewWidth = dataXW; // Force worldViewWidth to fit all X data
      worldViewHeight = worldViewWidth / aspect; // Adjust worldViewHeight to maintain aspect ratio
    }

    // Set camera frustum boundaries. These define the view when camera.zoom = 1.
    // camera.zoom will then scale this view.
    camera.left = -worldViewWidth / 2;
    camera.right = worldViewWidth / 2;
    camera.top = worldViewHeight / 2;
    camera.bottom = -worldViewHeight / 2;

    camera.updateProjectionMatrix(); // Apply changes
  };

  // Set initial camera properties based on initial plot area dimensions
  camera.resize(initialPlotAreaWidth, initialPlotAreaHeight);

  camera.position.set(0, 0, 10); // Default camera position
  camera.lookAt(0, 0, 0);      // Default lookAt

  return camera;
};