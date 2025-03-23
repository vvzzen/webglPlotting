import { useRef, useEffect, useState } from "react";
import REGL from "regl";
// import * as d3 from 'd3';
import useFetchData from "./useFetchData";'./useFetchData'
import frag from './glsl/testPlotChartFrag.glsl?raw';
import vert from './glsl/testPlotChartVert.glsl?raw';

const ReglScatterPlot = () => {
  const canvasRef = useRef(null);
  const reglRef = useRef(null); // Store REGL instance
  const [points, setPoints] = useState([]); // Store data
  const fetchedPoints = useFetchData(); // Fetch data

  useEffect(() => {
    console.log("Fetched points:", fetchedPoints);
    setPoints(fetchedPoints); // Update state with new data
  }, [points, fetchedPoints]);

  // Initialize REGL once
  useEffect(() => {
    if (!canvasRef.current) return;
    reglRef.current = REGL(canvasRef.current);
  }, [points, fetchedPoints]);
  
  useEffect(() => {
    if (!reglRef.current || points.length === 0) return;

    console.log("Drawing chart with points:", points);

    const regl = reglRef.current;
    const pointWidth = 4;
    const width = window.innerWidth;
    const height = window.innerHeight;

    console.log("Mapped positions:", points.map((d) => [d.x, d.y]));
    points.sort((a, b) => a.x - b.x);

    // const testPoints = [
    //   [-1, -1], // Bottom-left corner of clip space
    //   [1, 1]    // Top-right corner of clip space
    // ];
    
    // const drawTestLine = regl({
    //   frag: frag,
    //   vert: vert,
    //   attributes: {
    //     position: testPoints,
    //   },
    //   uniforms: {
    //     pointWidth: 4,
    //     stageWidth: window.innerWidth,
    //     stageHeight: window.innerHeight,
    //     color: [0.5, 0, 0], // Red for visibility
    //   },
    //   count: testPoints.length,
    //   primitive: "line strip",
    // });

    // Compile drawPoints function
    const drawLine = regl({
      frag: frag,
      vert: vert,
      attributes: {
        position: points.map((d) => [d.x, d.y]),
      },
      uniforms: {
        stageWidth: regl.prop("stageWidth"),
        stageHeight: regl.prop("stageHeight"),
        color: regl.prop("color"),
      },
      count: points.length,
      primitive: "line strip",
    });

    console.log("drawLine function:", drawLine);

    // Start animation loop
    const frameLoop = regl.frame(() => {
      console.log("Rendering frame");

      regl.clear({ color: [1, 1, 1, 1], depth: 1 });

      // console.log("Calling drawTestLine...");
      drawLine({
        stageWidth: width,
        stageHeight: height,
        color: [0.5,0.5,0.5],
      });
      // drawTestLine();
      // console.log("Draw call finished.");      // Draw only once (optional)
      // frameLoop.cancel();
    });

    console.log(points);
    // Cleanup on unmount
    return () => {
      frameLoop.cancel();
      regl.destroy();
    };
  }, [points]);

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />;
};

export default ReglScatterPlot;
