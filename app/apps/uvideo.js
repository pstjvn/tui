define([
	'utils/listingapp'
], function(App){
	return new App({
		name: 'uservideo',
//		shouldJump: true,
//		listType: 'list',
		/**
		 * This tells the app engine that the items in this screen support
		 * resuming when playing, useful for user provided videos and VOD
		 */
		canResume: true
	});
});
