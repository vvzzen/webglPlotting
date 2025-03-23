import React from 'react';
import './index.css';
import {useState} from 'react'
// import * as THREE from 'three'
import WellFieldVisualization from './threeJS/wellPlot3D'
import WellPlot2D from './threeJS/wellPlot2D'
import Plot2D from './d3fc/plot2D'
// import WellFieldVisualizationDeckGL from './deckgl'
// import TestPlot from './timeChart/testPlot'
import TestPlot from './regl/testPlot'
import TestPlotAnim from './regl/testPlotAnim'
import TestPlotChart from './regl/testPlotChart'

const HelloWorld = () => {
  const [toggle, setToggle] = useState(false);
  function handleClick() {
    setToggle(!toggle)
  };

  const mapData = {
    width: 20, // Grid width
    height: 20, // Grid height
    heights: Array.from({ length: 20 * 20 }, (_, i) => 
      Math.sin((i % 20) / 3) * Math.cos(Math.floor(i / 20) / 3) * 5 + 5
    ) // Generate terrain-like height data
  };
  
  const wellData = [
    { id: 1, x: -20, y: -10, z: 8, depth: 100, radius: 3, group: "A", groupColor: 0xff0000 },
    { id: 2, x: 10, y: 5, z: 4, depth: 80, radius: 5, group: "B", groupColor: 0x00ff00 },
    { id: 3, x: -5, y: -15, z: 6, depth: 120, radius: 4, group: "A", groupColor: 0xff0000 },
    { id: 4, x: 15, y: -5, z: 3, depth: 90, radius: 2, group: "C", groupColor: 0x0000ff },
    { id: 5, x: -10, y: 10, z: 7, depth: 110, radius: 6, group: "B", groupColor: 0x00ff00 }
  ];

  return (
    <>
      <h1 
        className={toggle ? "font-bold text-9xl" : "text-xl"}
        onClick={handleClick}
        >
          Hello, world!
      </h1>
      {/* <div>
        <WellFieldVisualization mapData={mapData} wellData={wellData} />
      </div> */}
      <div className='flex h-screen w-screen justify-center flex-wrap'>
        {/* <WellPlot2D />
        <WellFieldVisualization mapData={mapData} wellData={wellData}/> */}
        {/* <TestPlot /> */}
        {/* <TestPlotAnim /> */}
        <TestPlotChart />
      </div>
    </>
  )
}

export default HelloWorld