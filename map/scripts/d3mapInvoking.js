// var configs = [
//   {
//     selector: ".northAmerica",
//     region: "Northern America",
//     center: [25, 45],
//     scale: 200
//   },
//   {
//     region: "Europe",
//     selector: ".europa",
//     center: [7, 50],
//     scale: 800
//   },
//   {
//     region: "Asia",
//     selector: ".asia",
//     center: [107, 50],
//     scale: 270
//   },
//   {
//     region: "South America",
//     selector: ".southAmerica",
//     center: [-70, 10]
//   },
//   {
//     region: "Africa",
//     selector: ".africa",
//     center: [17, 17],
//     scale: 240
//   },
//   {
//     region: "Oceania",
//     selector: ".australia",
//     center: [127, -15],
//     scale: 340
//   }
// ];

// // URL GOES HERE
// var highLevelDataPromise = d3.json("data/highLevelData.json");
// var locationsPromise = d3.json("data/locations.json");

// var worldCountriesPromise = d3.json("data/countries-land-2km5.json");
// // worldCountriesPromise = d3.json('data/world_countries.json')

// var heatMapDataPromise = d3.csv("data/heatmapData.csv"); //d3.json('data/heat_map_data.json');
// var nestseekersDataPromise = d3.json("data/nestSeekersOffices.json");

// var regionByCountyDataPromise = d3.json("data/regionByCountryID.json");

// var promises = [
//   highLevelDataPromise,
//   locationsPromise,
//   worldCountriesPromise,
//   heatMapDataPromise,
//   nestseekersDataPromise,
//   regionByCountyDataPromise
// ];

// Promise.all(promises).then(receivedData => {
//   d3.selectAll(".overlay").remove();

//   var regions = getContinentsByCountry();

//   var data = {
//     highLevelData: receivedData[0],
//     locations: receivedData[1],
//     geojson: receivedData[2],
//     heatmapData: receivedData[3],
//     nestSeekers: receivedData[4],
//     regionByCountryObj: receivedData[5]
//   };

//   var locationsObj = {};
//   data.locations.forEach(location => {
//     var locObj = {
//       latitude: location.Latitude,
//       longitude: location.Longitude
//     };

//     var locArray = [locObj.longitude, locObj.latitude];
//     locationsObj[location["Parent City"]] = locArray;
//   });

//   //  if (window.innerWidth >= 768)
//   setRightPanel(data);

//   configs.forEach((config, i) => {
//     if (i) return;
//     var points = receivedData[0];
//     // .filter(d => {
//     //     var country = d.Country;
//     //     var region = regions[country];

//     //     if (!region) {
//     //         //console.log('region not found for', d);
//     //         return d;
//     //     }

//     //     if (config.region == region) {
//     //         return d;
//     //     }
//     //     return false;
//     // });

//     var newData = Object.assign({}, data, { points: points });

//     var chart = getChart()
//       .container(config.selector)
//       .locationsObj(locationsObj)
//       .center(config.center)
//       .config(config)
//       .data(newData)
//       .regionByCountryObj(data.regionByCountryObj);

//     if (config.scale) {
//       chart.scale(config.scale);
//     }

//     chart.run();

//     chart.onPointMouseEnter(pointMouseEntered);
//     chart.onPointMouseLeave(pointMouseLeaved);
//     chart.onPointClick(pointMouseClicked);
//     chart.onRegionMouseEnter(regionMouseEntered);
//     chart.onRegionMouseLeave(onRegionMouseLeaved);
//   });
// });

