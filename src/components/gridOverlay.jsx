import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const GridlinesOverlay = ({ width, height, margin, camera, xExtent, yOriginalExtent, renderTrigger }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll(".grid-line").remove(); // Clear previous gridlines

    if (
      !width || !height || !margin || !camera || !xExtent || !yOriginalExtent ||
      camera.top === camera.bottom // Avoid division by zero or invalid camera state
    ) {
      return; // Essential props are missing or camera not ready
    }

    // --- Y-GRIDLINES (Horizontal lines) ---
    // Logic similar to AxisOverlay for Y-scale to match axis ticks
    const unNormalizeYScale = d3.scaleLinear().domain([-1, 1]).range(yOriginalExtent);

    let yDomainForGrid = [
      unNormalizeYScale(camera.bottom),
      unNormalizeYScale(camera.top)
    ];
    if (yDomainForGrid[0] > yDomainForGrid[1]) {
      yDomainForGrid.reverse();
    }

    const yScale = d3.scaleLinear()
      .domain(yDomainForGrid)
      .range([height - margin.bottom, margin.top]);

    // Use the same tick generation logic as Y-axis for consistency if desired
    const yTicks = yScale.ticks(Math.max(2, Math.floor((height - margin.top - margin.bottom) / 40)));

    svg.selectAll(".y-grid-line")
      .data(yTicks, d => d) // Key function for object constancy
      .join(
        enter => enter.append("line")
          .attr("class", "y-grid-line grid-line"),
        update => update, // No specific update attributes needed if all are set below
        exit => exit.remove()
      )
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#e0e0e0") // Lighter color for gridlines
      .attr("stroke-dasharray", "2,2");


    // --- X-GRIDLINES (Vertical lines) ---
    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([margin.left, width - margin.right]);

    // Use the same tick generation logic as X-axis for consistency
    const xTicks = xScale.ticks(Math.max(2, Math.floor((width - margin.left - margin.right) / 80)));

    svg.selectAll(".x-grid-line")
      .data(xTicks, d => d) // Key function
      .join(
        enter => enter.append("line")
          .attr("class", "x-grid-line grid-line"),
        update => update,
        exit => exit.remove()
      )
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("stroke", "#e0e0e0") // Lighter color for gridlines
      .attr("stroke-dasharray", "2,2");

  }, [width, height, margin, camera, camera.top, camera.bottom, xExtent, yOriginalExtent, renderTrigger]); // Added camera.top/bottom

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    />
  );
};

export default GridlinesOverlay;