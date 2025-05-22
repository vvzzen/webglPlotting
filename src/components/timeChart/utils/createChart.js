import { useEffect } from 'react';
import { min, max } from 'd3-array';
import TimeChart from 'timechart';
// import { TimeChartZoomPlugin } from 'timechart/dist/types/chartZoom';

export const useChart = (ref) => {
  useEffect(() => {
    if (!ref.current) return;
    const data = Array.from({ length: 100 }, (_, x) => ({ x, y: Math.random() }));
    const datas = [{x: 0, y: 12}, {x: 3, y: 23}, {x: 10}]
    const invertedData = data.map(({ x, y }) => ({ x: y, y: x }));
    // const slicedData = data.slice(0, 47);

    // console.log(data);
    // console.log(invertedData);
    // console.log(data[0], data[1]);
    // console.log(data.slice(0, 47));
    const chart = new TimeChart(ref.current, {
      series: [{ name: 'test', data: data }],
      xRange: { min: 0, max: 200 },
      zoom: {
        x: {
            autoRange: true,
            minDomainExtent: 50,
        },
        y: {
            autoRange: true,
            minDomainExtent: 50,
        }
    },
      // plugins: [new TimeChartZoomPlugin()],
    });

    return () => chart.dispose(); // Clean up when unmounting
  }, [ref]);
};
