/**
 * @fileoverview Implementation for sceleton app that provides the methods for
 * the global controler (Start, Stop, Pause, Show)
 * If your app is ever to be started (i.e. do actively interact with the
 * user it should inherit from this class)
 */

define([
	'oop/inherit',
	'utils/defaultapp',
	'utils/events'
], function(inherit, Defaultapp, events) {
    
    /**
     * Wrapper for the default app, that adds the controller layer methods
     * @constructor 
     * @param {Object} options The app options as object, should at least 
     *  contain the 'name' property
     */
	var VisualApp = function(options) {
		Defaultapp.call(this, options);
	};
    
    /** @inherit from defaultapp */
	inherit(VisualApp, Defaultapp);
	
    /**
     * As visual app it should always have a container
     * @type {HTMLElement}
     */
	VisualApp.prototype.container = null;
    
    /**
     * Default start method for Apps
     */
	VisualApp.prototype.Start = function() {
		this.fire('start-requested');
	};
    
    /**
     * Default show method for apps, will sed the container without checks
     * @param {HTMLElement}
     */
	VisualApp.prototype.Show = function(container) {
		this.container = container;
		this.fire('show-requested');
	};
    
    /**
     * Default stop methos for apps
     */
	VisualApp.prototype.Stop = function(){
		this.fire('stop-requested');
	};
    
    /** @override */
	VisualApp.prototype.disposeInternal = function() {
		this.constructor.superClass_.disposeInternal.call(this);
		if (this.container !== null) {
			delete this.container;
		}
	};
    
    /**
     * Convenience method for attaching the events handler of your app
     * to the global event processor. It assumes you have defined your
     * events in a property appEvents
     * 
     * @type {boolean} bool SHould the events be attached or detached
     */
	VisualApp.prototype.attachEvents = function(bool) {
		if (typeof this.appEvents  === 'object') {
			if (bool)
				events.addHandlers(this.appEvents);
			else { 
				events.removeHandlers(this.appEvents);
			}
		}
	};
	return VisualApp;
});
