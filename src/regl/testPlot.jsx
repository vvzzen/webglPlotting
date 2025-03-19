import { useRef, useEffect } from "react";
import REGL from "regl";
import * as d3 from "d3";

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

    // Compile drawPoints function
    const drawPoints = regl({
      frag: `
        precision highp float;
        varying vec3 fragColor;
        void main() {
          gl_FragColor = vec4(fragColor, 1);
        }
      `,
      vert: `
        precision highp float;
        attribute vec2 position;
        attribute vec3 color;
        varying vec3 fragColor;
        uniform float pointWidth;
        uniform float stageWidth;
        uniform float stageHeight;

        vec2 normalizeCoords(vec2 position) {
          return vec2(
            2.0 * ((position.x / stageWidth) - 0.5),
            -(2.0 * ((position.y / stageHeight) - 0.5))
          );
        }

        void main() {
          gl_PointSize = pointWidth;
          fragColor = color;
          gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);
        }
      `,
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
