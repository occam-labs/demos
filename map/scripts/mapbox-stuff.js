var lastHoveredFeature;
var legendClicked = false;



var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v9"
});


var mapDetailed = new mapboxgl.Map({
  container: "mapBoxDetailed",
  style: "mapbox://styles/mapbox/dark-v9"
});

mapDetailed.addControl(new MapboxGeocoder({
  accessToken: mapboxgl.accessToken
}));

// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

d3.json("data/nestSeekersOffices.json").then(data => {
  // make a marker for each feature and add to the map

  data.forEach(d => {
    // create a HTML element for each feature
    var el = document.createElement("div");
    el.className = "marker";

    // create a HTML element for each feature
    var newel = document.createElement("div");
    newel.className = "marker";

    new mapboxgl.Marker(el).setLngLat([d.lng, d.lat]).addTo(map);

    new mapboxgl.Marker(newel).setLngLat([d.lng, d.lat]).addTo(mapDetailed);
  });
});

mapDetailed.on("mouseenter", "listings", function (e) {
  //console.log(e);

  // Change the cursor style as a UI indicator.
  mapDetailed.getCanvas().style.cursor = "pointer";

  var coordinates = e.features[0].geometry.coordinates.slice();
  var description = e.features[0].properties.description;

  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  // Populate the popup and set its coordinates
  // based on the feature found.

  var feature = e.features[0];
  lastHoveredFeature = feature;
  var html = `
        <div style="width:300px;">
        <div>${feature.properties.headline}</div>   
         <div class="img-container">
             <img style="max-width:100%;" src="${feature.properties.pic}">
         </div>
        <h1 style="text-align:center">$ ${numberFormat(
      feature.properties.price
    )} <h1>
        <div>
        `;

  popup
    .setLngLat(coordinates)
    .setHTML(html)
    .addTo(mapDetailed);
});

mapDetailed.on("mouseleave", "listings", function (e) {
  //console.log(e);
  map.getCanvas().style.cursor = "";
  popup.remove();
  lastHoveredFeature = null;
});

mapDetailed.on('load', function () {
  // Insert the layer beneath any symbol layer.
  var layers = mapDetailed.getStyle().layers;

  var labelLayerId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
      labelLayerId = layers[i].id;
      break;
    }
  }

  mapDetailed.addLayer({
    'id': '3d-buildings',
    'source': 'composite',
    'source-layer': 'building',
    'filter': ['==', 'extrude', 'true'],
    'type': 'fill-extrusion',
    'minzoom': 15,
    'paint': {
      'fill-extrusion-color': '#aaa',

      // use an 'interpolate' expression to add a smooth transition effect to the
      // buildings as the user zooms in
      'fill-extrusion-height': [
        "interpolate", ["linear"], ["zoom"],
        15, 0,
        15.05, ["get", "height"]
      ],
      'fill-extrusion-base': [
        "interpolate", ["linear"], ["zoom"],
        15, 0,
        15.05, ["get", "min_height"]
      ],
      'fill-extrusion-opacity': .6
    }
  }, labelLayerId);
});

mapDetailed.on("click", "listings", function (e) {
  if (lastHoveredFeature != null) {
    var win = window.open(lastHoveredFeature.properties.url, "_blank");
    win.focus();
  }
});

d3.selectAll(".legend-item-detailed-button")
  // .on('mouseenter', function (d) {
  //     var type = d3.select(this).attr('data-type');
  //     if (type == 'sale') {
  //         mapDetailed.setFilter('listings', ['==', 'sr', 'S']);
  //     }

  //     if (type == 'rent') {
  //         mapDetailed.setFilter('listings', ['==', 'sr', 'R']);
  //     }

  //     if (type == 'nest') {
  //         mapDetailed.setFilter('listings', ['==', 'sr', 'NA']);
  //     }
  // })
  // .on('mouseleave', function (d) {
  //     var type = d3.select(this).attr('data-type');
  //     if (!legendClicked) {
  //         mapDetailed.setFilter('listings', ['all']);
  //     }
  // })
  .on("click", function (d) {
    d3.selectAll(".legend-item-detailed-button").style("color", "white");
    d3.select(this).style("color", "gray");
    var type = d3.select(this).attr("data-type");
    if (type == "sale") {
      isSalesFiltered = !isSalesFiltered;
    }

    if (type == "rent") {
      isRentFiltered = !isRentFiltered;
    }

    if (type == "nest") {
      isNestOfficeFiltered = !isNestOfficeFiltered;
    }
    updateMap();
  });

updateStyle = function () {
  d3.selectAll(".legend-item-detailed-button").style("color", function (d) {
    var type = d3.select(this).attr("data-type");

    if (type == "sale") {
      if (isSalesFiltered) return "gray";
    }

    if (type == "rent") {
      if (isRentFiltered) return "gray";
    }

    if (type == "nest") {
      if (isNestOfficeFiltered) return "gray";
    }
    return "white";
  });
};

var salesRange;
var rentRange;
var isSalesFiltered = false;
var isRentFiltered = false;
var isNestOfficeFiltered = false;
var updateMap;
var updateStyle;
var global_RightPanelData;
var global_isMapboxDetailed3D = false;


function easing(t) {
  return t * (2 - t);
}



function mapboxDetailed3DView() {

  global_isMapboxDetailed3D = !global_isMapboxDetailed3D;

  if (global_isMapboxDetailed3D) {
    mapDetailed.easeTo({
      bearing: mapDetailed.getBearing() + 25,
      easing: easing,
      pitch: 60,
    });
  } else {
    mapDetailed.easeTo({
      bearing: mapDetailed.getBearing() + 25,
      easing: easing,
      pitch: 0,
    });
  }



}

