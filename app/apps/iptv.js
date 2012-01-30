define([
	'utils/listwithepg',
	'data/static-strings'
], function(App, strings){
	return new App({
		name: 'iptv'
//		,
		/**
		 * Set this if you want static listing, otherwise the system set will
		 * be used
		 */
//		listType: 'list',
		/** 
		 * Not used in the latest code, will be re-implemented later
		 */
//		shouldJump: true,
		/**
		 * Hints can be used for each screen, however the panels should be
		 * globally allowed (in main.js)
		 */
//		hints: {
//			ok: strings.screens.iptv.panels.bottom.ok,
//			info: strings.screens.iptv.panels.bottom.info,
//			playPause: strings.screens.iptv.panels.bottom.playPause
//		}
	});	
});
