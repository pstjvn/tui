/**
 * @fileoverview Small class wrapper on Date to allow simpler work with date
 * strings to use with EPG
 */
define(function() {
	/**
	 * @constructor
	 * @param {Xdate|Date|number|string<0-9>|undefined} dt The time 
	 	to instanciate
	 */
	var Xdate = function( dt ) {
		if ( dt instanceof Date) this.date_ = dt;
		else {
			switch ( typeof dt ) {
				case 'undefined':
					this.date_ = new Date();
					break;
				case 'number':
					this.date_ = new Date(dt);
					break;
				case 'string':
					dt = parseInt(dt, 10);
					if ( !isNaN(dt) ) {
						this.date_ = new Date(dt);
					} else {
						throw Error('Cannot create Xdate');
					}
					break;
				default:
					throw Error('Cannot create Xdate Object');
			}
		}
		this.timeAsNumber_ = this.date_.getTime();
	};
	Xdate.prototype.anHour = 1000*60*60;
	Xdate.prototype.aMinute = 1000*60;
	/**
	 * Utility function to retrieve the full time prior or past the
	 * instance time
	 * @param {number} type The trimming type, hours or minutes
	 * @return {Xdate}
	 */
	Xdate.prototype.getRoundedTime = function( type ) {
		switch ( type ) {
			case Xdate.ROUNDERS.PRIOR_FULL_HOUR:
				return new Xdate( this.timeAsNumber_ - ( this.timeAsNumber_ % this.anHour ));
			case Xdate.ROUNDERS.PRIOR_FULL_MINUTE:
				return new Xdate( this.timeAsNumber_ - ( this.timeAsNumber_ % this.aMinute ));
		}
		throw Error('What time rounded you mean?');
	};
	/**
	 * Return the instance time as number (same as Date.getTime())
	 * @return {number}
	 */
	Xdate.prototype.getTime = function() {
		return this.timeAsNumber_;
	};
	/**
	 * Compares the instance time with arbitary time 
	 * @param {Date|number|string<0-9>|undefined} The time to compare instance
	 	time to
	 * @return {boolean}
	 */
	Xdate.prototype.isLaterThan = function( dt ) {
		var res = Xdate.compareTimes( this, dt );
		if ( res === 1) return true;
		return false;
	};
	/**
	 * Compares the instance time with arbitary time
	 * @param {Date|number|string<0-9>|undefined} The time to compare instance
	 	time to
	 * @return {boolean}
	 */
	Xdate.prototype.isEarlierThan = function( dt ) {
		var res = Xdate.compareTimes( this, dt );
		if ( res === -1 ) return true;
		return false;
	};
	/**
	 * Compares the instance time with arbitary time 
	 * @param {Date|number|string<0-9>|undefined} The time to compare instance
	 	time to
	 * @return {boolean}
	 */
	Xdate.prototype.isEarlierOrSameThan = function( dt ) {
		if  (Xdate.compareTimes( this, dt ) === 1) return false;
		return true;
	};
	/**
	 * Retrieves the hours part of the instance time filled to two simbols if
	 * needed
	 * @return {string}
	 */
	Xdate.prototype.getHours = function() {
		return Xdate.fillToTwoSimbols(this.date_.getHours());
	};
	/**
	 * Retrieves the minutes part of the instance time filled to two simbols if
	 * needed
	 * @return {string}
	 */	
	Xdate.prototype.getMinutes = function() {
		return Xdate.fillToTwoSimbols(this.date_.getMinutes());
	};
	/**
	 * Retrieves the seconds part of the instance time filled to two simbols if
	 * needed
	 * @return {string}
	 */
	Xdate.prototype.getSeconds = function() {
		return Xdate.fillToTwoSimbols(this.date_.getSeconds());
	};
	/**
	 * The rouding types
	 * @enum {number}
	 * @static
	 */
	Xdate.ROUNDERS = {
		PRIOR_FULL_HOUR: 0,
		PRIOR_FULL_MINUTE: 1
	};
	/**
	 * Some usefull constants
	 * @enum {number}
	 * @static
	 */
	Xdate.CONST = {
		MILISECONDS: 1000,
		SECONDS: 60*1000,
		MINUTES: 60*60*1000,
		HOURS: 24*60*60*1000
	};
	/**
	 * Compare two times, times are converted to Xdate instances if they are not
	 * Works same as regular compares for sorting algorythms
	 *
	 * @static
	 * @param {Xdate|Date|number|string<0-9>|undefined} time1 Time to compare
	 * @param {Xdate|Date|number|string<0-9>|undefined} time2 Time to compare
	 * @return {number}
	 */
	Xdate.compareTimes = function( time1, time2 ) {
		time1 = Xdate.convertToXdate( time1 );
		time2 = Xdate.convertToXdate( time2 );

		if ( time1.getTime() > time2.getTime() ) return 1;
		if ( time2.getTime() > time1.getTime() ) return -1;
		return 0;
	};
	/**
	 * Utility function to convert ephymeral time to Xdate instances if needed
	 *
	 * @static
	 * @param {Xdate|Date|number|string<0-9>|undefined} datetime The time
	 * @return {Xdate}
	 */
	Xdate.convertToXdate = function( datetime ) {
		if ( datetime instanceof Xdate ) return datetime;
		return new Xdate( datetime );
	};
	/**
	 * Returns the time difference in milliseconds between two times
	 *
	 * @static
	 * @param {Xdate|Date|number|string<0-9>|undefined} time1 
	 * @param {Xdate|Date|number|string<0-9>|undefined} time2 
	 * @return {number}
	 */
	Xdate.getTimeDifference = function( time1, time2 ) {
		time1 = Xdate.convertToXdate( time1 );
		time2 = Xdate.convertToXdate( time2 );
		return time2.getTime() - time1.getTime();
	};
	/**
	 * Returns the time difference in minutes between two times
	 *
	 * @static
	 * @param {Xdate|Date|number|string<0-9>|undefined} time1 
	 * @param {Xdate|Date|number|string<0-9>|undefined} time2 
	 * @return {number}
	 */	
	Xdate.getTimeDiffereceAsMinutes = function( time1, time2 ) {
		time1 = Xdate.convertToXdate( time1 );
		time2 = Xdate.convertToXdate( time2 );
		var difference = time1.getTime() - time2.getTime();
		return Math.floor( difference / Xdate.CONST.SECONDS );
	};
	/**
	 * Utility that returns instance with the current time
	 * @static
	 * @return {Xdate}
	 */
	Xdate.now = function() {
		return new Xdate( (new Date()).getTime() );
	};
	/**
	 * Sets the number representing time to two simbols length if needed
	 * Ex: 8 becomes 08, 11 is returned as 11, 0 is returned as 00
	 *
	 * @static
	 * @param {string|number};
	 * @return {string}
	 */
	Xdate.fillToTwoSimbols = function( str ) {
		str = ''+str;
		if ( str.length < 2 ) {
			str = "0" + str;
		}
		return str;
	};
	return Xdate;
});
