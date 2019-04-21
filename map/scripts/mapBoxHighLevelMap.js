
const highLevelMapboxConfig = {
    zoom: 1.4,
    container: "mapBoxHighLevelMap",
    style: "mapbox://styles/mapbox/dark-v9",
    maxBounds: [[-150.04728500751165, -50], // Southwest coordinates
    [160.91058699000139, 70]]
}


if (window.innerWidth < 620) {
    highLevelMapboxConfig.zoom = 0.1;
    highLevelMapboxConfig.maxBounds = null;
}



const mapBoxHighLevelMap = new mapboxgl.Map(highLevelMapboxConfig);

if (window.innerWidth >= 1400) {
    mapBoxHighLevelMap.scrollZoom.disable();
}





// URL GOES HERE
var highLevelDataPromise = d3.json("data/highLevelData.json");
var locationsPromise = d3.json("data/locations.json");

var worldCountriesPromise = d3.json("data/countries-land-2km5.json");
// worldCountriesPromise = d3.json('data/world_countries.json')

var heatMapDataPromise = d3.csv("data/heatmapData.csv"); //d3.json('data/heat_map_data.json');
var nestseekersDataPromise = d3.json("data/nestSeekersOffices.json");

var regionByCountyDataPromise = d3.json("data/regionByCountryID.json");
var continentsGeojson = d3.json('data/continents.json');

var promises = [
    highLevelDataPromise,
    locationsPromise,
    worldCountriesPromise,
    heatMapDataPromise,
    nestseekersDataPromise,
    regionByCountyDataPromise,
    continentsGeojson
];

