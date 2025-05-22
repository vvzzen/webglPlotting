import React, {useState, useRef, useEffect} from "react";
import {createCamera, createControls} from './threeUtils'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import useFetchData from "../../hooks/useFetchData";
import * as THREE from "three";

const WellPlot2D = () => {
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  const [points, fetchedOriginalPoints, fetchedExtent] = useFetchData(); // Fetch data

  // useEffect(() => {
  //   console.log("Fetched points:", fetchedPoints);
  //   console.log("Fetched original points:", fetchedOriginalPoints);
  //   console.log("Fetched extent:", fetchedExtent);
  //   setPoints(fetchedPoints); // Update state with new data
  // }, [points, fetchedPoints]);

  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return; // wait until points exist

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 2; // your world units

    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2, // left
      (frustumSize * aspect) / 2, // right
      frustumSize / 2, // top
      frustumSize / -2, // bottom
      0.1, // near
      1000 // far
    );

    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({canvas: canvasRef.current});
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create the line material
    const material = new THREE.LineBasicMaterial({color: 0x0000ff});

    // Create geometry for the line from the points
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);

    const controls = new OrbitControls(camera, renderer.domElement);

    // Optional tuning for 2D-style interaction
    controls.enableRotate = false; // Disable orbiting rotation
    controls.enablePan = true; // Enable panning
    controls.enableZoom = true; // Enable zooming

    points.forEach((point, index) => {
      positions[index * 3] = point.x; // X coordinate
      positions[index * 3 + 1] = point.y; // Y coordinate
      positions[index * 3 + 2] = 0; // Z coordinate (always 0 for 2D)
    });

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    geometry.setDrawRange(0, points.length);

    // Create a line from the geometry and material
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    const resizeHandler = () => {
      const newAspect = window.innerWidth / window.innerHeight;
    
      camera.left   = (-frustumSize * newAspect) / 2;
      camera.right  = (frustumSize * newAspect) / 2;
      camera.top    = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
    
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', resizeHandler, false);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // important for damping
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animate);
      window.removeEventListener('resize', resizeHandler);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      controls.dispose();
    };
  }, [points]);

  return <canvas ref={canvasRef} />;
};

export default WellPlot2D;
