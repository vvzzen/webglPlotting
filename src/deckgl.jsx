// import React, { useRef, useEffect, useState } from 'react';
// import Map from 'react-map-gl';
// import DeckGL from 'deck.gl';
// import { GeoJsonLayer, ContourLayer, ScatterplotLayer } from 'deck.gl';

// const WellFieldVisualizationDeckGL = ({ wellData, contourData, mapData }) => {
//   const [viewport, setViewport] = useState({
//     latitude: 9902000,  // Center coordinates from your map
//     longitude: 529000,
//     zoom: 13,
//     bearing: 0,
//     pitch: 0
//   });
  
//   // Layers for your visualization
//   const layers = [
//     // Base contour layer
//     new ContourLayer({
//       id: 'contour-layer',
//       data: contourData,
//       getPosition: d => [d.longitude, d.latitude],
//       getWeight: d => d.depth,
//       contours: [
//         { threshold: -4000, color: [70, 70, 190] },
//         { threshold: -3800, color: [70, 100, 220] },
//         // ... all your contour thresholds with colors
//         { threshold: -2800, color: [150, 30, 30] }
//       ],
//       strokeWidth: 1
//     }),
    
//     // Well locations as points
//     new ScatterplotLayer({
//       id: 'wells',
//       data: wellData,
//       getPosition: d => [d.longitude, d.latitude],
//       getFillColor: d => d.isActive ? [0, 255, 0] : [100, 100, 100],
//       getRadius: 10,
//       pickable: true,
//       onHover: ({object}) => console.log('Hovered well:', object),
//       onClick: ({object}) => console.log('Clicked well:', object)
//     }),
    
//     // Well grouping circles
//     new GeoJsonLayer({
//       id: 'well-groups',
//       data: wellGroupsData, // Your GeoJSON with circles around well groups
//       filled: false,
//       stroked: true,
//       getLineColor: d => [255, 80, 80],
//       getLineWidth: 2,
//       lineWidthUnits: 'pixels'
//     })
//   ];
  
//   return (
//     <DeckGL
//       layers={layers}
//       initialViewState={viewport}
//       controller={true}
//       onViewStateChange={({viewState}) => setViewport(viewState)}
//     >
//       <Map
//         mapStyle="mapbox://styles/mapbox/light-v10"
//         mapboxApiAccessToken={MAPBOX_TOKEN}
//       />
//     </DeckGL>
//   );
// }

// export default WellFieldVisualizationDeckGL