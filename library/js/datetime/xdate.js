define(function() {
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
	Xdate.prototype.getRoundedTime = function( type ) {
		switch ( type ) {
			case Xdate.ROUNDERS.PRIOR_FULL_HOUR:
				return new Xdate( this.timeAsNumber_ - ( this.timeAsNumber_ % this.anHour ));
			case Xdate.ROUNDERS.PRIOR_FULL_MINUTE:
				return new Xdate( this.timeAsNumber_ - ( this.timeAsNumber_ % this.aMinute ));
		}
		throw Error('What time rounded you mean?');
	};
	
	Xdate.prototype.getTime = function() {
		return this.timeAsNumber_;
	};
	Xdate.prototype.isLaterThan = function( dt ) {
		var res = Xdate.compareTimes( this, dt );
		if ( res === 1) return true;
		return false;
	};
	Xdate.prototype.isEarlierThan = function( dt ) {
		var res = Xdate.compareTimes( this, dt );
		if ( res === -1 ) return true;
		return false;
	};
	Xdate.prototype.isEarlierOrSameThan = function( dt ) {
		if  (Xdate.compareTimes( this, dt ) === 1) return false;
		return true;
	};
	Xdate.prototype.getHours = function() {
		return Xdate.fillToTwoSimbols(this.date_.getHours());
	};
	Xdate.prototype.getMinutes = function() {
		return Xdate.fillToTwoSimbols(this.date_.getMinutes());
	};
	Xdate.prototype.getSeconds = function() {
		return Xdate.fillToTwoSimbols(this.date_.getSeconds());
	};
	
	Xdate.ROUNDERS = {
		PRIOR_FULL_HOUR: 0,
		PRIOR_FULL_MINUTE: 1
	};
	Xdate.CONST = {
		MILISECONDS: 1000,
		SECONDS: 60*1000,
		MINUTES: 60*60*1000,
		HOURS: 24*60*60*1000
	};
	Xdate.compareTimes = function( time1, time2 ) {
		time1 = Xdate.convertToXdate( time1 );
		time2 = Xdate.convertToXdate( time2 );

		if ( time1.getTime() > time2.getTime() ) return 1;
		if ( time2.getTime() > time1.getTime() ) return -1;
		return 0;
	};
	Xdate.convertToXdate = function( datetime ) {
		if ( datetime instanceof Xdate ) return datetime;
		return new Xdate( datetime );
	};
	Xdate.getTimeDifference = function( time1, time2 ) {
		time1 = Xdate.convertToXdate( time1 );
		time2 = Xdate.convertToXdate( time2 );
		return time2.getTime() - time1.getTime();
	};
	Xdate.getTimeDiffereceAsMinutes = function( time1, time2 ) {
		time1 = Xdate.convertToXdate( time1 );
		time2 = Xdate.convertToXdate( time2 );
		var difference = time1.getTime() - time2.getTime();
		return Math.floor( difference / Xdate.CONST.SECONDS );
	};
	Xdate.now = function() {
		return new Xdate( (new Date()).getTime() );
	};
	Xdate.fillToTwoSimbols = function( str ) {
		str = ''+str;
		if ( str.length < 2 ) {
			str = "0" + str;
		}
		return str;
	};
	return Xdate;
});
