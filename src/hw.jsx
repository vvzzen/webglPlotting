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

const HelloWorld = () => {
  const [toggle, setToggle] = useState(false);
  function handleClick() {
    setToggle(!toggle)
  };
  
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
        {/* <WellPlot2D /> */}
        {/* <Plot2D /> */}
        {/* <WellFieldVisualization /> */}
        <TestPlot />
        <TestPlotAnim />
      </div>
    </>
  )
}

export default HelloWorld