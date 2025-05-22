import { useRef, useEffect } from "react";
import * as d3 from "d3";

const GridlinesOverlay = ({ width, height, margin, camera, xExtent }) => {
  const svgRef = useRef();

  useEffect(() => {
    const yScale = d3.scaleLinear()
      .domain([camera.bottom, camera.top])
      .range([height - margin.bottom, margin.top]);

    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([margin.left, width - margin.right]);

    const yTicks = yScale.ticks(10);
    const xTicks = xScale.ticks(5); // can adjust this

    const svg = d3.select(svgRef.current);

    // Y GRIDLINES (horizontal lines)
    const yLines = svg.selectAll(".y-grid").data(yTicks);
    yLines.enter()
      .append("line")
      .attr("class", "y-grid")
      .merge(yLines)
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "2,2");

    yLines.exit().remove();

    // X GRIDLINES (vertical lines)
    const xLines = svg.selectAll(".x-grid").data(xTicks);
    xLines.enter()
      .append("line")
      .attr("class", "x-grid")
      .merge(xLines)
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "2,2");

    xLines.exit().remove();

  }, [camera, width, height, margin, xExtent]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    />
  );
};

export default GridlinesOverlay;