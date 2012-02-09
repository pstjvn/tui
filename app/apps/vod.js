/**
 * @fileoverview Implements Sysmaster's VOD list
 */
define([
	'utils/listingapp'
], function(App){
	return new App({
		name: 'vod',
		canResume: true
	});
});
