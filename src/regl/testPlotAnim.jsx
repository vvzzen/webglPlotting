import React, { useEffect, useRef, useState } from 'react';
import createREGL from 'regl';
import * as d3 from 'd3';

const AnimatedReglPlot = () => {
  const reglRef = useRef(null);
  const [currentLayout, setCurrentLayout] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const regl = createREGL({ canvas: canvasRef.current });
    reglRef.current = regl;
    const numPoints = 100000;
    const pointWidth = 4;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const duration = 1500;

    function greenCircleLayout(points) {
      const rng = d3.randomNormal(0, 0.05);
      points.forEach((d, i) => {
        d.x = (rng() + Math.cos(i)) * (width / 2.5) + width / 2;
        d.y = (rng() + Math.sin(i)) * (height / 2.5) + height / 2;
        d.color = [Math.random(), Math.random(), Math.random()];
      });
    }

    function blueNormalLayout(points) {
      const rng = d3.randomNormal(0, 0.15);
      points.forEach(d => {
        d.x = rng() * width + width / 2;
        d.y = rng() * height + height / 2;
        d.color = [Math.random(), Math.random(), Math.random()];
      });
    }

    const layouts = [greenCircleLayout, blueNormalLayout];
    const points = d3.range(numPoints).map(() => ({ tx: width / 2, ty: height / 2, colorEnd: [0, 0, 0] }));

    function animate(layout, points) {
      points.forEach(d => {
        d.sx = d.tx;
        d.sy = d.ty;
        d.colorStart = d.colorEnd;
      });
      layout(points);
      points.forEach(d => {
        d.tx = d.x;
        d.ty = d.y;
        d.colorEnd = d.color;
      });
      setStartTime(regl.now());

      const drawPoints = createDrawPoints(points);
      const frameLoop = regl.frame(({ time }) => {
        if (startTime === null) {
          setStartTime(time);
        }
        regl.clear({ color: [0, 0, 0, 1], depth: 1 });
        drawPoints({ pointWidth, stageWidth: width, stageHeight: height, duration, startTime });
        if (time - startTime > duration / 1000) {
          frameLoop.cancel();
          setCurrentLayout((prev) => (prev + 1) % layouts.length);
        }
      });
    }

    function createDrawPoints(points) {
      return regl({
        frag: `precision highp float; varying vec3 fragColor; void main() { gl_FragColor = vec4(fragColor, 1); }`,
        vert: `attribute vec2 positionStart, positionEnd; attribute vec3 colorStart, colorEnd; varying vec3 fragColor;
          uniform float pointWidth, stageWidth, stageHeight, elapsed, duration;
          vec2 normalizeCoords(vec2 position) {
            return vec2(2.0 * ((position.x / stageWidth) - 0.5), -(2.0 * ((position.y / stageHeight) - 0.5)));
          }
          float easeCubicInOut(float t) {
            t *= 2.0; return (t <= 1.0 ? t * t * t : (t -= 2.0) * t * t + 2.0) / 2.0;
          }
          void main() {
            gl_PointSize = pointWidth;
            float t = duration == 0.0 ? 1.0 : easeCubicInOut(elapsed / duration);
            vec2 position = mix(positionStart, positionEnd, t);
            fragColor = mix(colorStart, colorEnd, t);
            gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);
          }`,
        attributes: {
          positionStart: points.map(d => [d.sx, d.sy]),
          positionEnd: points.map(d => [d.tx, d.ty]),
          colorStart: points.map(d => d.colorStart),
          colorEnd: points.map(d => d.colorEnd),
        },
        uniforms: {
          pointWidth: regl.prop('pointWidth'),
          stageWidth: regl.prop('stageWidth'),
          stageHeight: regl.prop('stageHeight'),
          duration: regl.prop('duration'),
          elapsed: ({ time }, { startTime }) => (time - startTime) * 1000,
        },
        count: points.length,
        primitive: 'points',
      });
    }

    animate(layouts[currentLayout], points);
    return () => regl.destroy();
  }, [currentLayout]);

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />;
};

export default AnimatedReglPlot;
