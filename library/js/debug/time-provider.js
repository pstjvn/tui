/**
 * Include boilerplate for node with amdefine
 * This way the code can be tested on nodejs, i.e. faster and easier than
 * on the browser
 */
if (typeof define !== 'function') { 
    var define = require('amdefine')(module); 
}

define(function() {
	var TimeProvider = function() {
		this.relativeTimeStart_ = new Date();
	};
	TimeProvider.prototype.get = function() {
		return this.relativeTimeStart_;
	};
	TimeProvider.prototype.reset = function() {
		this.set(new Date());
	};
	TimeProvider.prototype.set = function( time ) {
		this.relativeTimeStart_ = time;
	};
	return new TimeProvider();
});
