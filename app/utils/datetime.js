define({
	getCurrentTime: function() {
		return (new Date()).getTime();
	},
	parseTime: function(epoch) {
		return new Date(parseInt(epoch));
	},
	fillMinutes: function(str) {
		str = ''+str;
		if ( str.length < 2 ) {
			str = '0' + str;
		}
		return str;
	},
	parseHoursFromDateTime: function( dt ) {
		dt = this.setAsDateTime( dt );
		var hours = dt.getHours( dt );
		hours = this.fillMinutes( hours.toString() );
		return hours;
	},
	setAsDateTime: function( dt ) {
		if ( ! (dt instanceof Date) ) {
			dt = this.parseTime( dt );
		}
		return dt;
	},
	parseMinutesFromDateTime: function( dt ) {
		dt = this.setAsDateTime( dt );
		
		var minutes = dt.getMinutes();
		minutes = this.fillMinutes( minutes.toString());
		return minutes;
	},
	parseSecondsFromDateTime: function( dt ) {
		dt = this.setAsDateTime( dt );
		
		var seconds = dt.getSconds();
		seconds = this.fillMinutes( seconds.toString());
		return seconds;
	},
	getParsedTime: function( dt, separator, opt_includeSeconds ) {
		if ( typeof separator != 'string') {
			separator = ':';
		}
		var result = '';
		var minutes = this.parseMinutesFromDateTime( dt );
		var hours = this.parseHoursFromDateTime( dt );
		result = hours + separator + minutes;
		if ( opt_includeSeconds === true ) {
			result = result + separator + this.parseSecondsFromDateTime( dt );
		}
		return result;
	},
    SECOND: 60,
    MINUTE: 3600,
    parseTimeFromSeconds: function( secs ) {
        var s = parseInt( secs, 10);
        var ostatuk;
        var seconds = s % this.SECOND;
        ostatuk = s - seconds;
        var minutes = parseInt( ostatuk / this.SECOND , 10);
        return this.fillMinutes(minutes) + ':' + this.fillMinutes(seconds);
    }
});
