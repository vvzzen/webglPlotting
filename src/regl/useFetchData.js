import { useState, useEffect } from "react";
import * as d3 from "d3";
import hardcodedData from "../WellDataBasicLog1.json";

const useFetchData = (x,y) => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    try {
      if (!hardcodedData.results || hardcodedData.results.length === 0) {
        console.error("No data found in results.");
        return;
      }

      // ✅ Define 'data' immediately
      const data = hardcodedData.results.map(d => ({
        x: +d.A_GR,  // X-axis
        y: +d.tvdss   // Y-axis
      }));

      // Normalize for WebGL (-1 to 1 range)
      const xExtent = d3.extent(data, d => d.x);
      const yExtent = d3.extent(data, d => d.y);

      const xScale = d3.scaleLinear().domain(xExtent).range([-1, 1]);
      const yScale = d3.scaleLinear().domain(yExtent).range([-1, 1]);

      const normalizedData = data.map(d => ({
        x: xScale(d.x),
        y: yScale(d.y)
      }));

      setPoints(normalizedData);
    } catch (error) {
      console.error("Error processing data:", error);
    }
  }, []);

  return points;
};

export default useFetchData;
