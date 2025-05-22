import { useRef } from 'react'
import { useChart } from './utils'

const TestPlot = () => {
  const chartRef = useRef(null);
  useChart(chartRef);

  return (
    <div id="chart" ref={chartRef} className="w-full h-full" style={{height: "640px"}}>TestPlot</div>
  )
}

export default TestPlot