function setRightPanel(data) {
  rightPanelData = {
    nestSeekers: data.nestSeekers.length,
    growth: null,
    sales: null,
    millionaries: null,
    rent: null,
    salesBarData: null,
    totalMillionairesData: null
  };

  // ---------  NEST_SEEKERS
  // append nestseekers office count
  d3.select(".nest-seekers-office-text")
    .text("Number of NestSeekers offices")
    .style("color", "#777B7B");

  d3.select(".nest-seekers-office-quantity")
    .style("font-size", "25px")
    .style("font-weight", "bold")
    .style("color", "gray");

  // ---------  GROWTH_NUMBERS
  // append growth number
  var growthValues = data.highLevelData.map(x =>
    Number(x.Growth.split("%")[0])
  );
  var averageGrowth = d3.sum(growthValues) / data.highLevelData.length;

  d3.select(".total-growth-text")
    .text("Total growth")
    .style("color", "#777B7B");

  d3.select(".total-growth-value")
    .style("font-size", "25px")
    .style("font-weight", "bold")
    .style("color", "#D97900");

  rightPanelData.growth = averageGrowth.toFixed(2) + " %";

  // ---------  SALES_NUMBERS
  //total sales bar chart
  var totalSalesListing = data.heatmapData.filter(d => d.sr == "S");
  var totalSalesListingCount = totalSalesListing.length;

  var salesBarData = [
    { name: "1M+ Net Worth Ind.", value: 357200 },
    { name: "5M+ Net Worth Ind.", value: 12070 },
    { name: "15M+ Net Worth Ind.", value: 4750 },
    { name: "Most Premium Properties", value: 4750 }
  ];

  salesBarData[0].value = totalSalesListing.filter(
    d => d.price <= 1000000 && d.sr == "S"
  ).length;
  salesBarData[1].value = totalSalesListing.filter(
    d => d.price <= 5000000 && d.sr == "S"
  ).length;
  salesBarData[2].value = totalSalesListing.filter(
    d => d.price <= 15000000 && d.sr == "S"
  ).length;
  salesBarData[3].value = totalSalesListing.filter(
    d => d.price > 15000000 && d.sr == "S"
  ).length;

  rightPanelData.sales = numberFormat(totalSalesListingCount);
  rightPanelData.salesBarData = salesBarData;
  // ---------  MILLIONARIES
  //total millionaires
  var m1 = d3.sum(
    data.highLevelData.filter(v => "1M+ (Millionaires)" == v.Millionaires),
    d => +d.Numbers
  );
  var m10 = d3.sum(
    data.highLevelData.filter(
      v => "10M+ (Multimillionaires)" == v.Millionaires
    ),
    d => +d.Numbers
  );
  var m30 = d3.sum(
    data.highLevelData.filter(v => "30M+ (UHNWIS)" == v.Millionaires),
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

  rightPanelData.millionaries = numberFormat(
    d3.sum(totalMillionairesData, d => d.value)
  );
  rightPanelData.totalMillionairesData = totalMillionairesData;
  // ---------  RENT
  d3.select(".total-rent-text")
    .text("Properties to rent")
    .style("color", "#968A7D");
  d3.select(".total-rent-quantity")
    .style("font-size", "25px")
    .style("font-weight", "bold")
    .style("color", "#C469A3");


  rightPanelData.rent = numberFormat(
    data.heatmapData.filter(d => d.sr == "R").length
  );

  updateSide(rightPanelData);
  global_RightPanelData = rightPanelData;
}



function hideTooltip(params) {
  d3.selectAll(".tooltip-content").style("display", "none");
  if (params && params.dontRemoveMapThings) {
    // do nothing
  } else {
    map.removeLayer("listings");
    map.removeSource("listings");
  }
}

function toFeatureCollection(convertedData) {
  var arr = convertedData ? convertedData.values : [];
  var features = arr.map(d => {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [d.lng, d.lat]
      },
      properties: d
    };
  });
  var featuresCollection = {
    type: "FeatureCollection",
    features: features
  };
  return featuresCollection;
}

