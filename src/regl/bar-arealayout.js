function barsLayout(points, width, height, citiesData) {
  var pointWidth = width / 800;
  var pointMargin = 1;
  
  var byContinent = d3.nest()
      .key(function (d) { return d.continent; })
      .entries(citiesData)
      .filter(function (d) { return d.values.length > 10; });
  
  var binMargin = pointWidth * 10;
  var numBins = byContinent.length;
  var minBinWidth = width / (numBins * 2.5);
  var totalExtraWidth = width - binMargin * (numBins - 1) - minBinWidth * numBins;
  
  var binWidths = byContinent.map(function (d) {
      return Math.ceil(d.values.length / citiesData.length * totalExtraWidth) + minBinWidth;
  });
  
  console.log(binWidths);
  
  var increment = pointWidth + pointMargin;
  var cumulativeBinWidth = 0;
  
  var binsArray = binWidths.map(function (binWidth, i) {
      var bin = {
          continent: byContinent[i].key,
          binWidth: binWidth,
          binStart: cumulativeBinWidth + i * binMargin,
          binCount: 0,
          binCols: Math.floor(binWidth / increment)
      };
      cumulativeBinWidth += binWidth - 1;
      return bin;
  });
  
  var bins = d3.nest()
      .key(function (d) { return d.continent; })
      .rollup(function (d) { return d[0]; })
      .object(binsArray);
  
  console.log("got bins", bins);
  
  colorDataByContinent(points, citiesData);
  
  var arrangement = points.map(function (d, i) {
      var continent = citiesData[i].continent;
      var bin = bins[continent];
      if (!bin) {
          return { x: d.x, y: d.y, color: [0, 0, 0] };
      }
      
      var binWidth = bin.binWidth;
      var binCount = bin.binCount;
      var binStart = bin.binStart;
      var binCols = bin.binCols;
      
      var row = Math.floor(binCount / binCols);
      var col = binCount % binCols;
      
      var x = binStart + col * increment;
      var y = -row * increment + height;
      
      bin.binCount += 1;
      return { x: x, y: y, color: d.color };
  });
  
  arrangement.forEach(function (d, i) {
      Object.assign(points[i], d);
  });
  
  console.log("points[0]=", points[0]);
}

function areaLayout(points, width, height, citiesData) {
  colorDataByContinent(points, citiesData);
  
  var rng = d3.randomNormal(0, 0.2);
  var pointWidth = Math.round(width / 800);
  var pointMargin = 1;
  var pointHeight = pointWidth * 0.375;
  
  var latExtent = d3.extent(citiesData, function (d) { return d.lat; });
  var xScale = d3.scaleQuantize()
      .domain(latExtent)
      .range(d3.range(0, width, pointWidth + pointMargin));
  
  var binCounts = xScale.range().reduce(function (accum, binNum) {
      accum[binNum] = 0;
      return accum;
  }, {});
  
  var byContinent = d3.nest()
      .key(function (d) { return d.continent; })
      .entries(citiesData);
  
  citiesData.forEach(function (city, i) {
      city.d = points[i];
  });
  
  byContinent.forEach(function (continent, i) {
      continent.values.forEach(function (city, j) {
          var d = city.d;
          var binNum = xScale(city.lat);
          
          d.x = binNum;
          d.y = height - pointHeight * binCounts[binNum];
          binCounts[binNum] += 1;
      });
  });
}
