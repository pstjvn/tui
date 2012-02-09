/**
 * @fileoverview Audio on demand implementation for Sysmaster's AOD 
 */
define([
	'utils/listingapp'
], function(App){
	return new App({
        
        /**
         * The app name should match the source names if automatic 
         * resource loading is to be used, otherwise any valid srting can be
         * used
         * @type {string}
         */
		name: 'aod',
		// Should jump is not used in the latest code, 
        // If the list type is list it will never jump
        // If the list type is mosaic it will always jump
		shouldJump: true
	});
});