function getContinentsByCountry() {
  var cntrs = [
    { name: "Aruba", region: "Northern America" },
    { name: "Afghanistan", region: "Asia" },
    { name: "Angola", region: "Africa" },
    { name: "Anguilla", region: "Northern America" },
    { name: "Åland Islands", region: "Europe" },
    { name: "Albania", region: "Europe" },
    { name: "Andorra", region: "Europe" },
    { name: "United Arab Emirates", region: "Asia" },
    { name: "Argentina", region: "South America" },
    { name: "Armenia", region: "Asia" },
    { name: "American Samoa", region: "Oceania" },
    { name: "Antarctica", region: "Antarctic" },
    { name: "French Southern and Antarctic Lands", region: "Antarctic" },
    { name: "Antigua and Barbuda", region: "Northern America" },
    { name: "Australia", region: "Oceania" },
    { name: "Austria", region: "Europe" },
    { name: "Azerbaijan", region: "Asia" },
    { name: "Burundi", region: "Africa" },
    { name: "Belgium", region: "Europe" },
    { name: "Benin", region: "Africa" },
    { name: "Burkina Faso", region: "Africa" },
    { name: "Bangladesh", region: "Asia" },
    { name: "Bulgaria", region: "Europe" },
    { name: "Bahrain", region: "Asia" },
    { name: "Bahamas", region: "Northern America" },
    { name: "Bosnia and Herzegovina", region: "Europe" },
    { name: "Saint Barthélemy", region: "Northern America" },
    { name: "Saint Helena, Ascension and Tristan da Cunha", region: "Africa" },
    { name: "Belarus", region: "Europe" },
    { name: "Belize", region: "Northern America" },
    { name: "Bermuda", region: "Northern America" },
    { name: "Bolivia", region: "South America" },
    { name: "Caribbean Netherlands", region: "Northern America" },
    { name: "Brazil", region: "South America" },
    { name: "Barbados", region: "Northern America" },
    { name: "Brunei", region: "Asia" },
    { name: "Bhutan", region: "Asia" },
    { name: "Bouvet Island", region: "Antarctic" },
    { name: "Botswana", region: "Africa" },
    { name: "Central African Republic", region: "Africa" },
    { name: "Canada", region: "Northern America" },
    { name: "Cocos (Keeling) Islands", region: "Oceania" },
    { name: "Switzerland", region: "Europe" },
    { name: "Chile", region: "South America" },
    { name: "China", region: "Asia" },
    { name: "Ivory Coast", region: "Africa" },
    { name: "Cameroon", region: "Africa" },
    { name: "DR Congo", region: "Africa" },
    { name: "Republic of the Congo", region: "Africa" },
    { name: "Cook Islands", region: "Oceania" },
    { name: "Colombia", region: "South America" },
    { name: "Comoros", region: "Africa" },
    { name: "Cape Verde", region: "Africa" },
    { name: "Costa Rica", region: "Northern America" },
    { name: "Cuba", region: "Northern America" },
    { name: "Curaçao", region: "Northern America" },
    { name: "Christmas Island", region: "Oceania" },
    { name: "Cayman Islands", region: "Northern America" },
    { name: "Cyprus", region: "Europe" },
    { name: "Czechia", region: "Europe" },
    { name: "Germany", region: "Europe" },
    { name: "Djibouti", region: "Africa" },
    { name: "Dominica", region: "Northern America" },
    { name: "Denmark", region: "Europe" },
    { name: "Dominican Republic", region: "Northern America" },
    { name: "Algeria", region: "Africa" },
    { name: "Ecuador", region: "South America" },
    { name: "Egypt", region: "Africa" },
    { name: "Eritrea", region: "Africa" },
    { name: "Western Sahara", region: "Africa" },
    { name: "Spain", region: "Europe" },
    { name: "Estonia", region: "Europe" },
    { name: "Ethiopia", region: "Africa" },
    { name: "Finland", region: "Europe" },
    { name: "Fiji", region: "Oceania" },
    { name: "Falkland Islands", region: "South America" },
    { name: "France", region: "Europe" },
    { name: "Faroe Islands", region: "Europe" },
    { name: "Micronesia", region: "Oceania" },
    { name: "Gabon", region: "Africa" },
    { name: "United Kingdom", region: "Europe" },
    { name: "Georgia", region: "Asia" },
    { name: "Guernsey", region: "Europe" },
    { name: "Ghana", region: "Africa" },
    { name: "Gibraltar", region: "Europe" },
    { name: "Guinea", region: "Africa" },
    { name: "Guadeloupe", region: "Northern America" },
    { name: "Gambia", region: "Africa" },
    { name: "Guinea-Bissau", region: "Africa" },
    { name: "Equatorial Guinea", region: "Africa" },
    { name: "Greece", region: "Europe" },
    { name: "Grenada", region: "Northern America" },
    { name: "Greenland", region: "Northern America" },
    { name: "Guatemala", region: "Northern America" },
    { name: "French Guiana", region: "South America" },
    { name: "Guam", region: "Oceania" },
    { name: "Guyana", region: "South America" },
    { name: "Hong Kong", region: "Asia" },
    { name: "Heard Island and McDonald Islands", region: "Antarctic" },
    { name: "Honduras", region: "Northern America" },
    { name: "Croatia", region: "Europe" },
    { name: "Haiti", region: "Northern America" },
    { name: "Hungary", region: "Europe" },
    { name: "Indonesia", region: "Asia" },
    { name: "Isle of Man", region: "Europe" },
    { name: "India", region: "Asia" },
    { name: "British Indian Ocean Territory", region: "Africa" },
    { name: "Ireland", region: "Europe" },
    { name: "Iran", region: "Asia" },
    { name: "Iraq", region: "Asia" },
    { name: "Iceland", region: "Europe" },
    { name: "Israel", region: "Africa" },
    { name: "Italy", region: "Europe" },
    { name: "Jamaica", region: "Northern America" },
    { name: "Jersey", region: "Europe" },
    { name: "Jordan", region: "Asia" },
    { name: "Japan", region: "Asia" },
    { name: "Kazakhstan", region: "Asia" },
    { name: "Kenya", region: "Africa" },
    { name: "Kyrgyzstan", region: "Asia" },
    { name: "Cambodia", region: "Asia" },
    { name: "Kiribati", region: "Oceania" },
    { name: "Saint Kitts and Nevis", region: "Northern America" },
    { name: "South Korea", region: "Asia" },
    { name: "Kosovo", region: "Europe" },
    { name: "Kuwait", region: "Asia" },
    { name: "Laos", region: "Asia" },
    { name: "Lebanon", region: "Asia" },
    { name: "Liberia", region: "Africa" },
    { name: "Libya", region: "Africa" },
    { name: "Saint Lucia", region: "Northern America" },
    { name: "Liechtenstein", region: "Europe" },
    { name: "Sri Lanka", region: "Asia" },
    { name: "Lesotho", region: "Africa" },
    { name: "Lithuania", region: "Europe" },
    { name: "Luxembourg", region: "Europe" },
    { name: "Latvia", region: "Europe" },
    { name: "Macau", region: "Asia" },
    { name: "Saint Martin", region: "Northern America" },
    { name: "Morocco", region: "Africa" },
    { name: "Monaco", region: "Europe" },
    { name: "Moldova", region: "Europe" },
    { name: "Madagascar", region: "Africa" },
    { name: "Maldives", region: "Asia" },
    { name: "Mexico", region: "South America" },
    { name: "Marshall Islands", region: "Oceania" },
    { name: "Macedonia", region: "Europe" },
    { name: "Mali", region: "Africa" },
    { name: "Malta", region: "Europe" },
    { name: "Myanmar", region: "Asia" },
    { name: "Montenegro", region: "Europe" },
    { name: "Mongolia", region: "Asia" },
    { name: "Northern Mariana Islands", region: "Oceania" },
    { name: "Mozambique", region: "Africa" },
    { name: "Mauritania", region: "Africa" },
    { name: "Montserrat", region: "Northern America" },
    { name: "Martinique", region: "Northern America" },
    { name: "Mauritius", region: "Africa" },
    { name: "Malawi", region: "Africa" },
    { name: "Malaysia", region: "Asia" },
    { name: "Mayotte", region: "Africa" },
    { name: "Namibia", region: "Africa" },
    { name: "New Caledonia", region: "Oceania" },
    { name: "Niger", region: "Africa" },
    { name: "Norfolk Island", region: "Oceania" },
    { name: "Nigeria", region: "Africa" },
    { name: "Nicaragua", region: "Northern America" },
    { name: "Niue", region: "Oceania" },
    { name: "Netherlands", region: "Europe" },
    { name: "Norway", region: "Europe" },
    { name: "Nepal", region: "Asia" },
    { name: "Nauru", region: "Oceania" },
    { name: "New Zealand", region: "Oceania" },
    { name: "Oman", region: "Asia" },
    { name: "Pakistan", region: "Asia" },
    { name: "Panama", region: "Northern America" },
    { name: "Pitcairn Islands", region: "Oceania" },
    { name: "Peru", region: "South America" },
    { name: "Philippines", region: "Asia" },
    { name: "Palau", region: "Oceania" },
    { name: "Papua New Guinea", region: "Oceania" },
    { name: "Poland", region: "Europe" },
    { name: "Puerto Rico", region: "Northern America" },
    { name: "North Korea", region: "Asia" },
    { name: "Portugal", region: "Europe" },
    { name: "Paraguay", region: "South America" },
    { name: "Palestine", region: "Asia" },
    { name: "French Polynesia", region: "Oceania" },
    { name: "Qatar", region: "Asia" },
    { name: "Réunion", region: "Africa" },
    { name: "Romania", region: "Europe" },
    { name: "Russia", region: "Europe" },
    { name: "Rwanda", region: "Africa" },
    { name: "Saudi Arabia", region: "Asia" },
    { name: "Sudan", region: "Africa" },
    { name: "Senegal", region: "Africa" },
    { name: "Singapore", region: "Asia" },
    { name: "South Georgia", region: "Antarctic" },
    { name: "Svalbard and Jan Mayen", region: "Europe" },
    { name: "Solomon Islands", region: "Oceania" },
    { name: "Sierra Leone", region: "Africa" },
    { name: "El Salvador", region: "Northern America" },
    { name: "San Marino", region: "Europe" },
    { name: "Somalia", region: "Africa" },
    { name: "Saint Pierre and Miquelon", region: "Northern America" },
    { name: "Serbia", region: "Europe" },
    { name: "South Sudan", region: "Africa" },
    { name: "São Tomé and Príncipe", region: "Africa" },
    { name: "Suriname", region: "South America" },
    { name: "Slovakia", region: "Europe" },
    { name: "Slovenia", region: "Europe" },
    { name: "Sweden", region: "Europe" },
    { name: "Swaziland", region: "Africa" },
    { name: "Sint Maarten", region: "Northern America" },
    { name: "Seychelles", region: "Africa" },
    { name: "Syria", region: "Asia" },
    { name: "Turks and Caicos Islands", region: "Northern America" },
    { name: "Chad", region: "Africa" },
    { name: "Togo", region: "Africa" },
    { name: "Thailand", region: "Asia" },
    { name: "Tajikistan", region: "Asia" },
    { name: "Tokelau", region: "Oceania" },
    { name: "Turkmenistan", region: "Asia" },
    { name: "Timor-Leste", region: "Asia" },
    { name: "Tonga", region: "Oceania" },
    { name: "Trinidad and Tobago", region: "Northern America" },
    { name: "Tunisia", region: "Africa" },
    { name: "Turkey", region: "Asia" },
    { name: "Tuvalu", region: "Oceania" },
    { name: "Taiwan", region: "Asia" },
    { name: "Tanzania", region: "Africa" },
    { name: "Uganda", region: "Africa" },
    { name: "Ukraine", region: "Europe" },
    {
      name: "United States Minor Outlying Islands",
      region: "Northern America"
    },
    { name: "Uruguay", region: "South America" },
    { name: "United States", region: "Northern America" },
    { name: "Uzbekistan", region: "Asia" },
    { name: "Vatican City", region: "Europe" },
    { name: "Saint Vincent and the Grenadines", region: "Northern America" },
    { name: "Venezuela", region: "South America" },
    { name: "British Virgin Islands", region: "Northern America" },
    { name: "United States Virgin Islands", region: "Northern America" },
    { name: "Vietnam", region: "Asia" },
    { name: "Vanuatu", region: "Oceania" },
    { name: "Wallis and Futuna", region: "Oceania" },
    { name: "Samoa", region: "Oceania" },
    { name: "Yemen", region: "Asia" },
    { name: "South Africa", region: "Africa" },
    { name: "Zambia", region: "Africa" },
    { name: "Zimbabwe", region: "Africa" }
  ];
  cntrs = cntrs.concat([{ name: "UAE", region: "Africa" }]);
  var obj = {};
  cntrs.forEach(country => {
    obj[country.name] = country.region;
  });
  return obj;
}
