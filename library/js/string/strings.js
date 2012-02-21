/**
 * Include boilerplate for node with amdefine
 * This way the code can be tested on nodejs, i.e. faster and easier than
 * on the browser
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define({
	newLineToBr: function(string) {
		return string.replace(/(\r\n|\r|\n)/g, '<br>');
	}
});
