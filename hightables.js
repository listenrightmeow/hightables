var Hightable = Fidel.declare({
	defaults : {
		datetimeFormat : '%e of %b',
		graphSteps : 12
	},
	elements : {
		caption : 'caption',
		highColumn : '.high_column',
		highLine : '.high_line',
		highPie : '.high_pie',
		th : 'thead tr th',
		tr : 'tbody tr'
	},
	init : function() {
		var self = this,
			el  = this.elements,
			els = [el.highColumn, el.highLine, el.highPie];

		app.chart = [];

		$.map(els, function(node){
			if($(node).length < 1) return true;

			$(node).each(function() {
				var id = this.id.split('_')[0];
				switch(node) {
					case el.highColumn :
						self.visualizeColumn(id);
						break;
					case el.highLine :
						self.visualizeLine(id);
						break;
					case el.highPie :
						self.visualizePie(id);
						break;
				}
			});
		});
	},
	setData : function(data) {
		app.data = {};

		for (var i = 0; i < data.length; i++) {
			var label = data[i].name.toLowerCase(),
				key = (app.data.hasOwnProperty(label)) ? label + label.match(/[^\w]*(\d+)/)[0] : label;

			app.data[key] = data[i];
		}
	},
	visualizeColumn : function(node) {
		var options,
			categories = [],
			data = [],
			series = [],
			table = $('#' + node + '_table'),
			el = this.elements;

		$(el.th, table).each(function(i){
			categories.push($(this).text().replace(/\s\W.\d.*/,''));
		});

		$(el.tr, table).each(function(i){
			var tr = this,
				title,
				data = [];

			$('th, td', tr).each( function(j) {
				if (j === 0) {
					title = $(this).text();
				} else {
					var arr = data.data;

					if (arr)
						arr.push(parseFloat($(this).text()));
					else
						arr = [parseFloat($(this).text())];

					data = {
						name: title,
						data: arr
					}
				}
			});

			series.push(data); 
		});

		options = this.setOptions(node, table);
		options.chart.type = 'column';
		options.plotOptions.column = { stacking : 'normal', cursor : 'pointer '};
		options.xAxis = { categories : categories };
		options.yAxis = { min : 0, title : { text : '' } };
		options.series = series;

		if(this.hasOwnProperty('options')) {
			for (var prop in this.options) {
				options[prop] = this.options[prop];
			}
		}

		app.chart.push(new Highcharts.Chart(options));
		this.setData(series);
	},
	visualizeLine : function(node,labels) {
		var options,
			datetime = false,
			labels = [],
			series = [],
			categories = {},
			el = this.elements,
			table = $('#' + node + '_table'),
			graphSteps = (labels) ? labels : this.defaults.graphSteps;

		$(el.th, table).each(function(){
			var category = (table.hasClass('dataTable')) ? $(this).attr('aria-label').replace(/([\s|:].+)\s*/,'') : $(this).text().replace(/\s\W.\d.*/,'');

			categories[category] = [];
			labels.push(category);
		});

		$(el.tr, table).each(function(){
			var tr = $(this);

			$('td', tr).each(function(i){
				var data = (/\D/.test($(this).text())) ? +new Date($(this).text()) : parseInt($(this).text(), 10);
				categories[labels[i % labels.length]].push(data);
			});
		});

		for (var prop in categories) {
			if(prop.match(/\b(date|hour)\b/i)) {
				datetime = true;
				continue;
			}

			if(categories.hasOwnProperty('Date'))
				series.push({
					name : prop,
					data : categories[prop],
					pointStart : categories.Date[0],
					pointInterval : 24 * 3600 * 1000
				});
			else
				series.push({
					name : prop,
					data : categories[prop]
				});
		}

		options = this.setOptions(node, table);
		options.chart.type = 'line';
		options.tooltip = {
			formatter: function() {
				if(this.percentage == null)
					return '<b>'+ this.series.name +'</b>: ' + this.y;	
				else
					return '<b>'+ this.series.name +'</b>: '+ this.percentage.toFixed(1) +' %';
			}
		};
		options.plotOptions.line = { marker : { enabled : false } };
		options.xAxis = (datetime) ? { type : 'datetime', dateTimeLabelFormats : { day : this.defaults.datetimeFormat } } : { categories : labels, labels : { step : graphSteps } };
        options.series = series;

		if(this.hasOwnProperty('options')) {
			for (var prop in this.options) {
				options[prop] = this.options[prop];
			}
		}

        app.chart.push(new Highcharts.Chart(options));
		this.setData(series);
	},
	visualizePie : function(node) {
		var options,
			labels = [],
			series = [],
			categories = {},
			el = this.elements,
			table = $('#' + node + '_table');

		$(el.th, table).each(function(){
			var category = (table.hasClass('dataTable')) ? $(this).attr('aria-label').replace(/([\s|:].+)\s*/,'') : $(this).text().replace(/\s\W.\d.*/,'');

			categories[category] = [];
			labels.push(category);
		});

		$(el.tr, table).each(function(){
			var tr = $(this);

			$('td', tr).each(function(i){
				var data = (/\D/.test($(this).text())) ? +new Date($(this).text()) : parseInt($(this).text(), 10);
				categories[labels[i % labels.length]].push(data);
			});
		});

		for (var prop in categories) {
			series.push({
				name : prop,
				y : categories[prop][0],
				sliced : (series.length === 0) ? true : false,
				selected : (series.length === 0) ? true : false
			});
		}

		options = this.setOptions(node, table);
		options.chart.type = 'pie';
		options.plotOptions.pie = {
			allowPointSelect : true,
			cursor : 'pointer'
		};
		options.tooltip = {
			pointFormat: '{series.name} : <b>{point.percentage}%</b>',
			percentageDecimals: 1
		};
		options.series = [{
			type : 'pie',
			name : '',
			data : series
		}];

		if(this.hasOwnProperty('options')) {
			for (var prop in this.options) {
				options[prop] = this.options[prop];
			}
		}

		app.chart.push(new Highcharts.Chart(options));
		this.setData(series);
	},
	setOptions : function(node, table) {
		return {
			chart : {
				renderTo : node + '_chart'
			},
			credits : { enabled : false },
			tooltip: {
				formatter: function() {
					return '<b>'+ this.x +'</b>: '+ this.percentage.toFixed(1) +' %';
				}
			},
			plotOptions: {},
			yAxis: {
				min : 0,
				title : { text : '' },
				stackLabels : { enabled : false },
				labels : { enabled : false },
				endOnTick : false,
			},
			title : { text : $(this.elements.caption, table).text() }
		}
	}
});