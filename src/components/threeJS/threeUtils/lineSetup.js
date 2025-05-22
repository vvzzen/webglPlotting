import * as THREE from 'three';

export const createLine = (points) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(points.length * 3);

  points.forEach((p, i) => {
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = 0;
  });

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

  return new THREE.Line(geometry, material);
};
