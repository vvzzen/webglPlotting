import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import useFetchData from "../../hooks/useFetchData"; // Adjust path as needed
import {
  createScene,
  createCamera,
  createRenderer,
  createLine,
  initManualYAxisControls,
} from "./threeUtils"; // Adjust path as needed
import AxisOverlay from "../axisOverlay.jsx"; // Adjust path as needed
import GridlinesOverlay from "../gridOverlay.jsx"; // Adjust path as needed

// Define margins (can be adjusted)
const commonMargin = { top: 20, right: 30, bottom: 40, left: 60 };

const WellPlot2D2 = () => {
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const lineRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Assuming useFetchData returns: [normalizedPoints, originalPoints, [xOriginalExtent, yOriginalExtent]]
  const [points, fetchedOriginalPoints, fetchedExtent] = useFetchData();
  const [renderTrigger, setRenderTrigger] = useState(0);

  const resizeHandler = useCallback(() => {
    if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

    const container = containerRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;

    const fullWidth = container.clientWidth;
    const fullHeight = container.clientHeight;

    // Set renderer to the full size of the canvas for drawing buffer
    renderer.setSize(fullWidth, fullHeight);

    // Calculate the dimensions of the actual plot area for Three.js
    const plotAreaWidth = Math.max(1, fullWidth - commonMargin.left - commonMargin.right);
    const plotAreaHeight = Math.max(1, fullHeight - commonMargin.top - commonMargin.bottom);

    // Adjust camera projection for the new plot area aspect ratio
    if (typeof camera.resize === "function") {
      const newAspect = plotAreaWidth / plotAreaHeight;
      camera.resize(newAspect); // Call with only the new aspect ratio
    } else {
      // Fallback if camera.resize is not a method (should not happen with your createCamera)
      // This example assumes direct manipulation if needed, but your camera.resize is preferred.
      const aspect = plotAreaWidth / plotAreaHeight;
      // Example: if camera maintains a fixed vertical frustumSize in its properties
      // camera.left = (-camera.userData.frustumSize * aspect) / 2;
      // camera.right = (camera.userData.frustumSize * aspect) / 2;
      // camera.top = camera.userData.frustumSize / 2;
      // camera.bottom = -camera.userData.frustumSize / 2;
      camera.updateProjectionMatrix();
    }
  }, []); // Dependencies are refs, which are stable.

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || points.length === 0 || !fetchedExtent || fetchedExtent.length !== 2) {
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;

    sceneRef.current = createScene(0xffffff); // White background for plot area viewport

    const initialFullWidth = container.clientWidth;
    const initialFullHeight = container.clientHeight;
    
    const initialPlotAreaWidth = Math.max(1, initialFullWidth - commonMargin.left - commonMargin.right);
    const initialPlotAreaHeight = Math.max(1, initialFullHeight - commonMargin.top - commonMargin.bottom);

    // Your createCamera uses initialPlotAreaWidth/Height for initial aspect, and '4' is frustumSize
    cameraRef.current = createCamera(initialPlotAreaWidth, initialPlotAreaHeight, 4);
    // Store frustumSize if needed by fallback resize logic, e.g. cameraRef.current.userData.frustumSize = 4;


    rendererRef.current = createRenderer(canvas, initialFullWidth, initialFullHeight); // Full size canvas

    initManualYAxisControls(cameraRef.current, rendererRef.current.domElement, {
      zoomSensitivity: 0.002, // Adjust as needed
      panSensitivity: 0.001,   // Adjust as needed
    });

    // Handle line updates
    if (lineRef.current) {
      sceneRef.current.remove(lineRef.current);
      if (lineRef.current.geometry) lineRef.current.geometry.dispose();
      if (lineRef.current.material) lineRef.current.material.dispose();
    }
    lineRef.current = createLine(points); // points are normalized from useFetchData
    sceneRef.current.add(lineRef.current);

    resizeHandler(); // Call once for initial setup
    window.addEventListener("resize", resizeHandler);

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      
      if(!container || !renderer || !scene || !camera) return; // Guard against premature calls

      const fullWidth = container.clientWidth;
      const fullHeight = container.clientHeight;

      // Define plot area for viewport and scissor for every frame
      const plotX = commonMargin.left;
      const plotY = commonMargin.bottom; // WebGL Y is from bottom for viewport
      const plotWidth = Math.max(1, fullWidth - commonMargin.left - commonMargin.right);
      const plotHeight = Math.max(1, fullHeight - commonMargin.top - commonMargin.bottom);

      renderer.setScissorTest(true);
      renderer.setScissor(plotX, plotY, plotWidth, plotHeight);
      renderer.setViewport(plotX, plotY, plotWidth, plotHeight);
      
      // The background color set in createScene will apply to this viewport.
      renderer.render(scene, camera);
      
      renderer.setScissorTest(false); // Good practice to disable if not needed for other passes

      setRenderTrigger(prev => prev + 1); // Trigger D3 overlay updates
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeHandler);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (lineRef.current) {
        if (sceneRef.current) sceneRef.current.remove(lineRef.current); // Ensure removal from scene
        if (lineRef.current.geometry) lineRef.current.geometry.dispose();
        if (lineRef.current.material) lineRef.current.material.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [points, fetchedExtent, resizeHandler]);

  const showOverlays = containerRef.current && fetchedExtent && fetchedExtent.length === 2 && cameraRef.current;

  return (
    <div
      ref={containerRef}
      className='relative w-1/4 h-4/5 border-2 border-gray-300'
      style={{ border: "1px solid #ccc", overflow: "hidden" }} // Ensure visibility and clip
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      {showOverlays && (
        <>
          <GridlinesOverlay
            width={containerRef.current.clientWidth}
            height={containerRef.current.clientHeight}
            margin={commonMargin}
            camera={cameraRef.current}
            xExtent={fetchedExtent[0]} // Original X extent
            yOriginalExtent={fetchedExtent[1]} // Original Y extent
            renderTrigger={renderTrigger}
          />
          <AxisOverlay
            width={containerRef.current.clientWidth}
            height={containerRef.current.clientHeight}
            margin={commonMargin}
            camera={cameraRef.current}
            extent={fetchedExtent} // Passes [xOriginalExtent, yOriginalExtent]
            renderTrigger={renderTrigger}
          />
        </>
      )}
    </div>
  );
};

export default WellPlot2D2;