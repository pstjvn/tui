/**
 * @fileoverview Implements IPTV lists for Sysmaster's IPTV channels 
 * EPG lists are also supported in this implementation
 */

define([
	'utils/listwithepg',
	'data/static-strings'
], function(App, strings){
	return new App({
		name: 'iptv',
        
		/**
		 * Set this if you want static listing, otherwise the list type
         * that is selected by the user via system preferences will be used
		 */
//		listType: 'list',

//		Not used in the latest code
//		shouldJump: true,

		/**
		 * Hints can be used for each screen, however the panels should be
		 * globally allowed (in main.js)
		 */
		hints: {
			ok: strings.screens.iptv.panels.bottom.ok,
			info: strings.screens.iptv.panels.bottom.info,
			playPause: strings.screens.iptv.panels.bottom.playPause
		}
	});	
});
