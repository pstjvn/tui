/**
 * @fileoverview Provides basic console utility, use as intreface to
 * what a real debug console should do with remotes
 */

/**
 * Include boilerplate for node with amdefine
 * This way the code can be tested on nodejs, i.e. faster and easier than
 * on the browser
 */
if (typeof define !== 'function') { 
    var define = require('amdefine')(module); 
}

define([
	'debug/log-keeper',
    'debug/log-formaters'
],function(LogKeeper, logFormatters) {
	
	/**
	 * Simple console, tries to find the built in console and use it as out
	 * stream, includes check for window object or console object directly,
	 * to match browser and node env
	 *
	 * @constructor
	 */
	var SimpleConsole = function() {
		this.initStream_();
		this.formatter_ = logFormatters.browser;
	};
	
	/**
	 * Initiation of the stream, if no suitable console is found and error is
	 * thrown
	 */
	SimpleConsole.prototype.initStream_ = function () {
		this.stream_ =  (typeof window !== 'undefined' ) ? window.console : console;
		if ( typeof this.stream_ !== 'object'	) {
			throw Error('Console interface is not supported');
		}
	};

	/**
	 * This is the public interface method, every *Console should implement it
	 * @param {Object} log_record A record generate by Logger instance
	 */
	SimpleConsole.prototype.putRecord = function(log_record) {
		var consoleMethod;
		switch ( log_record.getLevel() ) {
			case LogKeeper.Levels.SHOUT:
			case LogKeeper.Levels.ERROR:
				consoleMethod = 'error';
				break;
			case LogKeeper.Levels.WARN:
				consoleMethod = 'warn';
				break;
			case LogKeeper.Levels.INFO:
				consoleMethod = 'info';
				break;
			default:
				consoleMethod = 'log';
		}
		this.stream_[consoleMethod].apply(this.stream_, this.formatter_(log_record));

	};

	/**
	 * Sets formatter that will format the log record approprately
	 * @param {Function}
	 */
	SimpleConsole.prototype.setFormatter = function(formatter) {
		this.formatter_ = formatter;
	};

	/**
	 * Utility function that should be inherited, it simply sets the console
	 * instance as the one used by the LogKeeper
	 */
	SimpleConsole.prototype.enable = function() {
		LogKeeper.getInstance().setConsole( this );
	};
	
	/**
	 * Exports for the module
	 */
	return SimpleConsole;
});
