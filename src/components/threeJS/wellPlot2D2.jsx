import React, {useRef, useEffect, useState} from "react";
import * as THREE from "three";
import useFetchData from "../../hooks/useFetchData";
import {
  createScene,
  createCamera,
  createRenderer,
  createLine,
  createControls,
  initManualYAxisControls,
} from "./threeUtils";
import AxisOverlay from "../axisOverlay.jsx";
import GridlinesOverlay from "../gridOverlay.jsx";
import {contain} from "three/src/extras/TextureUtils.js";

const WellPlot2D2 = () => {
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const containerRef = useRef(null);

  const [points, fetchedOriginalPoints, fetchedExtent] = useFetchData();

  const [controlOptions, setControlOptions] = useState({
    type: "orbit",
    camera: "othographic",

    enableRotate: false,
    enablePan: true,
    enableZoom: true,
    zoomToCursor: true,
    minZoom: 0.5,
    maxZoom: 5,
    zoomSpeed: 1,
  });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || points.length === 0)
      return;

    console.log("Fetched extent:", fetchedExtent);
    const {clientWidth, clientHeight} = containerRef.current;

    const scene = createScene("white");
    const camera = createCamera(clientWidth, clientHeight, 4);
    cameraRef.current = camera;
    const renderer = createRenderer(
      canvasRef.current,
      clientWidth,
      clientHeight
    );
    // const controls = createControls(camera, renderer.domElement, controlOptions);
    initManualYAxisControls(camera, renderer.domElement, {
      zoomSensitivity: 0.002,
      panSensitivity: 0.001,
    });
    const line = createLine(points);

    scene.add(line);

    const resizeHandler = () => {
      const {clientWidth, clientHeight} = containerRef.current;
      camera.resize(clientWidth, clientHeight);
      renderer.setSize(clientWidth, clientHeight);
    };
    window.addEventListener("resize", resizeHandler);

    const animate = () => {
      // controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      renderer.dispose();
      line.geometry.dispose();
      line.material.dispose();
      // controls.dispose();
      window.removeEventListener("resize", resizeHandler);
    };
  }, [points]);

  return (
    <div
      ref={containerRef}
      className='relative w-1/4 h-4/5 border-2 border-gray-300'
    >
      <canvas ref={canvasRef} />

      <GridlinesOverlay
        width={containerRef.current?.clientHeight || 0}
        height={containerRef.current?.clientHeight || 0}
        margin={{top: 20, right: 20, bottom: 20, left: 10}}
        camera={cameraRef}
        xExtent={fetchedExtent[0] || 0} // your d3.extent(x)
      />
    </div>
  );
};

export default WellPlot2D2;
