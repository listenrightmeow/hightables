# Hightables
----
A controller for Highcharts JS

## Demo

Sorry, no demo yet.

## Requirements

[Highcharts](http://www.highcharts.com/).

This example utilizes [Fidel](https://github.com/jgallen23/fidel) and requires JQuery.
Googlemap can easily be changed to support [Backbone](http://backbonejs.org/) or [Simple Javascript Inheritance by John Resig](http://ejohn.org/blog/simple-javascript-inheritance/)

## Constructor
``` js
	define(['hightables','highcharts'], function(){
		yowza.parser = new Parser({
			options : {
				legend : {
					align : 'center',
					verticalAlign : 'top'
				}
			}
		});
	});
```

## Options

All [highcharts](http://www.highcharts.com/) options are honored on instantiation.