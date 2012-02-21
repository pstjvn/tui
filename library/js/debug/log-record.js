/**
 * Include boilerplate for node with amdefine
 * This way the code can be tested on nodejs, i.e. faster and easier than
 * on the browser
 */
if (typeof define !== 'function') { 
    var define = require('amdefine')(module); 
}

define([
	'oop/inherit',
	'oop/disposable'
],function(inherit, Disposable) {
	/**
	* @constructor
	* @param {number} level The log level for this message
	* @param {string|number|boolean|object|array}
	* @param {string} The name of the logging instance class
	* @param {Date} opt_time The time of the log, optional
	*/
	var LogRecord = function(level, message, loggerName, opt_time) {
		Disposable.call(this);
		this.time_ = opt_time || new Date();
		this.level_ = level;
		this.loggerName_ = loggerName;
		this.msg_ = message;
	};
	inherit(LogRecord, Disposable);
	
	/**
	* Returns the lane set for this logger, the class name
	* @return {string}
	*/
	LogRecord.prototype.getLoggerName = function() {
		return this.loggerName_;
	};
	
	/**
	* Returns the log level for the record
	* @return {number}
	*/
	LogRecord.prototype.getLevel = function() {
		return this.level_;
	};
	
	/**
	* Returns the log message array submited with the logger
	* @return {Arguments|Array}
	*/
	LogRecord.prototype.getMessage = function() {
		return this.msg_;
	};
	
	/**
	* Returns the time the log record was registered
	* @return {Date}
	*/
	LogRecord.prototype.getTime = function() {
		return this.time_;
	};
	
	/**
	* Disposes of the log record properties
	*/
	LogRecord.prototype.disposeInternal = function() {
		LogRecord.superClass_.disposeInternal.call(this);
		delete this.time_;
		delete this.msg_;
		delete this.level_;
		delete this.loggerName_;
	};
	
	return LogRecord;
});
