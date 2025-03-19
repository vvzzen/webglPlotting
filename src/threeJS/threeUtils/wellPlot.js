import * as THREE from "three";

export const plotWells = (scene, wellPoints) => {
  // Plot well markers
  wellPoints.forEach((well) => {
    const geometry = new THREE.CircleGeometry(5, 32);
    const material = new THREE.MeshBasicMaterial({ color: "blue" });
    const wellMarker = new THREE.Mesh(geometry, material);
    wellMarker.position.set(well.x, well.y, 0);
    scene.add(wellMarker);
  });

  // Create line connecting wells
  const wellVectors = wellPoints.map(({ x, y }) => new THREE.Vector3(x, y, 0));
  const geometry = new THREE.BufferGeometry().setFromPoints(wellVectors);
  const material = new THREE.LineBasicMaterial({ color: "red" });
  const line = new THREE.Line(geometry, material);
  scene.add(line);
};
