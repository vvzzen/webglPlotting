import { useRef, useEffect } from "react";
import REGL from "regl";
import * as d3 from "d3";
import frag from './glsl/testPlotFrag.glsl?raw';
import vert from './glsl/testPlotVert.glsl?raw';

const ReglScatterPlot = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const regl = REGL(canvasRef.current);
    const numPoints = 100000;
    const pointWidth = 4;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create initial set of points
    const rng = d3.randomNormal(0, 0.15);
    const points = d3.range(numPoints).map(() => ({
      x: rng() * width + width / 2,
      y: rng() * height + height / 2,
      color: [Math.random(), Math.random(), Math.random()],
    }));

    console.log(points);
    // Compile drawPoints function
    const drawPoints = regl({
      frag: frag,
      vert: vert,
      attributes: {
        position: points.map((d) => [d.x, d.y]),
        color: points.map((d) => d.color),
      },
      uniforms: {
        pointWidth: regl.prop("pointWidth"),
        stageWidth: regl.prop("stageWidth"),
        stageHeight: regl.prop("stageHeight"),
      },
      count: points.length,
      primitive: "points",
    });

    // Start animation loop
    const frameLoop = regl.frame(() => {
      regl.clear({ color: [1, 1, 1, 1], depth: 1 });

      drawPoints({
        pointWidth,
        stageWidth: width,
        stageHeight: height,
      });

      // Draw only once (optional)
      // frameLoop.cancel();
    });

    // Cleanup on unmount
    return () => {
      frameLoop.cancel();
      regl.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />;
};

export default ReglScatterPlot;
