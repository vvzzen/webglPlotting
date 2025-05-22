import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as fc from "d3fc";

const Plot2D = () => {
  const containerRef = useRef(null);

  useEffect(() => {
      if (!containerRef.current) return;

      const data = fc.randomGeometricBrownianMotion().steps(1e4)(1);
      const extent = fc.extentLinear();

      const xScale = d3.scaleLinear().domain([0, data.length - 1]);
      const yScale = d3.scaleLinear().domain(extent(data));

      const container = containerRef.current;

      const series = fc
          .seriesWebglLine()
          .xScale(xScale)
          .yScale(yScale)
          .crossValue((_, i) => i)
          .mainValue(d => d)
          .defined(() => true)
          .equals(previousData => previousData.length > 0);

      const gridlines = fc
          .annotationCanvasGridline()
          .xScale(xScale)
          .yScale(yScale);

      let pixels = null;
      let frame = 0;
      let gl = null;

      const onClick = () => {
          const domain = xScale.domain();
          const max = Math.round(domain[1] / 2);
          xScale.domain([0, max]);
          container.requestRedraw();
      };

      const onMeasure = event => {
          const { width, height } = event.detail;
          xScale.range([0, width]);
          yScale.range([height, 0]);
          gl = container.querySelector("canvas").getContext("webgl");
          series.context(gl);
      };

      const onDraw = () => {
          if (pixels == null) {
              pixels = new Uint8Array(
                  gl.drawingBufferWidth * gl.drawingBufferHeight * 4
              );
          }
          performance.mark(`draw-start-${frame}`);
          series(data);
          gl.readPixels(
              0,
              0,
              gl.drawingBufferWidth,
              gl.drawingBufferHeight,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              pixels
          );
          performance.measure(`draw-duration-${frame}`, `draw-start-${frame}`);
          frame++;
      };

      d3.select(container)
          .on("click", onClick)
          .on("measure", onMeasure)
          .on("draw", onDraw);

      container.requestRedraw();

      return () => {
          d3.select(container).on("click", null).on("measure", null).on("draw", null);
      };
  }, []);

  return <d3fc-canvas ref={containerRef} style={{ width: "50%", height: "50%" }} />;
};

export default Plot2D

