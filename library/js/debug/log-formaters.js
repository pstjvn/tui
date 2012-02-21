/**
 * @fileoverview Provide formatters for the *Console objects
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
	'debug/time-provider',
	'string/strings',
	'debug/expose'
], function(TimeProvider, Strings, expose) {
	
	function Echo(record) {
		return record;
	}

	function JSONStringify(record) {
		return JSON.stringify(record);
	}
	
	function getRelativeTime( log_record ) {
		var ms = (+log_record.getTime()) - (+TimeProvider.get());
		var sec = ms / 1000;
		var str = sec.toFixed(3);

		var spacesToPrepend = 0;
		if (sec < 1) {
			spacesToPrepend = 2;
		} else {
			while (sec < 100) {
				spacesToPrepend++;
				sec *= 10;
			}
		}
		while (spacesToPrepend-- > 0) {
			str = ' ' + str;
		}
		return str;
	}
	
	function Console( log_record ) {
		var msg = Array.prototype.slice.call(log_record.getMessage(), 0);
		Array.prototype.unshift.call(msg, log_record.getLoggerName());
		return msg;
	}
	
	function htmlize( record ) {
		var buffer_ = [], i;
		buffer_.push('<span class="dbg-timestamp">[' + record[0]  + ']</span>');
		buffer_.push('<span class="dbg-logger-name">' + record[1] + '</span>');
		buffer_.push('<span class="dbg-log-record">');
		for ( i = 2; i < record.length; i++ ) {
			switch (typeof record[i]) {
				case 'number':
				case 'string':
				case 'boolean':
					buffer_.push(record[i].toString());
					break;
				case 'object':
					if ( record[i] instanceof Array ) {
						buffer_.push(record[i].toString());
					} else if ( record[i] === null ) {
						buffer_.push('NULL');
					} else {
						buffer_.push(Strings.newLineToBr(expose(record[i])));
					}
					break;
				default:
					console.log('wtf?', record[i]);
					break;
			}
			if ( i < record.length - 1) {
				buffer_.push(', ');
			}
		}
		buffer_.push('</span>');
		return buffer_.join('');
	}
	
	function browserify( log_record ) {
		var result = Console( log_record );
		result[0] = '[' + result[0] + ']: ';
		Array.prototype.unshift.call(result, getRelativeTime(log_record));
		return result;		
	}
	
	function consolify( obj ) {
		switch (typeof obj ) {
			case 'undefined':
				return 'UNDEFINED';
			case 'object':
				return expose( obj );
			case 'boolean':
				return (obj) ? 'TRUE': 'FALSE';
			default: return obj;
		}
	}
	
	function textify( log_record ) {
		var log_array = browserify( log_record );
		log_array.unshift( 'LEVEL-' + log_record.getLevel() );
		for ( var i = 0; i < log_array.length; i++ ) {
			log_array[i] = consolify( log_array[i] );
		}
		return log_array;		
	}
	
	return {
		echo: Echo,
		json: JSONStringify,
		webkitConsole: Console,
		browser: browserify,
		html: function( log_record ) {
			return htmlize( browserify( log_record ) );
		},
		text: textify,
		getRelativeTime: getRelativeTime
	};
});
