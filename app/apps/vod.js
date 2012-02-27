/**
 * @fileoverview Implements Sysmaster's VOD list
 */
define([
	'utils/listingapp'
], function(App){
	return {
		instance: null,
		init: function() {
			if (this.instance === null ) this.instance = new App({
				name: 'vod',
				canResume: true
			});
			return this.instance;
		}
	};
});
