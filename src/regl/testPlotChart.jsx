import {useRef, useEffect, useState} from "react";
import REGL from "regl";
// import * as d3 from 'd3';
import useFetchData from "./useFetchData";
("./useFetchData");
import drawLine from "./drawFunctions/drawLine";
import drawAxes from "./drawFunctions/drawAxes";
import drawGrid from "./drawFunctions/drawGrid";
import frag from "./glslShaders/testPlotChartFrag.glsl?raw";
import vert from "./glslShaders/testPlotChartVert.glsl?raw";
import {getAxisTicks} from "./helpers/getAxisTicks";

const ReglScatterPlot = () => {
  const canvasRef = useRef(null);
  const reglRef = useRef(null); // Store REGL instance
  const [points, setPoints] = useState([]); // Store data
  const [fetchedPoints, fetchedOriginalPoints, fetchedExtent] = useFetchData(); // Fetch data
  const [ticks, setTicks] = useState({x: [], y: []});

  useEffect(() => {
    console.log("Fetched points:", fetchedPoints);
    console.log("Fetched original points:", fetchedOriginalPoints);
    console.log("Fetched extent:", fetchedExtent);
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

    console.log(
      "Mapped positions:",
      points.map((d) => [d.x, d.y])
    );
    points.sort((a, b) => a.x - b.x);

    const xValues = points.map((p) => p.x);
    const yValues = points.map((p) => p.y);
    const xTicks = getAxisTicks(Math.min(...xValues), Math.max(...xValues));
    const yTicks = getAxisTicks(Math.min(...yValues), Math.max(...yValues));

    setTicks({x: xTicks, y: yTicks});

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
    /** DRAW AXES */
    const drawAxesCmd = drawAxes(regl, width, height, frag, vert);
    const drawGridCmd = drawGrid(regl, width, height, frag, vert);

    const drawLineCmd = drawLine(regl, points, width, height, frag, vert);

    // Start animation loop
    const frameLoop = regl.frame(() => {
      console.log("Rendering frame");

      regl.clear({color: [1, 1, 1, 1], depth: 1});
      // regl._gl.viewport(0, 0, window.innerWidth, window.innerHeight);

      // console.log("Calling drawTestLine...");
      drawLineCmd({
        stageWidth: width,
        stageHeight: height,
        color: [0, 0, 1],
        frag,
        vert,
      });
      drawGridCmd({
        stageWidth: width,
        stageHeight: height,
        color: [0.8, 0.8, 0.8],
        frag,
        vert,
      });
      // drawAxesCmd({
      //   stageWidth: width,
      //   stageHeight: height,
      //   color: [0, 0, 0],
      //   frag,
      //   vert,
      // });
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

  const toScreenCoords = (x, y) => {
    const xMin = Math.min(...points.map((p) => p.x));
    const xMax = Math.max(...points.map((p) => p.x));
    const yMin = Math.min(...points.map((p) => p.y));
    const yMax = Math.max(...points.map((p) => p.y));

    return {
      left: ((x - xMin) / (xMax - xMin)) * window.innerWidth + "px",
      top: (1 - (y - yMin) / (yMax - yMin)) * window.innerHeight + "px",
    };
  };

  return (
    <div className="w-3/5 h-3/5">
      <canvas
        ref={canvasRef}
        width={window.innerWidth*0.6}
        height={window.innerHeight*0.6}
      />
      {/* X Axis Labels */}
      {/* {ticks.x.map((x, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            transform: "translateX(-50%)",
            ...toScreenCoords(x, Math.min(...points.map((p) => p.y))),
            fontSize: "12px",
            color: "black",
          }}
        >
          {x.toFixed(2)}
        </div>
      ))} */}
      {/* Y Axis Labels */}
      {/* {ticks.y.map((y, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            transform: "translateY(-50%)",
            ...toScreenCoords(Math.min(...points.map((p) => p.x)), y),
            fontSize: "12px",
            color: "black",
          }}
        >
          {y.toFixed(2)}
        </div>
      ))} */}
    </div>
  );
};

export default ReglScatterPlot;
