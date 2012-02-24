/**
 * @fileoverview Provides basic App functionality and linkage to
 * the global 'tui' component
 */

define(['oop/inherit', 'oop/ievent', 'tui/tui'], function(inherit, EventBase, TUI){
    
    /**
     * Basic app sceleton
     * @param {Object} The App settings as an object, at least a name should
     *  be provided
     * @constructor
     */
	var App = function(options) {
		EventBase.call(this);
		this.setName(options?options.name:null);
		this.registerWithTUI();
	};
    
    /**
     * Inherit from the eventaable objects, which in turn inherit from the 
     * disposable object. This add very little overhead
     */
	inherit(App, EventBase);
    
    /**
     * Provide default name should someone forget to pas it to the constructor
     * @type {string}
     */
	App.prototype.name = 'UnnamedApp';
    
    /**
     * Internally called function, sets the name of the app
     * @param {string} name The app name identificator
     */
	App.prototype.setName = function(name) {
		if (typeof name === 'string') {
			this.name = name;
		}
	};
	
    /**
     * Adds handler for start-ready signal to all apps, once an app is ready
     * it should notify the global manager object
     * This method is called from the constructor. If your app does not call
     * the default App constructor and only inherits it, your custom constructor
     * should call this function for your app to be able to start from global 
     * context (tui)
     */
	App.prototype.registerWithTUI = function() {
		this.on('start-ready', this.setStateReady);
	};
    
    /**
     * Notifies the global manager/controller for app readiness
     * This works as follows: once your app is ready to be called (i.e. it
     * can process 'Start') it notifies the global controller (tui in this case)
     * for it providing its name. Note that the name should match the one that
     * is provided in the app list description file as the controller will
     * look up if your app by its name and check if it is still the required app
     * on the time your app is ready and if yes it will call your app's Start 
     * method. 
     */
	App.prototype.setStateReady = function() {
		TUI.getInstance().handleAppSignals('ready', {
			name : this.name
		});
	};
    
    /**
     * Override method for cleanup
     */
	App.prototype.disposeInternal = function() {
		App.superClass_.disposeInternal.call(this);
		delete this.name;
	};
    
    /**
     * Expose your app as module
     */
	return App;
})
