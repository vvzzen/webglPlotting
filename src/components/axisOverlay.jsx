// AxisOverlay.jsx

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const AxisOverlay = ({ width, height, margin, camera, extent, renderTrigger }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    // Clear previous axes before potentially returning early or redrawing
    svg.select(".x-axis").selectAll("*").remove();
    svg.select(".y-axis").selectAll("*").remove();

    if (
      !width || !height || !margin || !camera || !extent || extent.length !== 2 ||
      !extent[0] || !extent[1] || camera.top === camera.bottom
    ) {
      return; // Essential props are missing or camera not ready
    }

    const [xOriginalExtent, yOriginalDataExtent] = extent;

    // --- Y-AXIS (Depth Axis - on the left) ---
    // (This part remains unchanged)
    const unNormalizeYScale = d3.scaleLinear().domain([-1, 1]).range(yOriginalDataExtent);
    let yDomainForDisplay = [
      unNormalizeYScale(camera.bottom),
      unNormalizeYScale(camera.top)
    ];
    if (yDomainForDisplay[0] > yDomainForDisplay[1]) {
      yDomainForDisplay.reverse();
    }
    const yScale = d3.scaleLinear()
      .domain(yDomainForDisplay)
      .range([height - margin.bottom, margin.top]);
    const yAxis = d3.axisLeft(yScale)
      .ticks(Math.max(2, Math.floor((height - margin.top - margin.bottom) / 40)))
      .tickFormat(d3.format(".0f"));
    svg.select(".y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .selectAll("text")
      .attr("class", "axis-label y-axis-label");


    // --- X-AXIS (Log Value Axis - now at the bottom) ---
    const xScale = d3.scaleLinear()
      .domain(xOriginalExtent)
      .range([margin.left, width - margin.right]);

    // 1. Change d3.axisTop to d3.axisBottom
    const xAxis = d3.axisBottom(xScale) // Changed from axisTop
      .ticks(Math.max(2, Math.floor((width - margin.left - margin.right) / 80)))
      .tickFormat(d3.format(".0f"));

    // 2. Adjust the transform to position it at the bottom
    svg.select(".x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`) // Changed Y translate
      .call(xAxis)
      .selectAll("text")
      .attr("class", "axis-label x-axis-label");

  }, [width, height, margin, camera, camera.top, camera.bottom, extent, renderTrigger]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      <g className="axis y-axis" />
      <g className="axis x-axis" /> {/* This group will now be positioned at the bottom */}
    </svg>
  );
};

export default AxisOverlay;