import { useRef, useEffect } from "react";
import * as d3 from "d3";

const AxisOverlay = ({ extent, height, margin, camera }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!extent.length) return;

    const [xExtent, yExtent] = extent;

    const yScale = d3.scaleLinear()
      .domain([camera.bottom, camera.top]) // dynamically update from camera
      .range([height - margin.bottom, margin.top]);

    const yAxis = d3.axisLeft(yScale)
      .ticks(10)
      .tickFormat(d3.format(".2f"));

    d3.select(svgRef.current)
      .select("#y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);
  }, [extent, camera, height, margin]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      className="absolute top-0 left-0"
      style={{ pointerEvents: "none" }}
    >
      <g id="y-axis"></g>
    </svg>
  );
};

export default AxisOverlay;
