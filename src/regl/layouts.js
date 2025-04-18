function toVectorColor(colorStr) {
  var rgb = d3.rgb(colorStr);
  return [rgb.r / 255, rgb.g / 255, rgb.b / 255];
}
function expandImageData(compressed, width, height) {
  var imgAspect = compressed.width / compressed.height;
  var scaledWidth = width;
  var scaledHeight = width / imgAspect;
  var yTranslate = (height - scaledHeight) / 2;
  var xScale = d3
    .scaleLinear()
    .domain([0, compressed.width])
    .range([0, scaledWidth]);
  var yScale = d3
    .scaleLinear()
    .domain([0, compressed.height])
    .range([yTranslate, scaledHeight + yTranslate]);
  var hue = 205;
  var saturation = 0.74;
  var points = compressed.points.map(function (d, i) {
    return {
      x: xScale(Math.round(i % compressed.width)),
      y: yScale(Math.floor(i / compressed.width)),
      color: toVectorColor(d3.hsl(hue, saturation, d).toString()),
    };
  });
  return points;
}
function sortImageData(imgData, width, height) {
  var xMid = width / 2;
  var yMid = height / 2;
  var distToMiddle = function (d) {
    return Math.pow(d.x - xMid, 2) + Math.pow(d.y - yMid, 2);
  };
  imgData.sort(function (a, b) {
    return distToMiddle(a) - distToMiddle(b);
  });
  return imgData;
}
function processImageData(compressed, width, height) {
  var expanded = expandImageData(compressed, width, height);
  return sortImageData(expanded, width, height);
}
function loadData(width, height) {
  return new Promise(function (resolve, reject) {
    var citiesCsv = function () {
      var args = [],
        len = arguments.length;
      while (len--) args[len] = arguments[len];
      return d3.csv(
        args[0],
        function (d) {
          return {continent: d.continent, lat: +d.lat, lng: +d.lng};
        },
        args[1]
      );
    };
    d3.queue()
      .defer(citiesCsv, "sampled_cities_data.csv")
      .defer(d3.json, "img.json")
      .await(function (err, citiesData, imgData) {
        if (err) {
          console.error("Something went wrong loading data", err);
          reject(err);
          return;
        }
        resolve({
          citiesData: citiesData,
          imgData: processImageData(imgData, width, height),
        });
      });
  });
}
function colorDataByContinent(data, citiesData) {
  var colorScale = d3
    .scaleOrdinal()
    .domain(["NA", "SA", "EU", "AS", "AF", "OC", "AN"])
    .range(
      d3
        .range(0, 1, 1 / 6)
        .concat(1)
        .map(d3.scaleSequential(d3.interpolateCool))
    );
  var varyLightness = function (color) {
    var hsl = d3.hsl(color);
    hsl.l *= 0.1 + Math.random();
    return hsl.toString();
  };
  data.forEach(function (d, i) {
    d.color = toVectorColor(varyLightness(colorScale(citiesData[i].continent)));
  });
}
function citiesLayout(points, width, height, citiesData) {
  function projectData(data) {
    var latExtent = d3.extent(citiesData, function (d) {
      return d.lat;
    });
    var lngExtent = d3.extent(citiesData, function (d) {
      return d.lng;
    });
    var extentGeoJson = {
      type: "LineString",
      coordinates: [
        [lngExtent[0], latExtent[0]],
        [lngExtent[1], latExtent[1]],
      ],
    };
    var projection = d3.geoMercator().fitSize([width, height], extentGeoJson);
    data.forEach(function (d, i) {
      var city = citiesData[i];
      var location = projection([city.lng, city.lat]);
      d.x = location[0];
      d.y = location[1];
    });
  }
  projectData(points);
  colorDataByContinent(points, citiesData);
}
function photoLayout(points, width, height, imgData) {
  points.forEach(function (d, i) {
    Object.assign(d, imgData[i]);
  });
}
function barsLayout(points, width, height, citiesData) {
  var pointWidth = width / 800;
  var pointMargin = 1;
  var byContinent = d3
    .nest()
    .key(function (d) {
      return d.continent;
    })
    .entries(citiesData)
    .filter(function (d) {
      return d.values.length > 10;
    });
  var binMargin = pointWidth * 10;
  var numBins = byContinent.length;
  var minBinWidth = width / (numBins * 2.5);
  var totalExtraWidth =
    width - binMargin * (numBins - 1) - minBinWidth * numBins;
  var binWidths = byContinent.map(function (d) {
    return (
      Math.ceil((d.values.length / citiesData.length) * totalExtraWidth) +
      minBinWidth
    );
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
      binCols: Math.floor(binWidth / increment),
    };
    cumulativeBinWidth += binWidth - 1;
    return bin;
  });
  var bins = d3
    .nest()
    .key(function (d) {
      return d.continent;
    })
    .rollup(function (d) {
      return d[0];
    })
    .object(binsArray);
  console.log("got bins", bins);
  colorDataByContinent(points, citiesData);
  var arrangement = points.map(function (d, i) {
    var continent = citiesData[i].continent;
    var bin = bins[continent];
    if (!bin) {
      return {x: d.x, y: d.y, color: [0, 0, 0]};
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
    return {x: x, y: y, color: d.color};
  });
  arrangement.forEach(function (d, i) {
    Object.assign(points[i], d);
  });
  console.log("points[0]=", points[0]);
}
function swarmLayout(points, width, height, citiesData) {
  citiesLayout(points, width, height, citiesData);
  var rng = d3.randomNormal(0, 0.3);
  points.forEach(function (d, i) {
    d.y = 0.75 * rng() * height + height / 2;
  });
}
function areaLayout(points, width, height, citiesData) {
  colorDataByContinent(points, citiesData);
  var rng = d3.randomNormal(0, 0.2);
  var pointWidth = Math.round(width / 800);
  var pointMargin = 1;
  var pointHeight = pointWidth * 0.375;
  var latExtent = d3.extent(citiesData, function (d) {
    return d.lat;
  });
  var xScale = d3
    .scaleQuantize()
    .domain(latExtent)
    .range(d3.range(0, width, pointWidth + pointMargin));
  var binCounts = xScale.range().reduce(function (accum, binNum) {
    accum[binNum] = 0;
    return accum;
  }, {});
  var byContinent = d3
    .nest()
    .key(function (d) {
      return d.continent;
    })
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
function phyllotaxisLayout(points, pointWidth, xOffset, yOffset, citiesData) {
  if (xOffset === void 0) xOffset = 0;
  if (yOffset === void 0) yOffset = 0;
  colorDataByContinent(points, citiesData);
  var sortData = citiesData
    .map(function (city, index) {
      return {index: index, continent: city.continent};
    })
    .sort(function (a, b) {
      return a.continent.localeCompare(b.continent);
    });
  var theta = Math.PI * (3 - Math.sqrt(5));
  var pointRadius = pointWidth / 2;
  sortData.forEach(function (d, i) {
    var point = points[d.index];
    var index = i % points.length;
    var phylloX = pointRadius * Math.sqrt(index) * Math.cos(index * theta);
    var phylloY = pointRadius * Math.sqrt(index) * Math.sin(index * theta);
    point.x = xOffset + phylloX - pointRadius;
    point.y = yOffset + phylloY - pointRadius;
  });
  return points;
}
