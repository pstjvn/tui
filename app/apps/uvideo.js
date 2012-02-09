/**
 * @fileoverview Implement Sysmaster's user vide (basically DLNA browser 
 * with support for local storage (USB)
 */
define([
	'utils/listingapp'
], function(App){
	return new App({
		name: 'uservideo',
		/**
		 * This tells the app engine that the items in this screen support
		 * resuming when playing, useful for user provided videos and VOD
         * @type {boolean}
		 */
		canResume: true
	});
});
