/**
 * @fileoverview Implements weather app, taking weatherbug's API into the 
 * Tornado UI
 * 
 * Sysmaster's Tornado M55 device supports configuring a weather station
 * code in their config panel (working in a PC browser) so one can
 * configure its weather report from there
 */

define([
	'oop/inherit',
	'utils/visualapp',
	'shims/bind',
	'env/exports',
	'loader/loader',
	'tpl/weather',
	'transport/request',
	'transport/grouprequest',
	'paths/jsonpaths'
], function(inherit, VisualApp, bind, exports, loader, template, request, 
	GroupRequest, jpaths){
	/**
	 * The type of usints to use, 1 for Celsius, 0 for farenheight
	 * @type {string}
	 */
	var units_ = '1';
	/**
	 * The city code to use, codes used are the international city codes
	 * as per the WeatherBug's international city code listing
	 * @type {string}
	 */
	var city_ = '104164';
    
	var Weather = function(options) {
		VisualApp.call(this, options);
		this.forecast = null;
		this.location = null;
		this.on('start-requested', this.onStartRequested);
		this.on('show-requested', this.onShowRequested);
		this.on('stop-requested', this.onStopRequested);
	};
    /** @inerit VisualApp to allow controller interaction */
	inherit(Weather, VisualApp);
	
    /**
     * Clean up the container when stopping
     */
	Weather.prototype.onStopRequested = function() {
		this.container.innerHTML = '';
	};
	
    /**
     * Start has been called from the controller, take action
     */
	Weather.prototype.onStartRequested = function() {
//		fetch data if we do not have it yet
		if (this.forecast === null || this.location === null) {
			this.loadData();
		} else {
			this.fire('start-ready');
		}
	};
	Weather.prototype.cityLoaded_ = false;
	Weather.prototype.unitsLoaded_ = false;
	Weather.prototype.loadJSON = function(results) {
		if (results[0].status.toLowerCase()==='ok') {
			this.city = results[0].content;
		} else {
			this.city = city_;
		}
		if (results[1].status.toLowerCase() === 'ok' ) {
			this.units = results[1].content;
		} else {
			this.units = units_;
		}
		this.loadData([this.units, this.city]);
	};
    
	Weather.prototype.onShowRequested = function() {
		this.dom_ = template.render({
			things: this.forecast['forecastList'],
			unit: this.forecast['temperatureUnits'],
			location: this.location.location
		});
		this.container.innerHTML = this.dom_;
	};
	/**
	 * Loads the forecase information from weatherbug, this require network
	 * access. Errors are not handled yet
	 * TODO: Handle errors from wb
	 */
	Weather.prototype.loadData = function(data) {
		if (data) {
			loader.loadJSONP('weatherlocation', 
                'http://i.wxbug.net/REST/Direct/GetLocation.ashx?api_key=u2bwf83unq43dt66ugm6t2fa&nf&f=exportedSymbols.weather.locationInfo&city=' + this.city);
			loader.loadJSONP('weatherinfo', 
                'http://i.wxbug.net/REST/Direct/GetForecast.ashx?api_key=u2bwf83unq43dt66ugm6t2fa&nf=4&f=exportedSymbols.weather.load&city=' + this.city + '&units='+ this.units);
			return;
		}
//        Support getting settings from Tornado settings storage
		var req = request.create('calld', jpaths.getPath(this.name, 'units'));
		var req2 = request.create('calld', jpaths.getPath(this.name, 'city'));
		new GroupRequest(bind(this.loadJSON, this), req2, req);
	};
	
    /**
     * Handler for the JSON response from weatherbug for location information
     * @param {JSONObject} json Response
     */
	Weather.prototype.setLocationInfo = function(json) {
		this.location = json;
		if (this.forecast !== null) {
			this.fire('start-ready');
		}
	};
	/**
	 * Use this method for error handling on data load errors
	 * TODO: implement method where no data is returnedb by server
	 */ 		
	Weather.prototype.noDataLoaded = function() {};
	
    /**
     * Load the data from WeatherBug as JSON obj and process it
     * @param {Object} jsonobj 
     */
	Weather.prototype.load = function(jsonobj) {
		if (jsonobj === null) {
			this.noDataLoaded();
			return;
		}
		this.forecast = jsonobj;
		var pred;
		for (var i = 0; i < this.forecast['forecastList'].length; i++) {
			pred = this.forecast['forecastList'][i].dayPred;
			if (/feels-like temperature of (.*)$/.exec(pred) !== null) {
	        	this.forecast['forecastList'][i].feelslike = /feels-like temperature of (.*)$/.exec(pred)[1];
	        }
	        if (/[wW]inds ([^\.]*)/.exec(pred) !== null){
				this.forecast['forecastList'][i].wind = /[wW]inds ([^\.]*)/.exec(pred)[1];
			}
			if (/ ([0-9]*%) /.exec(pred) !== null) {
	    		this.forecast['forecastList'][i].humidity = / ([0-9]*%) /.exec(pred)[1];
			}
		}
		if (this.location !== null)	this.fire('start-ready');
	};
    /** @override */
	Weather.prototype.disposeInternal = function() {
		Weather.superClass_.disposeInternal.call(this);
		delete this.dom_;
		delete this.forecast;
		delete this.location;
		delete this.city;
		delete this.units;
		delete this.cityLoaded_;
		delete this.unitsLoaded_;
	};
    
    return {
    	instance: null,
    	init: function() {
    		if (this.instance === null ) {
    			this.instance = new Weather({
					name: 'weather'
				});
				/**
				 * Export global symbols for loading the JSONP requests to weatherbug
				 * Load the forcast
				 */
				exports.exportSymbol('weather', {
					name: 'load',
					symbol: bind(this.instance.load, this.instance)
				});
		
				/**
				 * Export global symbols for loading the JSONP requests to weatherbug
				 * Load the station information
				 */
				exports.exportSymbol('weather', {
					name: 'locationInfo',
					symbol: bind(this.instance.setLocationInfo, this.instance)
				});
			}
			return this.instance;
		}
	};
});
