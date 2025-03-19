import { useEffect, useRef } from "react";
import { createScene, createControls, createCamera, addHelpers } from "./threeUtils";
import { plotWells } from "./threeUtils/wellPlot";

const WellPlot2D = () => {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  const wellPoints = [
    { x: -100, y: 50 },
    { x: 50, y: -30 },
    { x: 120, y: 90 },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const { scene, renderer, width, height } = createScene(mountRef.current); 
    const camera = createCamera(width, height);
    cameraRef.current = camera;

    addHelpers(scene);
    plotWells(scene, wellPoints);

    const controlOptions = {
      noRotate: true,            // Lock rotation
      noZoom: false,             // Enable zoom
      zoomSpeed: 1.2,            // Adjust zoom speed
      noPan: false,              // Enable panning
      panSpeed: 5.0,             // Adjust pan speed
      screenSpacePanning: true,  // Use screen-based panning
      // lockXAxis: true,           // Lock movement to Y-axis only
      dynamicDampingFactor: 0.2, // Smooth movement
    }

    const controls = createControls(camera, renderer, controlOptions);
    controlsRef.current = controls;

    const handleResize = () => {
      camera.left = mountRef.current.clientWidth / -2;
      camera.right = mountRef.current.clientWidth / 2;
      camera.top = mountRef.current.clientHeight / 2;
      camera.bottom = mountRef.current.clientHeight / -2;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      controls.handleResize();
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // **Handle Zoom Scaling Dynamically**
  // useEffect(() => {
  //   if (!cameraRef.current || !controlsRef.current) return;

  //   const camera = cameraRef.current;
  //   const controls = controlsRef.current;

  //   const updateProjection = () => {
  //     const aspectRatio = camera.right / camera.top;

  //     // Keep X static, scale Y dynamically
  //     camera.top = camera.position.z * aspectRatio;
  //     camera.bottom = -camera.top;
  //     camera.updateProjectionMatrix();
  //   };

  //   controls.addEventListener("change", updateProjection);

  //   return () => controls.removeEventListener("change", updateProjection);
  // }, []);

  return <div ref={mountRef} className="w-1/2 h-1/2">tes</div>;
};

export default WellPlot2D;
