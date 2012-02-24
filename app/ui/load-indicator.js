define([
	'ui/throbber',
	'data/static-strings'
], function(throbber, strings){
	return {
		show: function(text) {
			throbber.start({
				element: document.body,
				text: text || strings.common.initial_load_indication
			});
		},
		hide: function() {
			throbber.stop();
		}
	};
});
