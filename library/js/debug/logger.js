/**
 * @fileoverview Provide logging abstraction for levels of logger consoles
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
	'debug/log-record'
], function(LogKeeper, LogRecord) {

	/**
	 * Simple logger
	 * @constructor
	 * @param {string} name The classname that utilizes the logger instance
	 */
	var Logger = function(name) {
		this.name = name;
	};
	
	/**
	 * Adding log record
	 * @param {number} level The log importance, higher is more important
	 * @param {*} message The log message
	 */
	Logger.prototype.addRecord = function( level, message) {
		LogKeeper.getInstance().addRecord(
			new LogRecord( level, message, this.name )
		);
	};

	/**
	 * Add new log record with priority ERROR
	 * @param {*} message The log record message
	 */
	Logger.prototype.error = function( message ) {
		this.addRecord( Logger.Levels.ERROR, arguments);
	};

	/**
	 * Add new log record with priority WANR
	 * @param {*} message The log record message
	 */
	Logger.prototype.warn = function( ) {
		this.addRecord( Logger.Levels.WARN, arguments );
	};

	/**
	 * Add new log record with priority INFO
	 * @param {*} message The log record message
	 */
	Logger.prototype.info = function() {
		this.addRecord( Logger.Levels.INFO, arguments );
	};

	/**
	 * Add new log record with priority FINE
	 * @param {*} message The log record message
	 */
	Logger.prototype.fine = function(  ) {
		this.addRecord( Logger.Levels.FINE, arguments);
	};

	/**
	 * Add new log record with priority OK
	 * @param {*} message The log record message
	 */
	Logger.prototype.ok = function( ) {
		this.addRecord( Logger.Levels.OK, arguments );
	};

	/**
	 * Enumaration of the pre-fedined log levels
	 * @type {enum.<number>}
	 */
	Logger.Levels = LogKeeper.Levels;

	return Logger;
});
