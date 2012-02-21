/**
 * @fileoverview Provides LogRecord interface, that allows collection of logs
 * to happen even when there is no log output available
 */

/**
 * Include boilerplate for node with amdefine
 * This way the code can be tested on nodejs, i.e. faster and easier than
 * on the browser
 */
if (typeof define !== 'function') { 
    var define = require('amdefine')(module); 
}


define(function() {

	var LogKeeper = function() {
		this.logRecords = [];
		this.pointer = 0;
		this.logLevel = LogKeeper.Levels.ALL;
		this.console = null;
	};

	LogKeeper.prototype.maxRecords = 100;

	LogKeeper.prototype.setLogLevel = function( level ) {
		if ( level < 0 ) level = 0;
		this.logLevel = level;
	};

	LogKeeper.prototype.addRecord = function(log_record) {
		if ( log_record.getLevel() >= this.logLevel ) {
			if ( this.console !== null ) {
				this.console.putRecord( log_record );
				// Clean up
				log_record.dispose();
			} else {
				if (this.logRecords.length >= this.maxRecords) {
					this.logRecords[this.pointer] = log_record;
					this.pointer++;
				} else {
					this.logRecords.push(log_record);
				}
			}
		}
	};

	LogKeeper.prototype.setConsole = function( con ) {
		var i;
		this.console = con;
		if ( this.logRecords.length > 0 ) {
			for ( i = this.pointer; i < this.logRecords.length; i++ ) {
				this.console.putRecord( this.logRecords[ i ] );
				//Clean up
				this.logRecords[ i ].dispose();
			}
			if ( this.pointer > 0 ) {
				for ( i = 0; i < this.pointer; i++ ) {
					this.console.putRecord( this.logRecords[ i ] );
					//Clean up
					this.logRecords[ i ].dispose();
				}
			}
		}
		delete this.logRecords;
		delete this.pointer;
	};

	LogKeeper.Levels = {
		ALL: 0,
		OK: 1,
		FINE: 2,
		INFO: 3,
		WARN: 4,
		ERROR: 5,
		SHOUT: 100,
		NONE: 999999
	};

	LogKeeper.getInstance = function() {
		var Instance = new LogKeeper();
		LogKeeper.getInstance = function() {
			return Instance;
		};
		return Instance;
	};
	return LogKeeper;
});
