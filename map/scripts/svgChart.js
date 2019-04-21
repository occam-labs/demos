function getChart(params) {
  // Exposed variables
  var attrs = {
    id: "ID" + Math.floor(Math.random() * 1000000), // Id for event handlings
    svgWidth: 700,
    svgHeight: 700,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5,
    marginLeft: 5,
    center: [43.5, 44],
    scale: 250,
    container: "body",
    defaultTextFill: "#B1B2AE",
    defaultFont: "Helvetica",
    isDebug: true,
    pointRadiusRange: [8, 20],
    mapPathFill: "#191919",
    locationsObj: null,
    geojson: null,
    firstRun: true,
    config: null,
    allowZooming: true,
    regionZoomed: true,
    active: d3.select(null),
    regionByCountryObj: null,
    onPointMouseEnter: d => d,
    onPointMouseLeave: d => d,
    onPointClick: d => d,
    onRegionMouseEnter: d => d,
    onRegionMouseLeave: d => d,
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
        zoomFeature: { "type": "Feature", "properties": {}, "geometry": { "type": "LineString", "coordinates": [[-11.513671874999998, 59.977005492196], [31.81640625, 61.05828537037916], [36.03515625, 46.07323062540835], [-9.228515625, 34.379712580462204]] } }
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
    data: null
  };

  //InnerFunctions
  var updateData;

  //Main chart object
  var main = function (selection) {
    selection.each(function scope() {
      attrs.currentScale = attrs.currentScale || attrs.scale;
      attrs.currentCenter = attrs.currentCenter || attrs.center;

      if (window.innerWidth < 1400) {
        attrs.allowZooming = true;
        attrs.regionZoomed = false;
      } else {
        attrs.allowZooming = false;
        attrs.regionZoomed = true;
      }

      if (attrs.firstRun) {
        //do expensive data calculations here

        attrs.cityGrouped = d3
          .nest()
          .key(d => d["ParentCity"])
          .entries(attrs.data.points);




        attrs.cityNestedDetailedData = d3
          .nest()
          .key(d => d.city)
          .entries(attrs.data.heatmapData);

        attrs.minNumber = d3.min(attrs.cityGrouped, d => {
          return d3.sum(d.values, v => v.Numbers);
        });

        attrs.maxNumber = d3.max(attrs.cityGrouped, d => {
          return d3.sum(d.values, v => v.Numbers);
        });

        attrs.maxGrowth = d3.max(attrs.cityGrouped, d => {
          return d3.sum(d.values, v => Number(v.Growth.split("%")[0]));
        });

        attrs.regionNestedHighLevelData = d3
          .nest()
          .key(d => attrs.regionByCountryObj[d.Country])
          .entries(attrs.data.points);
      }

      //Drawing containers
      var container = d3.select(this);

      setSvgWidthAndHeight();

      //Calculated properties
      var calc = {};
      calc.id = "ID" + Math.floor(Math.random() * 1000000); // id for event handlings
      calc.chartLeftMargin = attrs.marginLeft;
      calc.chartTopMargin = attrs.marginTop;
      calc.chartWidth =
        attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
      calc.chartHeight =
        attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;

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

      /*##################################   HANDLERS  ####################################### */
      var handlers = {
        zoomed: null
      };

      /*##################################   BEHAVIORS ####################################### */
      var behaviors = {};
      behaviors.zoom = d3
        .zoom()
        .scaleExtent([1, 5])
        .on("zoom", d => handlers.zoomed(d));

      /* ############# PROJECTION ############### */

      var projection = d3
        .geoMercator()
        .scale(attrs.currentScale)
        .center(attrs.currentCenter)
        .translate([calc.chartWidth * 0.56, calc.chartHeight * 0.33]);

      attrs.oldProjection = attrs.newProjection;
      attrs.newProjection = projection;

      if (attrs.firstRun) {
        attrs.oldProjection = projection;
      }

      var path = d3.geoPath().projection(projection);

      //################################ DRAWING ######################

      //Drawing
      var svg = container
        .patternify({ tag: "svg", selector: "svg-chart-container" })
        .attr("width", attrs.svgWidth)
        .attr("height", attrs.svgHeight)
        .style("background-color", "#494949")
        .attr("font-family", attrs.defaultFont)
        .call(behaviors.zoom);



      var chart = svg.patternify({ tag: "g", selector: "chart" });

      const zoomOutGrup = svg.patternify({ tag: 'g', selector: 'zoom-out-group' })
        .attr('transform', `translate(20,20)`)
        .attr('cursor', 'pointer')
        .style('display', 'none')
        .on('click', function (d) {

          if (!attrs.transform) {
            attrs.transform = "translate(" + calc.chartLeftMargin + "," + calc.chartTopMargin + ")"
          };

          chart.transition()
            .duration(750)
            .attr('transform', attrs.transform)
            .on('end', function (d) {
              zoomOutGrup.style('display', 'none')
              //  attrs.regionZoomed = false;
              chart.selectAll(".point").attr("r", d => {
                var sum = d3.sum(d.values, d => d.Numbers);
                return scales.point(sum) / (attrs.transform.k || 1);
              });

              chart.selectAll(".label").attr("transform", v => {
                var d = v.values[0];
                var pos = attrs.locationsObj[d["ParentCity"]];
                if (!pos) {
                  //console.log(d["ParentCity"], "is not defined");
                  return;
                }
                var sum = d3.sum(v.values, d => d.Numbers);
                var r = scales.point(sum);
                var x = projection(pos)[0];
                var y = projection(pos)[1] + (r + 13) / (attrs.transform.k || 1);

                return ` translate(${x},${y})scale(${1 / (attrs.transform.k || 1)}) `;
              });

              arrangeLabels();
            });


        })

      zoomOutGrup.patternify({ tag: 'rect', selector: 'zoom-out-rect' })
        .attr('fill', '#0B030F')
        .attr('width', 87)
        .attr('height', 30)

      zoomOutGrup.patternify({ tag: 'text', selector: 'zoom-out-text' })
        .attr('fill', 'white')
        .text('zoom out')
        .attr('y', 20)
        .attr('x', 10)


      if (attrs.transform) {
        chart.attr("transform", attrs.transform);
      } else {
        chart.attr(
          "transform",
          "translate(" + calc.chartLeftMargin + "," + calc.chartTopMargin + ")"
        );
      }

      var mapPathsWrapper = chart.patternify({
        tag: "g",
        selector: "paths-wrapper"
      });

      var mapPaths = mapPathsWrapper
        .patternify({
          tag: "path",
          selector: "map-path",
          data: attrs.data.geojson.features.filter(
            d => d.properties.A3 != "ATA"
          )
        })
        .attr("fill", d => {
          var region = attrs.regionByCountryObj[d.properties.A3];
          var config = attrs.regionConfigs[region];
          if (!config) {
            //console.log("config not found for", d.properties.A3);
          }
          return config ? config.color : attrs.mapPathFill;
        })
        .attr("fill", attrs.mapPathFill)
        .on("mouseenter.pathMouseEnter", mapPathMouseEnter)
        .on("mouseleave.pathMouseLeave", mapPathMouseLeave)
        .on("mouseenter.regionMouseEnter", d => {
          const region = attrs.regionByCountryObj[d.properties.A3];
          attrs.onRegionMouseEnter({
            attrs: attrs,
            region: region
          });
        })
        .on("mouseleave.regionMouseLeave", d => {
          attrs.onRegionMouseLeave();
        })
        .on("click", mapPathMouseClick);

      mapPaths.attr("d", path);

      //Drawing points
      var mapPointsWrapper = chart.patternify({
        tag: "g",
        selector: "points-wrapper"
      });

      const mapPoints = mapPointsWrapper
        .patternify({ tag: "text", selector: "label", data: attrs.cityGrouped })
        .attr("font-size", 12)
        .text(v => {
          d = v.values[0];
          var value = d["ParentCity"];
          return value;
        })
        .attr("fill", attrs.defaultTextFill)
        .attr("text-anchor", "middle")
        .attr("pointer-events", "none")
        .attr("transform", v => {
          var d = v.values[0];
          var pos = attrs.locationsObj[d["ParentCity"]];
          if (!pos) {
            //console.log(d["ParentCity"], "is not defined");
            return;
          }
          var sum = d3.sum(v.values, d => d.Numbers);
          var r = scales.point(sum);

          var x = projection(pos)[0];
          var y = projection(pos)[1] + r + 10;

          return ` translate(${x},${y}) `;
        });

      const mapCircles = mapPointsWrapper
        .patternify({
          tag: "circle",
          selector: "point",
          data: attrs.cityGrouped
        })
        .attr("fill", v => {
          d = v.values[0];
          var color = scales.pointColor(d.Growth);
          return color;
        })
        .attr("r", d => {
          var sum = d3.sum(d.values, d => d.Numbers);
          return scales.point(sum);
        })
        .attr("opacity", 0.8)
        .attr("cx", v => {
          var d = v.values[0];
          var pos = attrs.locationsObj[d["ParentCity"]];
          if (!pos) {
            //console.log(d["ParentCity"], "is not defined");
            return;
          }
          return projection(pos)[0];
        })
        .attr("cy", v => {
          var d = v.values[0];
          var pos = attrs.locationsObj[d["ParentCity"]];
          if (!pos) {
            return;
          }
          return projection(pos)[1];
        })
        .attr("cursor", "pointer")
        .on("mouseenter", function (d) {
          var strokeWidth = 3;
          if (attrs.transform) {
            strokeWidth = strokeWidth / attrs.transform.k;
          }
          d3.select(this)
            .attr("stroke", "black")
            .attr("stroke-width", strokeWidth);

          attrs.onPointMouseEnter(d, {
            attrs: attrs,
            loc: attrs.locationsObj[d.values[0]["ParentCity"]]
          });
        })
        .on("mouseleave", function (d) {
          d3.select(this).attr("stroke", "none");
          attrs.onPointMouseLeave(d);
        })
        .on("click", d => {
          attrs.onPointClick(d, {
            attrs: attrs,
            loc: attrs.locationsObj[d.values[0]["ParentCity"]]
          });
        });

      arrangeLabels();

      handleWindowResize();
      attrs.firstRun = false;

      /* #############################   HANDLER FUNCTIONS    ############################## */
      handlers.zoomed = function () {
        if (attrs.regionZoomed) {
          return;
        }
        var transform = d3.event.transform;
        attrs.transform = transform;

        chart.attr("transform", transform);
        chart.selectAll(".point").attr("r", d => {
          var sum = d3.sum(d.values, d => d.Numbers);
          return scales.point(sum) / attrs.transform.k;
        });

        chart.selectAll(".label").attr("transform", v => {
          var d = v.values[0];
          var pos = attrs.locationsObj[d["ParentCity"]];
          if (!pos) {
            //console.log(d["ParentCity"], "is not defined");
            return;
          }
          var sum = d3.sum(v.values, d => d.Numbers);
          var r = scales.point(sum);
          var x = projection(pos)[0];
          var y = projection(pos)[1] + (r + 13) / attrs.transform.k;

          return ` translate(${x},${y})scale(${1 / attrs.transform.k}) `;
        });

        arrangeLabels();
      };

      function handleWindowResize() {
        d3.select(window).on("resize." + attrs.id, function () {
          setDimensions();
        });
      }

      function setDimensions() {
        setSvgWidthAndHeight();
        container.call(main);
      }

      function setSvgWidthAndHeight() {
        var containerRect = container.node().getBoundingClientRect();
        if (containerRect.width > 0) attrs.svgWidth = containerRect.width - 5;
        if (containerRect.height > 0)
          attrs.svgHeight = containerRect.height - 5;

        // d3.select('.header-text').style('display', function (d) {
        //     return window.innerWidth >= 768 ? 'block' : 'none';
        // });

      }

      function mapPathMouseEnter(d) {
        const outerRegion = attrs.regionByCountryObj[d.properties.A3];

        mapPaths
          .filter(v => {
            return outerRegion == attrs.regionByCountryObj[v.properties.A3];
          })
          .transition()
          .attr("fill", v => {
            const region = attrs.regionByCountryObj[v.properties.A3];
            const config = attrs.regionConfigs[region];
            const color = config ? config.color : attrs.mapPathFill;
            return color;
          });

        mapPoints
          .filter(d => {
            const region = attrs.regionByCountryObj[d.values[0].Country];
            return region != outerRegion;
          })
          .transition()
          .attr("opacity", 0);
        mapCircles
          .filter(d => {
            const region = attrs.regionByCountryObj[d.values[0].Country];
            return region != outerRegion;
          })
          .transition()
          .attr("opacity", 0);
      }

      function mapPathMouseLeave(d) {
        mapPoints.transition().attr("opacity", 1);
        mapCircles.transition().attr("opacity", 1);
        const outerRegion = attrs.regionByCountryObj[d.properties.A3];
        mapPaths.transition().attr("fill", attrs.mapPathFill);
      }

      function mapPathMouseClick(v) {

        if (attrs.allowZooming) {
          return false;
        }

        const region = attrs.regionByCountryObj[v.properties.A3];
        const config = attrs.regionConfigs[region];


        // if (attrs.active.node() == this) {
        //   return reset();
        // }

        if (!config) {
          //console.log("config not found for " + v.properties.A3);
          return;
        }
        attrs.regionZoomed = true;
        zoomOutGrup.style('display', 'initial')

        attrs.currentScale = config.scale;
        attrs.currentCenter = config.center;

        attrs.active.classed('active', false);
        attrs.active = d3.select(this).classed('active', true);
        const bounds = path.bounds(config.zoomFeature);
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;
        const scale = .9 / Math.max(dx / calc.chartWidth, dy / calc.chartHeight);
        const translate = [calc.chartWidth / 2 - scale * x, calc.chartHeight / 2 - scale * y];


        chart.transition()
          .duration(750)
          .attr("transform", "translate(" + translate + ")scale(" + scale + ")")
          .on('end', function (d) {
            arrangeLabels();
          })

        chart.selectAll(".point").attr("r", d => {
          var sum = d3.sum(d.values, d => d.Numbers);
          return scales.point(sum) / scale;
        });

        chart.selectAll(".label").attr("transform", v => {
          var d = v.values[0];
          var pos = attrs.locationsObj[d["ParentCity"]];
          if (!pos) {
            //console.log(d["ParentCity"], "is not defined");
            return;
          }
          var sum = d3.sum(v.values, d => d.Numbers);
          var r = scales.point(sum);
          var x = projection(pos)[0];
          var y = projection(pos)[1] + (r + 13) / scale;

          return ` translate(${x},${y})scale(${1 / scale}) `;
        });




      }

      function projectionTween(projection0, projection1) {
        return function (d) {
          var t = 0;

          var projection = d3.geo
            .projection(project)
            .scale(1)
            .translate([width / 2, height / 2]);

          var path = d3.geo.path().projection(projection);

          function project(λ, φ) {
            (λ *= 180 / Math.PI), (φ *= 180 / Math.PI);
            var p0 = projection0([λ, φ]),
              p1 = projection1([λ, φ]);
            return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]];
          }

          return function (_) {
            t = _;
            return path(d);
          };
        };
      }

      function arrangeLabels() {
        var move = 1;
        while (move > 0) {
          move = 0;
          svg.selectAll(".label").each(function () {
            var that = this,
              a = this.getBoundingClientRect();
            svg.selectAll(".label").each(function () {
              if (this != that) {
                var b = this.getBoundingClientRect();
                if (
                  Math.abs(a.left - b.left) * 2 < a.width + b.width &&
                  Math.abs(a.top - b.top) * 2 < a.height + b.height
                ) {
                  // overlap, move labels
                  var dx =
                    (Math.max(0, a.right - b.left) +
                      Math.min(0, a.left - b.right)) *
                    0.01,
                    dy =
                      (Math.max(0, a.bottom - b.top) +
                        Math.min(0, a.top - b.bottom)) *
                      0.02,
                    tt = getTransformation(d3.select(this).attr("transform")),
                    to = getTransformation(d3.select(that).attr("transform"));
                  move += Math.abs(dx) + Math.abs(dy);

                  to.translate = [to.translate[0] + dx, to.translate[1] + dy];
                  tt.translate = [tt.translate[0] - dx, tt.translate[1] - dy];
                  d3.select(this).attr(
                    "transform",
                    "translate(" + tt.translate + ")"
                  );
                  d3.select(that).attr(
                    "transform",
                    "translate(" + to.translate + ")"
                  );
                  a = this.getBoundingClientRect();
                }
              }
            });
          });
        }
      }

      function getTransformation(transform) {
        // Create a dummy g for calculation purposes only. This will never
        // be appended to the DOM and will be discarded once this function
        // returns.
        var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // Set the transform attribute to the provided string value.
        g.setAttributeNS(null, "transform", transform);

        // consolidate the SVGTransformList containing all transformations
        // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
        // its SVGMatrix.
        var matrix = g.transform.baseVal.consolidate().matrix;

        // Below calculations are taken and adapted from the private function
        // transform/decompose.js of D3's module d3-interpolate.
        var { a, b, c, d, e, f } = matrix; // ES6, if this doesn't work, use below assignment
        // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
        var scaleX, scaleY, skewX;
        if ((scaleX = Math.sqrt(a * a + b * b))) (a /= scaleX), (b /= scaleX);
        if ((skewX = a * c + b * d)) (c -= a * skewX), (d -= b * skewX);
        if ((scaleY = Math.sqrt(c * c + d * d)))
          (c /= scaleY), (d /= scaleY), (skewX /= scaleY);
        if (a * d < b * c)
          (a = -a), (b = -b), (skewX = -skewX), (scaleX = -scaleX);
        return {
          translateX: e,
          translateY: f,
          rotate: (Math.atan2(b, a) * 180) / Math.PI,
          skewX: (Math.atan(skewX) * 180) / Math.PI,
          scaleX: scaleX,
          scaleY: scaleY,
          translate: [e, f]
        };
      }

      // Smoothly handle data updating
      updateData = function () { };
      debug();
      //#########################################  UTIL FUNCS ##################################

      function debug() {
        if (attrs.isDebug) {
          //stringify func
          var stringified = scope + "";

          // parse variable names
          var groupVariables = stringified
            //match var x-xx= {};
            .match(/var\s+([\w])+\s*=\s*{\s*}/gi)
            //match xxx
            .map(d => d.match(/\s+\w*/gi).filter(s => s.trim()))
            //get xxx
            .map(v => v[0].trim());

          //assign local variables to the scope
          groupVariables.forEach(v => {
            main["P_" + v] = eval(v);
          });
        }
        window.chart = main;
      }
    });
  };

  //----------- PROTOTYEPE FUNCTIONS  ----------------------
  d3.selection.prototype.patternify = function (params) {
    var container = this;
    var selector = params.selector;
    var elementTag = params.tag;
    var data = params.data || [selector];

    // Pattern in action
    var selection = container.selectAll("." + selector).data(data, (d, i) => {
      if (typeof d === "object") {
        if (d.id) {
          return d.id;
        }
      }
      return i;
    });
    selection.exit().remove();
    selection = selection
      .enter()
      .append(elementTag)
      .merge(selection);
    selection.attr("class", selector);
    return selection;
  };

  //dinamic keys functions
  Object.keys(attrs).forEach(key => {
    // Attach variables to main function
    return (main[key] = function (_) {
      var string = `attrs['${key}'] = _`;
      if (!arguments.length) {
        return eval(` attrs['${key}'];`);
      }
      eval(string);
      return main;
    });
  });

  //set attrs as property
  main.attrs = attrs;

  //debugging visuals
  main.debug = function (isDebug) {
    attrs.isDebug = isDebug;
    if (isDebug) {
      if (!window.charts) window.charts = [];
      window.charts.push(main);
    }
    return main;
  };

  //exposed update functions
  main.data = function (value) {
    if (!arguments.length) return attrs.data;
    attrs.data = value;
    if (typeof updateData === "function") {
      updateData();
    }
    return main;
  };

  // run  visual
  main.run = function () {
    d3.selectAll(attrs.container).call(main);
    return main;
  };

  return main;
}
