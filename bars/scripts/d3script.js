/*  

This code is based on following convention:

https://github.com/bumbeishvili/d3-coding-conventions/blob/84b538fa99e43647d0d4717247d7b650cb9049eb/README.md


*/

function Chart() {
	// Exposed variables
	var attrs = {
		id: 'ID' + Math.floor(Math.random() * 1000000), // Id for event handlings
		svgWidth: 400,
		svgHeight: 400,
		marginTop: 5,
		marginBottom: 35,
		marginRight: 65,
		marginLeft: 35,
		container: 'body',
		defaultTextFill: '#2C3E50',
		defaultFont: 'Helvetica',
		data: null,
		props: ['total', 'rejected', 'accepted', 'percentTotal'],
		currentProp: 'total'
	};

	//InnerFunctions which will update visuals
	var updateData;

	//Main chart object
	var main = function () {
		//Drawing containers
		var container = d3.select(attrs.container);
		var containerRect = container.node().getBoundingClientRect();
		if (containerRect.width > 0) attrs.svgWidth = containerRect.width;

		//Calculated properties
		var calc = {};
		calc.id = 'ID' + Math.floor(Math.random() * 1000000); // id for event handlings
		calc.chartLeftMargin = attrs.marginLeft;
		calc.chartTopMargin = attrs.marginTop;
		calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
		calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;


		const grouped = group(attrs.data).by(d => d.Country_Name_EN).run();


		const finalData = grouped.map(d => {
			return {
				id: d.key,
				name: d.key,
				total: d3.sum(d.values.map(v => +v.rejected + (+v.Accepted))),
				rejected: d3.sum(d.values.map(v => +v.rejected)),
				accepted: d3.sum(d.values.map(v => +v.Accepted)),
			}
		})
			.map(d => {
				return Object.assign(d, { percentTotal: d.accepted / d.total * 100 })
			})
			.map(d => {
				return Object.assign(d, { percentTotal: isNaN(d.percentTotal) ? '' : d.percentTotal })
			});

		const minMargin = 10;
		calc.eachBarHeight = calc.chartHeight / finalData.length - minMargin;

		if (calc.eachBarHeight < 4) {
			calc.eachBarHeight = 4;
		}

		const scales = {};
		attrs.props.forEach(prop => {
			const data = finalData.map(d => d[prop]);
			const max = d3.max(data);
			const scale = d3.scaleLinear().domain([0, max]).range([0, calc.chartWidth / 4 * 3]);
			scales[prop] = scale;
		})

		finalData.sort((a, b) => {
			return a[attrs.currentProp] < b[attrs.currentProp] ? 1 : -1;
		})
		finalData.forEach((d, i) => {
			d.order = i;
		})


		const axis = d3.axisBottom(scales[attrs.currentProp])
			.ticks(2)
			.tickSize(-calc.chartHeight)



		//Add svg
		var svg = container
			.patternify({ tag: 'svg', selector: 'svg-chart-container' })
			.attr('width', attrs.svgWidth)
			.attr('height', attrs.svgHeight)
			.attr('font-family', attrs.defaultFont);



		var defs = svg.patternify({ tag: "defs", selector: "defs" + 1 })

		// create filter with id #drop-shadow
		// height=130% so that the shadow is not clipped
		var filter = defs.patternify({ tag: "filter", selector: "filter" + 5 })
			.attr("id", "drop-shadow")
			.attr("height", "250%")
			.attr("width", "250%");

		// SourceAlpha refers to opacity of graphic that this filter will be applied to
		// convolve that with a Gaussian with standard deviation 3 and store result
		// in blur
		filter.patternify({ tag: "feGaussianBlur", selector: "feGaussianBlur" + 12 })
			.attr("in", "SourceAlpha")
			.attr("stdDeviation", 5)
			.attr("result", "blur");

		// translate output of Gaussian blur to the right and downwards with 2px
		// store result in offsetBlur
		filter.patternify({ tag: "feOffset", selector: "feOffset" + 19 })
			.attr("in", "blur")
			.attr("dx", 5)
			.attr("dy", 5)
			.attr("result", "offsetBlur");

		// overlay original SourceGraphic over translated blurred opacity by using
		// feMerge filter. Order of specifying inputs is important!
		var feMerge = filter.patternify({ tag: "feMerge", selector: "feMerge" + 27 })

		feMerge.patternify({ tag: "feMergeNode", selector: "feMergeNode" + 29 })
			.attr("in", "offsetBlur")
		feMerge.patternify({ tag: "feMergeNode", selector: "feMergeNode" + 31 })
			.attr("in", "SourceGraphic");



		//Add container g element
		var chart = svg
			.patternify({ tag: 'g', selector: 'chart' })
			.attr('transform', 'translate(' + calc.chartLeftMargin + ',' + calc.chartTopMargin + ')');


		const axisWrapper = chart.patternify({ tag: 'g', 'selector': 'axis-wrapper' })
			.attr('transform', `translate(${0},${calc.chartHeight})`)
		axisWrapper.call(axis);

		chart.selectAll('.tick line')
			.attr('stroke', '#6A737F')
			.attr('stroke-width', 0.5)
			.each(function (d, i, arr) {
				if (i) return;
				d3.select(this).remove();
			})

		axisWrapper.selectAll('text').attr('fill', '#6A737F').attr('font-size', 13)

		chart.selectAll('.domain').remove();

		chart.patternify({ tag: 'rect', 'selector': 'axis-rect' })
			.attr('y', calc.chartHeight)
			.attr('fill', '#6A737F')
			.attr('width', calc.chartWidth)
			.attr('height', 1)


		const rects = chart.patternify({ tag: 'rect', selector: 'rect-symbol', data: finalData })
			.attr('height', calc.eachBarHeight)
			.attr('width', d => {
				const w = scales[attrs.currentProp](d[attrs.currentProp]);
				return w;
			})
			.attr('fill', (d, i, arr) => {
				return d3.rgb('#00FEC9').darker(i / arr.length * 5)
			})
			.attr('y', (d, i) => i * (calc.eachBarHeight + minMargin))
			.style("filter", "url(#drop-shadow)")

		const barTexts = chart.patternify({ tag: 'text', selector: 'rect-text', data: finalData })
			.attr('x', d => {
				const w = scales[attrs.currentProp](d[attrs.currentProp]);
				return w + 10;
			})
			.attr('y', (d, i) => i * (calc.eachBarHeight + minMargin) + calc.eachBarHeight / 2)
			.text(d => d.name + ` -    ${d[attrs.currentProp]} `)
			.attr('fill', '#00E6B4')
			.attr('font-size', 13)
			.attr('alignment-baseline', 'middle')


		function changeBars() {

			finalData.sort((a, b) => {
				return a[attrs.currentProp] < b[attrs.currentProp] ? 1 : -1;
			})

			finalData.forEach((d, i) => {
				d.order = i;
			})

			rects
				.transition()
				.duration(1000)
				.delay((d, i, arr) => 1000 / arr.length * i)
				.attr('width', d => {
					let w = scales[attrs.currentProp](d[attrs.currentProp]);
					if (isNaN(w)) {
						w = 0;
					}
					return w;
				})
				.attr('fill', (d, i, arr) => {
					return d3.rgb('#00FEC9').darker(d.order / arr.length * 5)
				})
				.attr('y', (d, i) => d.order * (calc.eachBarHeight + minMargin))

			barTexts
				.transition()
				.duration(1000)
				.delay((d, i, arr) => 1000 / arr.length * i)
				.attr('x', d => {
					let w = scales[attrs.currentProp](d[attrs.currentProp]);
					if (isNaN(w)) {
						w = 0;
					}
					return w + 10;
				})
				.attr('y', (d, i) => d.order * (calc.eachBarHeight + minMargin) + calc.eachBarHeight / 2)
				.text(d => d.name + ` -    ${d[attrs.currentProp]} `)

			const newAxis = axis.scale(scales[attrs.currentProp]);
			axisWrapper.transition()
				.duration(1000).call(newAxis)

			chart.selectAll('.tick line')
				.attr('stroke', '#6A737F')
				.attr('stroke-width', 0.5)

			axisWrapper.selectAll('text').attr('fill', '#6A737F').attr('font-size', 13)

			chart.selectAll('.domain').remove();
		}


		d3.selectAll('.filters')
			.on('click', function (d) {
				d3.selectAll('.filters').classed('active', false)
				d3.select(this).classed('active', true)
				const prop = d3.select(this).attr('data-prop');
				attrs.currentProp = prop;
				changeBars();
			})

		//#########################################  UTIL FUNCS ##################################

		d3.select(window).on('resize.' + attrs.id, function () {
			var containerRect = container.node().getBoundingClientRect();
			if (containerRect.width > 0) attrs.svgWidth = containerRect.width;
			main();
		});
	};

	//----------- PROTOTYPE FUNCTIONS  ----------------------
	d3.selection.prototype.patternify = function (params) {
		var container = this;
		var selector = params.selector;
		var elementTag = params.tag;
		var data = params.data || [selector];

		// Pattern in action
		var selection = container.selectAll('.' + selector).data(data, (d, i) => {
			if (typeof d === 'object') {
				if (d.id) {
					return d.id;
				}
			}
			return i;
		});
		selection.exit().remove();
		selection = selection.enter().append(elementTag).merge(selection);
		selection.attr('class', selector);
		return selection;
	};

	//Dynamic keys functions
	Object.keys(attrs).forEach((key) => {
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

	//Set attrs as property
	main.attrs = attrs;

	//Exposed update functions
	main.data = function (value) {
		if (!arguments.length) return attrs.data;
		attrs.data = value;
		if (typeof updateData === 'function') {
			updateData();
		}
		return main;
	};

	// Run  visual
	main.render = function () {
		main();
		return main;
	};

	return main;
}


function group(arr) {
	const operations = [];
	const initialData = arr;
	const resultObj = {};
	let resultArr;
	let sort = function (a, b) {
		return a.values.length < b.values.length ? 1 : -1
	}

	group.by = function (groupFuncs) {
		const length = arguments.length;

		for (let j = 0; j < initialData.length; j++) {
			const dataObj = initialData[j];
			const keys = [];
			for (let i = 0; i < length; i++) {
				const key = arguments[i];
				keys.push(key(dataObj, j));
			}
			const strKey = JSON.stringify(keys);
			if (!resultObj[strKey]) {
				resultObj[strKey] = [];
			}
			resultObj[strKey].push(dataObj)
		}
		operations.push('by')
		return group;
	}

	group.orderBy = function (func) {
		sort = function (a, b) {
			var a = func(a);
			var b = func(b);
			if (typeof a === 'string' || a instanceof String) {
				return a.localeCompare(b);
			}
			return a - b;
		};
		operations.push('orderBy')
		return group;
	}

	group.orderByDescending = function (func) {
		sort = function (a, b) {
			var a = func(a);
			var b = func(b);
			if (typeof a === 'string' || a instanceof String) {
				return a.localeCompare(b);
			}
			return b - a;
		};
		operations.push('orderByDescending')
		return group;
	}

	group.sort = function (v) {
		sort = v;
		operations.push('sort')
		return group;
	}
	group.run = function () {
		operations.forEach(operation => {
			console.log(operation);
		})
		resultArr = Object
			.keys(resultObj)
			.map(k => {
				const result = {}
				const keys = JSON.parse(k);
				if (keys.length == 1) {
					result.key = keys[0];
				} else {
					result.keys = keys
				}
				result.values = resultObj[k]
				return result;
			});

		if (sort) {
			resultArr.sort(sort);
		}
		return resultArr;
	}

	return group;
}