function back() {
  d3.selectAll('.detailed-level-map-back-button').style('display', 'none')
  d3.selectAll('.detailed-level-map-3d-view').style('display', 'none')
  d3.selectAll('.mapbox-detailed-wrapper').style('height', '0%')
  d3.selectAll(".svgMaps").style("display", "block");
  d3.selectAll(".back").style("display", "none");
  d3.selectAll(".legends-detailed").style("display", "none");
  d3.selectAll("#mapBoxDetailed").style("visibility", "hidden");
  mapDetailed.removeLayer("listings");
  mapDetailed.removeSource("listings");
}

function pointMouseClicked(d, params) {
  var cityName = d.key;
  var listings = params.attrs.cityNestedDetailedData.filter(
    d => d.key == cityName
  )[0];
  var listingsCount = listings ? listings.values.length : "No";
  if (listingsCount == "No" || !listings.values.length) {
    return;
  }

  d3.selectAll('.detailed-level-map-3d-view').style('display', 'initial')
  if (window.innerWidth <= 1400) {
    d3.selectAll('.detailed-level-map-back-button').style('display', 'initial')


  }

  d3.selectAll('.mapbox-detailed-wrapper').style('height', '100%')
  d3.selectAll(".legends-detailed").style("display", "initial");
  d3.selectAll(".svgMaps").style("display", "none");
  d3.selectAll(".back").style("display", "initial");
  d3.selectAll("#mapBoxDetailed").style("visibility", "visible");
  //console.log("point mouse clicked", d);

  var salesData = listings.values.filter(d => d.sr == "S");
  var min = d3.min(salesData, d => +d.price);
  var max = d3.max(salesData, d => +d.price);
  min -= 1; // Fix no ui slider restriction
  max += 1;
  salesRange = [min, max];



  saleSlider.destroy();
  saleSlider = noUiSlider.create(
    document.getElementById("slider-tooltips-sale"),
    {
      start: [min, max],
      tooltips: [true, true],
      format: {
        to: function (value) {
          return tooltipNumberFormat(Math.round(value)) + " $";
        },
        from: function (value) {
          return value.replace(",-", "");
        }
      },
      range: {
        "min": min,
        "max": max
      }
    }
  );

  var rentData = listings.values.filter(d => d.sr == "R");
  min = d3.min(rentData, d => +d.price);
  max = d3.max(rentData, d => +d.price);
  min -= 1; // Fix no ui slider restriction
  max += 1;
  rentRange = [min, max];

  rentSlider.destroy();
  rentSlider = noUiSlider.create(
    document.getElementById("slider-tooltips-rent"),
    {
      start: [min, max],
      tooltips: [true, true],
      format: {
        to: function (value) {
          return tooltipNumberFormat(Math.round(value)) + " $";
        },
        from: function (value) {
          return value.replace(",-", "");
        }
      },
      range: {
        "min": min,
        "max": max
      }
    }
  );

  // Draw Mapbox Circles
  var data = toFeatureCollection(listings);

  mapDetailed.addSource("listings", {
    type: "geojson",
    "data": data
  });

  mapDetailed.jumpTo({
    center: params.loc, // starting position [lng, lat]
    zoom: 10 // starting zoom
  });

  // add the map layer
  mapDetailed.addLayer({
    id: "listings",
    type: "circle",
    source: "listings",
    "layout": {},
    "paint": {
      "circle-color": {
        property: "sr",
        type: "categorical",
        stops: [["S", "#FE8B00"], ["R", "#C469A3"]]
      },
      "circle-opacity": 0.5,
      "circle-radius": 8
    }
  });

  rentSlider.on("update", (d, i, arr) => {
    rentRange = arr;
  });
  saleSlider.on("update", (d, i, arr) => {
    salesRange = arr;
  });

  rentSlider.on("end", (d, i, arr) => {
    updateMap();
  });
  saleSlider.on("end", (d, i, arr) => {
    updateMap();
  });

  updateMap = function () {
    mapDetailed.removeLayer("listings");
    mapDetailed.removeSource("listings");

    // Draw Mapbox Circles
    var data = toFeatureCollection({
      values: listings.values.filter((d, i) => {
        var filtered = true;
        if (d.sr == "R") {
          filtered =
            filtered && d.price > rentRange[0] && d.price < rentRange[1];
        }

        if (d.sr == "S") {
          filtered =
            filtered && d.price > salesRange[0] && d.price < salesRange[1];
        }

        if (isRentFiltered) {
          filtered = filtered && d.sr == "R";
        }
        if (isSalesFiltered) {
          filtered = filtered && d.sr == "S";
        }
        if (isNestOfficeFiltered) {
          filtered = false;
        }

        return filtered;
      })
    });

    mapDetailed.addSource("listings", {
      type: "geojson",
      "data": data
    });

    mapDetailed.jumpTo({
      center: params.loc, // starting position [lng, lat]
      zoom: 10 // starting zoom
    });

    // add the map layer
    mapDetailed.addLayer({
      id: "listings",
      type: "circle",
      source: "listings",
      "layout": {},
      "paint": {
        "circle-color": {
          property: "sr",
          type: "categorical",
          stops: [["S", "#FE8B00"], ["R", "#C469A3"]]
        },
        "circle-opacity": 0.5,
        "circle-radius": 8
      }
    });

    updateStyle();

    window.scrollTo(0, 0);
  };

  //Bounds
  var leftRight = d3.extent(data.features, v => {
    return v.geometry.coordinates[0];
  });

  var topBottom = d3.extent(data.features, v => {
    return v.geometry.coordinates[1];
  });
}
