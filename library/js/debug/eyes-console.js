/**
 * @fileoverview Provides node console with color support via npm
 * Install eyes with npm install eyes
 * 
 * Use only in node environment
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
	'oop/inherit',
	'debug/simple-console',
	'debug/log-formaters',
	'debug/log-keeper',
	'eyes'
],function(inherit, SimpleConsole, LogFormatters, LogKeeper, eyes) {
	
	/**
	 * Tame the eyes, set the stream to null so we get the output and put it
	 * in our stream_
	 */
	eyes.stream = null;
	function eyesFormatter( obj )  {
		return eyes.inspect( obj, undefined, {
			stream: null
		});
	}
	/**
	* Add some nice formatting 
	*/
	function putName( name ) {
		if ( name.indexOf("'") === -1 )
			return '[\'' + name + '\']: ';
		return '['+ name +']: ';
	}
	function putError( str ) {
		return putName(eyes.stylize( str, 'red', eyes.defaults.styles)) ;
	}
	function putInfo( str ) {
		return putName(eyes.stylize( str , 'blue', eyes.defaults.styles)); 
	}
	function putWarn( str ) {
		return putName( eyes.stylize( str, 'yellow', eyes.defaults.styles));
	}
	function putFine( str ) {
		return putName( eyesFormatter( str ) );
	}
	function putOk( str ) {
		return putName( str );
	}
	/**
	 * Augment the imple console, with out formatter using node eyes
	 * 
	 * @costructor
	 */
	var EyesConsole = function() {
		SimpleConsole.call(this);
		this.formatter_ = eyesFormatter;
	};
	inherit( EyesConsole, SimpleConsole );
	
	/**
	 * Override the method so special care is taken of the formatting of the 
	 * output especially for node js env
	 * @param {Object} log_record The record we want to display
	 */
	EyesConsole.prototype.putRecord = function( log_record ) {
		
		var msg = LogFormatters.webkitConsole( log_record );
		var result = [ '[' + LogFormatters.getRelativeTime(log_record) + ']' ];
		var name = msg[0];
		
		switch ( log_record.getLevel() ) {
			case LogKeeper.Levels.ERROR:
				name = putError( name );
				break;
			case LogKeeper.Levels.INFO:
				name = putInfo( name );
				break;
			case LogKeeper.Levels.WARN:
				name = putWarn( name );
				break;
			case LogKeeper.Levels.FINE:
				name = putFine( name );
			default:
				name = putOk( name );
				break;
		}
		result.push( name );
		for (var i = 1; i < msg.length; i++ ) {
			result.push(this.formatter_(msg[i]));
			if ( i + 1 < msg.length) result.push(', ');
		}
		this.stream_.log( result.join('') );
	};
	
	return EyesConsole;
});
