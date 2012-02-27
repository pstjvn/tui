/**
 * @fileoverview Implementation for Sysmaster's "PPV" listings
 */

define([
	'utils/listingapp'
], function(App){
	return {
		instance: null,
		init: function() {
			if (this.instance===null) this.instance = new App({
				name: 'ppv'
			});
			return this.instance;
		}
	};
});
