define([
	'utils/listingapp'
], function(App){
	return new App({
		name: 'vod',
		/**
		 * See other app examples for docs on what those mean and how 
		 * to use them
		 */
//		shouldJump: true,
		canResume: true
//		,
//		usePagination: true
	});
});
