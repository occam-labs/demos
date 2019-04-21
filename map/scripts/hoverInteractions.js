function regionMouseEntered(obj) {
  //console.log('region mouse entered')
  if (!obj.region) return;

  var coords = obj.mouseCoords || [d3.event.x, d3.event.y];

  if (coords[0] > (utils.getWidth() - 530)) {
    coords[0] = coords[0] - 510;
  }

  if (coords[1] > (screen.height - 600)) {
    coords[1] = screen.height - 600;
  }

  d3.selectAll(".tooltip-content")
    .style("display", "initial")
    .style("left", coords[0] + "px")
    .style("top", coords[1] + 20 + "px");

  const currentRegion = obj.region;

  let filteredPoints = [];
  const filteredRegions = obj.attrs.regionNestedHighLevelData.filter(
    d => d.key == currentRegion
  );

  if (filteredRegions.length) {
    filteredPoints = filteredRegions[0].values;
  }

  //# GROWTH
  const growthPoints = filteredPoints
    .filter(p => p.Growth)
    .map(d => Number(d.Growth.split("%")[0]));
  //
  var growth = d3.mean(growthPoints);
  growth = growth && growth + " %";

  //SALES
  var cities = obj.attrs.cityGrouped
    .filter(
      d => obj.attrs.regionByCountryObj[d.values[0].Country] == currentRegion
    )
    .map(d => d.key);

  //
  var listings = obj.attrs.cityNestedDetailedData
    .filter(d => cities.indexOf(d.key) != -1)
    .map(a => a.values)
    .reduce((a, b) => a.concat(b), []);
  var listingsCount = listings.length;
  var salesListingsCount = listings.filter(list => list.sr == "S").length;

  var salesBarData = [
    { name: "1M+ Net Worth Ind.", value: 357200 },
    { name: "5M+ Net Worth Ind.", value: 12070 },
    { name: "15M+ Net Worth Ind.", value: 4750 },
    { name: "Most Premium Properties", value: 4750 }
  ];

  salesBarData[0].value = listings.filter(
    d => d.price <= 1000000 && d.sr == "S"
  ).length;
  salesBarData[1].value = listings.filter(
    d => d.price <= 5000000 && d.sr == "S"
  ).length;
  salesBarData[2].value = listings.filter(
    d => d.price <= 15000000 && d.sr == "S"
  ).length;
  salesBarData[3].value = listings.filter(
    d => d.price > 15000000 && d.sr == "S"
  ).length;

  // MILLIONARIES
  var m1 = d3.sum(
    filteredPoints.filter(v => "1M+ (Millionaires)" == v.Millionaires),
    d => +d.Numbers
  );
  var m10 = d3.sum(
    filteredPoints.filter(v => "10M+ (Multimillionaires)" == v.Millionaires),
    d => +d.Numbers
  );
  var m30 = d3.sum(
    filteredPoints.filter(v => "30M+ (UHNWIS)" == v.Millionaires),
    d => +d.Numbers
  );

  var totalMillionairesData = [
    {
      name: "1M+ (Millionaires)",
      value: +m1
    },
    {
      name: "10M+ (Multimillionaires)",
      value: +m10
    },
    {
      name: "30M+ (UHNWIS)",
      value: +m30
    }
  ];

  var millionaries = numberFormat(d3.sum(totalMillionairesData, d => +d.value));

  //RENT
  var rentsCount = listings.filter(list => list.sr == "R").length;

  var sideData = {
    nestSeekers: obj.attrs.data.nestSeekers.filter(
      d => d.region == obj.attrs.config.region
    ).length,
    growth: growth,
    sales: numberFormat(salesListingsCount),
    millionaries: millionaries,
    rent: numberFormat(rentsCount),
    salesBarData: salesBarData,
    totalMillionairesData: totalMillionairesData
  };

  updateSide(sideData);
  const tooltipContent = d3.select(".tooltip-content");

  tooltipContent.select(".tooltip-main-name").html(currentRegion);
  tooltipContent.select(".one-m .m-number").html("");
  tooltipContent.select(".ten-m .m-number").html("");
  tooltipContent.select(".thirty-m .m-number").html("");
  tooltipContent.select(".listings-count").html("");
  tooltipContent.select(".growth").style("display", "none");
  tooltipContent.select(".listings").style("display", "none");
  tooltipContent.select(".legends").style("opacity", "0");
  tooltipContent.select("#map").style("opacity", "0");
  tooltipContent.style("height", "200px");
  tooltipContent.select(".legends").style('display', 'none')
  tooltipContent.select(".header").style('margin-top', '24px')
  tooltipContent.select(".millionaries").style("opacity", "1");
}