Promise.all(promises).then(receivedData => {
    d3.selectAll(".overlay").remove();

    var regions = getContinentsByCountry();

    var data = {
        highLevelData: receivedData[0],
        locations: receivedData[1],
        geojson: receivedData[2],
        heatmapData: receivedData[3],
        nestSeekers: receivedData[4],
        regionByCountryObj: receivedData[5],
        continents: receivedData[6]
    };

    var locationsObj = {};
    data.locations.forEach(location => {
        var locObj = {
            latitude: location.Latitude,
            longitude: location.Longitude
        };

        var locArray = [locObj.longitude, locObj.latitude];
        locationsObj[location["Parent City"]] = locArray;
    });

    var attrs = {
        defaultTextFill: "#B1B2AE",
        defaultFont: "Helvetica",
        pointRadiusRange: [8, 20],
        mapPathFill: "#191919",
        locationsObj: locationsObj,
        allowZooming: true,
        regionByCountryObj: data.regionByCountryObj,
        config: [
            {
                selector: ".northAmerica",
                region: "Northern America",
                center: [25, 45],
                scale: 200
            },
            {
                region: "Europe",
                selector: ".europa",
                center: [7, 50],
                scale: 800
            },
            {
                region: "Asia",
                selector: ".asia",
                center: [107, 50],
                scale: 270
            },
            {
                region: "South America",
                selector: ".southAmerica",
                center: [-70, 10]
            },
            {
                region: "Africa",
                selector: ".africa",
                center: [17, 17],
                scale: 240
            },
            {
                region: "Oceania",
                selector: ".australia",
                center: [127, -15],
                scale: 340
            }
        ],
        regionConfigs: {
            "North America": {
                selector: ".northAmerica",
                region: "North America",
                color: "#666666",
                center: [25, 45],
                scale: 200,
                zoomFeature: { "type": "FeatureCollection", "features": [{ "type": "Feature", "properties": {}, "geometry": { "type": "LineString", "coordinates": [[-136.58203125, 58.35563036280964], [-75.234375, 52.3755991766591], [-80.85937499999999, 16.29905101458183], [-110.0390625, 17.811456088564483]] } }] },

            },
            Europe: {
                region: "Europe",
                selector: ".europa",
                color: "#666666",
                center: [7, 50],
                scale: 800,
                zoomFeature: { "type": "FeatureCollection", "features": [{ "type": "Feature", "properties": {}, "geometry": { "type": "LineString", "coordinates": [[-11.513671874999998, 59.977005492196], [31.81640625, 61.05828537037916], [36.03515625, 46.07323062540835], [-9.228515625, 34.379712580462204]] } }] }
            },
            Asia: {
                region: "Asia",
                selector: ".asia",
                color: "#666666",
                center: [107, 50],
                scale: 270,
                zoomFeature: { "type": "FeatureCollection", "features": [{ "type": "Feature", "properties": {}, "geometry": { "type": "LineString", "coordinates": [[53.96484375, 42.8115217450979], [45.3515625, 20.138470312451155], [76.9921875, 7.18810087117902], [107.9296875, -1.5818302639606454], [124.27734374999999, -0.17578097424708533], [146.25, 50.17689812200107]] } }] }
            },
            "South America": {
                region: "South America",
                color: "#666666",
                selector: ".southAmerica",
                center: [-70, 10],
                zoomFeature: { "type": "FeatureCollection", "features": [{ "type": "Feature", "properties": {}, "geometry": { "type": "LineString", "coordinates": [[-72.7734375, 12.211180191503997], [-33.046875, 2.4601811810210052], [-47.109375, -44.840290651397986], [-72.7734375, -49.15296965617039]] } }] }
            },
            Africa: {
                region: "Africa",
                selector: ".africa",
                color: "#666666",
                center: [17, 17],
                scale: 240,
                zoomFeature: { "type": "FeatureCollection", "features": [{ "type": "Feature", "properties": {}, "geometry": { "type": "LineString", "coordinates": [[-19.16015625, 39.90973623453719], [47.28515625, 32.84267363195431], [34.98046875, -32.54681317351514], [3.33984375, -31.95216223802496]] } }] }
            },
            Oceania: {
                region: "Oceania",
                selector: ".australia",
                color: "#666666",
                center: [127, -15],
                scale: 340,
                zoomFeature: { "type": "FeatureCollection", "features": [{ "type": "Feature", "properties": {}, "geometry": { "type": "LineString", "coordinates": [[98.7890625, -2.460181181020993], [152.9296875, 8.233237111274565], [164.1796875, -43.32517767999294], [123.3984375, -44.840290651397986]] } }] }
            }
        },
        data: Object.assign({}, data, { points: data.highLevelData })
    };


    // ####################  Regions ##############
    mapBoxHighLevelMap.addSource('continents', {
        "data": attrs.data.continents,
        type: 'geojson',
    })

    mapBoxHighLevelMap.addLayer({
        id: 'continent-fills',
        type: 'fill',
        source: 'continents',

        layout: {},
        paint: {
            'fill-color': '#666666',
            'fill-opacity': ["case",
                ["boolean", ["feature-state", "hover"], false],
                1,
                0
            ]
        }
    })




    //
    //  if (window.innerWidth >= 768)
    setRightPanel(data);
    var points = receivedData[0];

    attrs.cityGrouped = d3
        .nest()
        .key(d => d["ParentCity"])
        .entries(attrs.data.points);

    attrs.cityNestedDetailedData = d3
        .nest()
        .key(d => d.city)
        .entries(attrs.data.heatmapData);

    attrs.maxGrowth = d3.max(attrs.cityGrouped, d => {
        return d3.sum(d.values, v => Number(v.Growth.split("%")[0]));
    });

    attrs.regionNestedHighLevelData = d3
        .nest()
        .key(d => attrs.regionByCountryObj[d.Country])
        .entries(attrs.data.points);

    attrs.minNumber = d3.min(attrs.cityGrouped, d => {
        return d3.sum(d.values, v => +v.Numbers);
    });

    attrs.maxNumber = d3.max(attrs.cityGrouped, d => {
        return d3.sum(d.values, v => +v.Numbers);
    });

    /*##################################   SCALES  ####################################### */

    var scales = {};

    scales.point = d3
        .scaleLinear()
        .domain([attrs.minNumber, attrs.maxNumber])
        .range(attrs.pointRadiusRange);

    scales.growth = d3.scaleLinear().domain([0, attrs.maxGrowth]);

    var pointColor = d3.interpolateRgbBasis(["#EDCB1D", "#CA7508"]);

    scales.pointColor = function (str) {
        var splitted = str.split("%");
        var n = Number(splitted[0]);
        if (isNaN(n)) {
            n = 0;
        }
        return pointColor(scales.growth(n));
    };


    const geojsonData = {
        "type": "FeatureCollection",
        "features": attrs.cityGrouped.map(d => {
            var sum = d3.sum(d.values, d => +d.Numbers);
            console.log(sum, scales.point(sum))
            return {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": attrs.locationsObj[d.key].map(d => +d)
                },
                "properties": Object.assign(
                    {},
                    d,
                    {
                        originalObject: d,
                        radius: Math.round(scales.point(sum)),
                        color: scales.pointColor(d.values[0].Growth)
                    }
                ),
            }
        })
    }

    mapBoxHighLevelMap.addSource("highLevelPoints", {
        type: "geojson",
        "data": geojsonData
    });

    // add the points layer
    mapBoxHighLevelMap.addLayer({
        id: "highLevelPoints",
        type: "circle",
        source: "highLevelPoints",
        "layout": {
            // "text-field": "{key}",
        },
        "paint": {
            "circle-color": ['get', 'color'],
            "circle-opacity": 0.6,
            "circle-radius": ['get', 'radius']
        }
    });


    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    mapBoxHighLevelMap.on('mouseenter', 'highLevelPoints', function (e) {
        onRegionMouseLeaved();
        // Change the cursor style as a UI indicator.
        mapBoxHighLevelMap.getCanvas().style.cursor = 'pointer';

        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        pointMouseEntered(JSON.parse(e.features[0].properties.originalObject), { attrs: attrs, loc: coordinates, mouseCoords: [e.originalEvent.screenX, e.originalEvent.screenY] });
    });

    mapBoxHighLevelMap.on('mouseleave', 'highLevelPoints', function () {
        mapBoxHighLevelMap.getCanvas().style.cursor = '';
        pointMouseLeaved();
    });

    mapBoxHighLevelMap.on('click', 'highLevelPoints', function (e) {

        var coordinates = e.features[0].geometry.coordinates.slice();
        pointMouseClicked(JSON.parse(e.features[0].properties.originalObject), { attrs: attrs, loc: coordinates, mouseCoords: [e.originalEvent.screenX, e.originalEvent.screenY] });

    });


    // ---------- REGION INTERACTIONS  ------------



    mapBoxHighLevelMap.on("mousemove", "continent-fills", function (e) {
        if (globals.regionZoomed) {
            return false;
        }
        if (e.features.length > 0) {
            if (globals.highLevelHoveredContinentId) {
                mapBoxHighLevelMap.setFeatureState({ source: 'continents', id: globals.highLevelHoveredContinentId }, { hover: false });
            }
            globals.highLevelHoveredContinentId = e.features[0].id;
            mapBoxHighLevelMap.setFeatureState({ source: 'continents', id: globals.highLevelHoveredContinentId }, { hover: true });

            regionMouseEntered({ attrs: attrs, region: e.features[0].properties.CONTINENT, mouseCoords: [e.originalEvent.screenX, e.originalEvent.screenY] });
        }
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    mapBoxHighLevelMap.on("mouseleave", "continent-fills", function () {

        if (globals.highLevelHoveredContinentId) {
            mapBoxHighLevelMap.setFeatureState({ source: 'continents', id: globals.highLevelHoveredContinentId }, { hover: false });
        }
        globals.highLevelHoveredContinentId = null;
        onRegionMouseLeaved();
    });

    mapBoxHighLevelMap.on('click', "continent-fills", function (e) {
        globals.regionZoomed = true;
        d3.select('.high-level-zoom-button').style('display', 'initial')
        if (e.features.length > 0) {
            const feature = e.features[0];
            const hoveredRegion = attrs.regionConfigs[feature.properties.CONTINENT]
            var coordinates = hoveredRegion.zoomFeature.features[0].geometry.coordinates;

            var bounds = coordinates.reduce(function (bounds, coord) {
                return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

            mapBoxHighLevelMap.fitBounds(bounds);
        }

    })

    // chart.onPointMouseEnter(pointMouseEntered);
    // chart.onPointMouseLeave(pointMouseLeaved);
    // chart.onPointClick(pointMouseClicked);
    // chart.onRegionMouseEnter(regionMouseEntered);
    // chart.onRegionMouseLeave(onRegionMouseLeaved);

});



function zoomOutHighLevelMap() {
    d3.select('.high-level-zoom-button').style('display', 'none')
    globals.regionZoomed = false;
    mapBoxHighLevelMap.fitBounds([[
        -138,
        -50
    ], [
        159,
        66
    ]]);
}