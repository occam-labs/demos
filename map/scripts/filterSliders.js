var tooltipSliderRent = document.getElementById("slider-tooltips-rent");

var saleSlider = noUiSlider.create(
  document.getElementById("slider-tooltips-sale"),
  {
    start: [0, 200],
    tooltips: [true, true],
    format: {
      to: function(value) {
        return Math.round(value) + " $";
      },
      from: function(value) {
        return value.replace(",-", "");
      }
    },
    range: {
      min: 0,
      max: 200
    }
  }
);

var rentSlider = noUiSlider.create(tooltipSliderRent, {
  start: [0, 200],
  tooltips: [true, true],
  format: {
    to: function(value) {
      return Math.round(value) + " $";
    },
    from: function(value) {
      return value.replace(",-", "");
    }
  },
  range: {
    min: 0,
    max: 200
  }
});