function onRegionMouseLeaved() {
  //console.log('region mouse leaved')
  hideTooltip({ dontRemoveMapThings: true });
  updateSide(global_RightPanelData);
}

function updateSide(sideData) {
  //console.log('side update', sideData)
  var width = 50;

  var salesBarData = sideData.salesBarData;
  var salesMax = d3.max(salesBarData, d => d.value);
  var salesScale = d3
    .scaleLinear()
    .domain([0, salesMax])
    .range([0, width]);

  const salesCount = d3.sum(salesBarData, d => d.value);

  var totalSalesTop = `
  <div style="display: ${salesCount == 0 ? 'none' : 'inline-block'};
              width:220px;
              height:130px;
              float:left">
            <div class='title' style="color:#968A7D;">Properties for sale  <br>  <span class="total-sales-value"style="font-size:35px;font-weight:bold;color:#FF3E36"> </span> </div>
          
            `;

  var totalSalesButton = `
            <div style="">
                      <div class='title' style="color:#968A7D;">Properties for sale  <br>  <span class="total-sales-value"style="font-size:25px;font-weight:bold;color:#FF3E36"> </span> </div>
                    
                      `;

  const totalSales =
    totalSalesTop +
    `
<svg  height=100  font-size=11 style="display: inline-block;overflow:visible;fill:#B0AEB0">
${salesBarData
      .map((d, i) => {
        return `<g transform="translate(50,${i * 20 + 5})">
         <text text-anchor='start' x=${102 +
          salesScale(d.value) -
          5} y=9>${numberFormat(d.value)}</text> 
         <rect fill="#FB544C" width=${salesScale(
            d.value
          )} x=${95} height=10 fill="black" ></rect>
         <text  text-anchor='end' x=${90} y=10>${d.name}</text>
         </g>`;
      })
      .join("")}
</svg>
</div>
`;

  d3.select(".right-panel .total-sales").html(totalSalesButton + "</div>");

  var totalMillionairesData = sideData.totalMillionairesData;
  var millionairesMax = d3.max(totalMillionairesData, d => d.value);
  var scale = d3
    .scaleLinear()
    .domain([0, millionairesMax])
    .range([0, width]);

  var totalMillionairesTop = `
    <div style="display: ${sideData.millionaries == 0 ? 'none' : 'inline-block'};
                width:220px;height:130px;float:right;margin-right:25px">
            <div class='title' 
            style="
            color:#968A7D;
            display: ${sideData.millionaries == 0 ? 'none' : 'inline-block'};
            "> Number of Millionaires <br><span class="total-milionaries-value" style="font-size:35px;font-weight:bold;color:#FF8700">   </span> </div>`;

  const totalMillionairesButton = `
      <div style="">
              <div class='title' style="color:#968A7D;"> Number of Millionaires <br><span class="total-milionaries-value" style="font-size:25px;font-weight:bold;color:#FF8700">   </span> </div>`;

  const totalMillionaires =
    totalMillionairesTop +
    `<svg height=80 font-size=11 style="display: inline-block;overflow:visible;fill:#B0AEB0">
             ${totalMillionairesData
      .map((d, i) => {
        return `<g transform="translate(50,${i * 20 +
          5})"><text text-anchor='end' x=${width -
          scale(d.value) -
          5} y=10>${numberFormat(
            d.value
          )}</text> <rect fill="#FF8C00" width=${scale(
            d.value
          )} x=${width -
          scale(
            d.value
          )} height=10 fill="black" ></rect><text x=${width +
          10} y=10>${d.name}</text></g>`;
      })
      .join("")}
            </svg>
           </div> `;

  d3.select(".right-panel .total-millionaires").html(
    totalMillionairesButton + "</div>"
  );
  d3.select(".nest-seekers-office-quantity").text(sideData.nestSeekers);
  d3.select(".total-growth-value").text(sideData.growth || '-');
  d3.select(".total-sales-value").text(sideData.sales);
  d3.select(".total-milionaries-value").text(sideData.millionaries);
  d3.select(".total-rent-quantity").text(sideData.rent);
  d3.select(".tooltip-content")
    .select(".millionaries")
    .html(totalSales + totalMillionaires);
}

