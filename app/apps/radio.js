/**
 * @fileoverview Implementation for Sysmaster's Online Radio listings
 */

define([
	'utils/listingapp'
], function(App){
	return {
		instance: null,
		init: function() {
			if (this.instance === null ) this.instance = new App({
				name: 'radio'
			});
			return this.instance;
		}
	};
});
