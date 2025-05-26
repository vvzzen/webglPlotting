// WellPlot2D2.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import useFetchData from "../../hooks/useFetchData"; // Adjust path
import {
  createScene,
  createCamera, // Use the modified createCamera.js above
  createRenderer,
  createLine,
  initManualYAxisControls, // Your custom controls
} from "./threeUtils"; // Adjust path
import AxisOverlay from "../axisOverlay.jsx"; // Adjust path
import GridlinesOverlay from "../gridOverlay.jsx"; // Adjust path

const commonMargin = { top: 40, right: 30, bottom: 40, left: 60 };

const WellPlot2D2 = () => {
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const lineRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  const [points, , fetchedExtent] = useFetchData(); // originalPoints not used directly here
  const [renderTrigger, setRenderTrigger] = useState(0);

  const resizeHandler = useCallback(() => {
    if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

    const container = containerRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;

    const fullWidth = container.clientWidth;
    const fullHeight = container.clientHeight;

    renderer.setSize(fullWidth, fullHeight);

    const plotAreaWidth = Math.max(1, fullWidth - commonMargin.left - commonMargin.right);
    const plotAreaHeight = Math.max(1, fullHeight - commonMargin.top - commonMargin.bottom);

    // Call the camera's modified resize method with the actual plot area dimensions
    camera.resize(plotAreaWidth, plotAreaHeight);

  }, []);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || points.length === 0 || !fetchedExtent || fetchedExtent.length !== 2) {
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;

    sceneRef.current = createScene(0xffffff);

    const initialFullWidth = container.clientWidth;
    const initialFullHeight = container.clientHeight;
    const initialPlotAreaWidth = Math.max(1, initialFullWidth - commonMargin.left - commonMargin.right);
    const initialPlotAreaHeight = Math.max(1, initialFullHeight - commonMargin.top - commonMargin.bottom);

    // Use the modified createCamera
    cameraRef.current = createCamera(initialPlotAreaWidth, initialPlotAreaHeight, 4); // '4' is targetYFrustum

    rendererRef.current = createRenderer(canvas, initialFullWidth, initialFullHeight);

    // Initialize your custom controls
    // Keep using your original initManualYAxisControls for now
    const controlsCleanup = initManualYAxisControls(cameraRef.current, rendererRef.current.domElement, {
      zoomSensitivity: 0.002, // Your original sensitivity
      panSensitivity: 0.01,   // Your original sensitivity
      basePanSensitivity: 0.001 // From your original example
    });


    if (lineRef.current) {
      sceneRef.current.remove(lineRef.current);
      if (lineRef.current.geometry) lineRef.current.geometry.dispose();
      if (lineRef.current.material) lineRef.current.material.dispose();
    }
    lineRef.current = createLine(points);
    sceneRef.current.add(lineRef.current);

    resizeHandler();
    window.addEventListener("resize", resizeHandler);

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const currentRenderer = rendererRef.current; // Use refs directly
      const currentScene = sceneRef.current;
      const currentCamera = cameraRef.current;
      const currentContainer = containerRef.current;

      if(!currentContainer || !currentRenderer || !currentScene || !currentCamera) return;

      const fullWidth = currentContainer.clientWidth;
      const fullHeight = currentContainer.clientHeight;
      const plotX = commonMargin.left;
      const plotY = commonMargin.bottom;
      const plotWidth = Math.max(1, fullWidth - commonMargin.left - commonMargin.right);
      const plotHeight = Math.max(1, fullHeight - commonMargin.top - commonMargin.bottom);

      currentRenderer.setScissorTest(true);
      currentRenderer.setScissor(plotX, plotY, plotWidth, plotHeight);
      currentRenderer.setViewport(plotX, plotY, plotWidth, plotHeight);
      
      currentRenderer.render(currentScene, currentCamera);
      currentRenderer.setScissorTest(false);
      setRenderTrigger(prev => prev + 1);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeHandler);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (lineRef.current && sceneRef.current) {
        sceneRef.current.remove(lineRef.current);
        if (lineRef.current.geometry) lineRef.current.geometry.dispose();
        if (lineRef.current.material) lineRef.current.material.dispose();
      }
      if (rendererRef.current) rendererRef.current.dispose();
      if (typeof controlsCleanup === 'function') controlsCleanup(); // If your controls return a cleanup
    };
  }, [points, fetchedExtent, resizeHandler]);

  const showOverlays = containerRef.current && fetchedExtent && fetchedExtent.length === 2 && cameraRef.current;

  return (
    <div
      ref={containerRef}
      className='relative w-1/4 h-4/5 border-2 border-gray-300' // Your desired track sizing
      style={{ overflow: "hidden" }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      {showOverlays && (
        <>
          <GridlinesOverlay
            width={containerRef.current.clientWidth}
            height={containerRef.current.clientHeight}
            margin={commonMargin}
            camera={cameraRef.current}
            xExtent={fetchedExtent[0]}
            yOriginalExtent={fetchedExtent[1]}
            renderTrigger={renderTrigger}
          />
          <AxisOverlay
            width={containerRef.current.clientWidth}
            height={containerRef.current.clientHeight}
            margin={commonMargin}
            camera={cameraRef.current}
            extent={fetchedExtent}
            renderTrigger={renderTrigger}
          />
        </>
      )}
    </div>
  );
};

export default WellPlot2D2;