function pointMouseEntered(d, params) {
  console.log(d, params);
  d3.select('.tooltip-content').style("height", "500px");
  d3.select('.tooltip-content').select(".legends").style('display', 'inline-block')
  d3.select('.tooltip-content').select(".header").style('margin-top', '0px')
  // //console.log('point mouse entered')
  var coords = params.mouseCoords || [d3.event.x, d3.event.y];

  if (coords[0] > (utils.getWidth() - 530)) {
    coords[0] = coords[0] - 510;
  }

  if (coords[1] > (screen.height - 600)) {
    coords[1] = screen.height - 600;
  }

  d3.selectAll(".tooltip-content")
    .style("display", "initial")
    .style("left", coords[0] + "px")
    .style("top", coords[1] + 20 + "px");

  d3.select(".tooltip-content")
    .select("#map")
    .style("opacity", "1");

  var cityName = d.key;
  var m1 = d.values.filter(v => "1M+ (Millionaires)" == v.Millionaires)[0]
    .Numbers;
  var m10 = d.values.filter(
    v => "10M+ (Multimillionaires)" == v.Millionaires
  )[0].Numbers;
  var m30 = d.values.filter(v => "30M+ (UHNWIS)" == v.Millionaires)[0].Numbers;
  var listings = params.attrs.cityNestedDetailedData.filter(
    d => d.key == cityName
  )[0];
  var listingsCount = listings ? listings.values.length : "N/A";
  var salesListingsCount = listings
    ? listings.values.filter(d => d.sr == "S").length
    : "N/A";
  var growth = d.values[0].Growth;
  growth = growth || "N/A";



  var barsData = [
    {
      name: "1M+ (Millionaires)",
      value: +m1
    },
    {
      name: "10M+ (Multimillionaires)",
      value: +m10
    },
    {
      name: "30M+ (UHNWIS)",
      value: +m30
    }
  ];

  const millionairesCount = numberFormat(d3.sum(barsData, d => d.value))

  var max = d3.max(barsData, d => d.value);
  var min = 0;
  var width = 50;
  var scale = d3
    .scaleLinear()
    .domain([min, max])
    .range([0, width]);

  var str = `
            <div style="display:inline-block;width:230px">
            <div class='title'
                 style="${millionairesCount == 0 ? 'none' : 'inline-block'};"
            > Number of Millionaires</div>
           <div class='count mil'> ${millionairesCount}</div>
            <svg height=100 font-size=11 style="overflow:visible;fill:#B0AEB0">
               ${barsData
      .map((d, i) => {
        return `<g transform="translate(50,${i *
          20})"><text text-anchor='end' x=${width -
          scale(d.value) -
          5} y=10>${numberFormat(
            d.value
          )}</text> <rect fill="#FF8C00" width=${scale(
            d.value
          )} x=${width -
          scale(
            d.value
          )} height=10 fill="black" ></rect><text x=${width +
          10} y=10>${d.name}</text></g>`;
      })
      .join("")}
              </svg>
            </div>
             `;

  var leftBarsData = [];
  if (salesListingsCount != "N/A") {
    leftBarsData = [
      { name: "1M+ Net Worth Ind.", value: 357200 },
      { name: "5M+ Net Worth Ind.", value: 12070 },
      { name: "15M+ Net Worth Ind.", value: 4750 },
      { name: "Most Premium Properties", value: 4750 }
    ];

    leftBarsData[0].value = listings.values.filter(
      d => d.price <= 1000000 && d.sr == "S"
    ).length;
    leftBarsData[1].value = listings.values.filter(
      d => d.price <= 5000000 && d.sr == "S"
    ).length;
    leftBarsData[2].value = listings.values.filter(
      d => d.price <= 15000000 && d.sr == "S"
    ).length;
    leftBarsData[3].value = listings.values.filter(
      d => d.price > 15000000 && d.sr == "S"
    ).length;
  }

  var leftMax = d3.max(leftBarsData, d => d.value);
  var leftScale = d3
    .scaleLinear()
    .domain([min, leftMax])
    .range([0, width]);

  var leftStr = `
            <div  style="display:${
    salesListingsCount == "N/A" ? "none !important" : "inline-block"
    };width:250px">
            <div class='title'
            style="${ salesListingsCount == 0 ? 'none' : 'inline-block'};"
            > Properties for sale</div>
           <div class='count list' > ${numberFormat(salesListingsCount)}</div>
            <svg  height=100  font-size=11 style="overflow:visible;fill:#B0AEB0">
               ${leftBarsData
      .map((d, i) => {
        return `<g transform="translate(50,${i * 20})">
                        <text text-anchor='start' x=${102 +
          leftScale(d.value) -
          5} y=9>${numberFormat(d.value)}</text> 
                        <rect fill="#FB544C" width=${leftScale(
            d.value
          )} x=${95} height=10 fill="black" ></rect>
                        <text  text-anchor='end' x=${90} y=10>${d.name}</text>
                        </g>`;
      })
      .join("")}
              </svg>
            </div>
             `;

  var finalResult = leftStr + str;


  d3.select(".millionaries").html(finalResult);
  d3.select(".one-m .m-number").html(numberFormat(m1));
  d3.select(".ten-m .m-number").html(numberFormat(m10));
  d3.select(".thirty-m .m-number").html(numberFormat(m30));
  d3.select(".tooltip-main-name").html(cityName);
  d3.select(".listings-count").html(numberFormat(listingsCount));
  d3.select(".growth-count").html(growth);

  var sideData = {
    nestSeekers: '-',
    growth: growth == 'N/A' ? '-' : growth,
    sales: listings ? numberFormat(salesListingsCount) : '-',
    millionaries: millionairesCount,
    rent: listings ? numberFormat(listings.values.filter(d => d.sr == "R").length) : '-',
    salesBarData: leftBarsData,
    totalMillionairesData: barsData
  };



  // Draw Mapbox Circles
  var data = toFeatureCollection(listings);

  map.addSource("listings", {
    type: "geojson",
    data: data
  });

  // add the map layer
  map.addLayer({
    id: "listings",
    type: "circle",
    source: "listings",
    layout: {},
    paint: {
      "circle-color": {
        property: "sr",
        type: "categorical",
        stops: [["S", "#FE8B00"], ["R", "#C469A3"]]
      },
      "circle-opacity": 0.8,
      "circle-radius": 2
    }
  });

  //Bounds
  var leftRight = d3.extent(data.features, v => {
    return v.geometry.coordinates[0];
  });

  var topBottom = d3.extent(data.features, v => {
    return v.geometry.coordinates[1];
  });

  map.jumpTo({
    center: params.loc, // starting position [lng, lat]
    zoom: 10 // starting zoom
  });



  d3.select(".tooltip-content")
    .select(".growth")
    .style("display", "inline");

  d3.select(".tooltip-content")
    .select("#map")
    .style("opacity", "1");

  d3.select(".tooltip-content")
    .select(".legends")
    .style("opacity", "1");

  d3.select(".tooltip-content").style("height", "500px");

  d3.select(".tooltip-content")
    .select(".listings")
    .style("opacity", "1");

  d3.select(".tooltip-content")
    .select(".millionaries")
    .style("opacity", "1");

  if (listingsCount == "N/A") {

    d3.select(".tooltip-content")
      .select("#map")
      .style("opacity", "0");

    d3.select(".tooltip-content")
      .select(".legends")
      .style("opacity", "0");

    d3.select(".tooltip-content").style("height", "270px");

    d3.select(".tooltip-content")
      .select(".listings")
      .style("opacity", "0");


  }

  if (growth == "N/A") {

    d3.select(".tooltip-content")
      .select(".growth")
      .style("display", "none");
  }

  updateSide(sideData);
}

function pointMouseLeaved() {
  //console.log('point mouse leaved')
  updateSide(global_RightPanelData);
  hideTooltip();
}